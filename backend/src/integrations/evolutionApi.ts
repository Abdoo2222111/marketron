import axios, { AxiosInstance } from 'axios';
import {
  WHATSAPP_EVOLUTION_API_URL,
  WHATSAPP_EVOLUTION_API_KEY,
  WHATSAPP_DEFAULT_INSTANCE,
} from '../config';
import logger from '../utils/logger';

export const EVOLUTION_WEBHOOK_EVENTS = {
  MESSAGES_UPSERT: 'MESSAGES_UPSERT',
  MESSAGES_DELETE: 'MESSAGES_DELETE',
  MESSAGES_UPDATE: 'MESSAGES_UPDATE',
  CONNECTION_UPDATE: 'CONNECTION_UPDATE',
  QRCODE_UPDATED: 'QRCODE_UPDATED',
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',
  GROUPS_UPSERT: 'GROUPS_UPSERT',
  GROUP_UPDATE: 'GROUP_UPDATE',
  GROUP_PARTICIPANTS_UPDATE: 'GROUP_PARTICIPANTS_UPDATE',
  CALL: 'CALL',
  SEND_MESSAGE: 'SEND_MESSAGE',
  TYPE: 'TYPE',
  ERROR: 'ERROR',
} as const;

export type EvolutionWebhookEvent = (typeof EVOLUTION_WEBHOOK_EVENTS)[keyof typeof EVOLUTION_WEBHOOK_EVENTS];

const ALL_WEBHOOK_EVENTS = Object.values(EVOLUTION_WEBHOOK_EVENTS);

interface BulkMessage {
  number: string;
  text: string;
  options?: {
    delay?: number;
    linkPreview?: boolean;
    mentionsEveryOne?: boolean;
  };
}

class EvolutionApiClient {
  private client: AxiosInstance;
  private enabled: boolean;

  constructor() {
    this.enabled = !!(WHATSAPP_EVOLUTION_API_URL && WHATSAPP_EVOLUTION_API_KEY);
    this.client = axios.create({
      baseURL: WHATSAPP_EVOLUTION_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': WHATSAPP_EVOLUTION_API_KEY,
      },
      timeout: 30000,
    });
    if (this.enabled) {
      logger.info(`Evolution API client initialized at ${WHATSAPP_EVOLUTION_API_URL}`);
    } else {
      logger.warn('Evolution API not configured — WhatsApp features will be disabled');
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getConfig() {
    return {
      enabled: this.enabled,
      url: WHATSAPP_EVOLUTION_API_URL,
      defaultInstance: WHATSAPP_DEFAULT_INSTANCE,
      keySet: !!WHATSAPP_EVOLUTION_API_KEY,
    };
  }

  private ensureEnabled() {
    if (!this.enabled) {
      throw new Error('Evolution API not configured. Set WHATSAPP_EVOLUTION_API_URL and WHATSAPP_EVOLUTION_API_KEY in .env');
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, methodName: string, maxRetries = 2): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'unknown error';
        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt);
          logger.warn(`EvolutionApi.${methodName} [attempt ${attempt + 1}/${maxRetries + 1}] failed: ${msg}, retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    const msg = lastError?.response?.data?.message || lastError?.response?.data?.error || lastError?.message || 'unknown error';
    logger.error(`EvolutionApi.${methodName} failed after ${maxRetries + 1} attempts: ${msg}`);
    throw lastError;
  }

  // ── Instance Management ──────────────────────────────

  async createInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE, token?: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post('/instance/create', {
            instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
            ...(token && { token }),
            webhookUrl: '',
            webhookByEvents: false,
            webhookBase64: true,
            webhookEvents: [
              EVOLUTION_WEBHOOK_EVENTS.MESSAGES_UPSERT,
              EVOLUTION_WEBHOOK_EVENTS.CONNECTION_UPDATE,
              EVOLUTION_WEBHOOK_EVENTS.QRCODE_UPDATED,
            ],
            rejectCall: false,
            alwaysOnline: true,
            readMessages: true,
          }),
        'createInstance'
      );
      logger.info(`Evolution instance created: ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      logger.error(`Evolution createInstance failed: ${msg}`);
      throw error;
    }
  }

  async connectInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/instance/connect/${instanceName}`),
        'connectInstance'
      );
      logger.info(`Evolution connectInstance: ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution connectInstance failed: ${msg}`);
      throw error;
    }
  }

  async getConnectionState(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/instance/connectionState/${instanceName}`),
        'getConnectionState'
      );
      return data;
    } catch (error: any) {
      logger.error('Evolution connectionState failed', { error: error.message });
      return { state: 'DISCONNECTED' };
    }
  }

  async restartInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post('/instance/restart', { instanceName }),
        'restartInstance'
      );
      logger.info(`Evolution instance restarted: ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution restartInstance failed: ${msg}`);
      throw error;
    }
  }

  async logout(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/instance/logout/${instanceName}`),
        'logout'
      );
      logger.info(`Evolution logout: ${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution logout failed', { error: error.message });
      throw error;
    }
  }

  async deleteInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.delete(`/instance/delete/${instanceName}`),
        'deleteInstance'
      );
      logger.info(`Evolution instance deleted: ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution deleteInstance failed: ${msg}`);
      throw error;
    }
  }

  async setPresence(instanceName: string, presence: 'available' | 'unavailable' | 'composing' | 'recording') {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/instance/setPresence/${instanceName}`, { presence }),
        'setPresence'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution setPresence failed: ${msg}`);
      throw error;
    }
  }

  async setTyping(instanceName: string, to: string, typing: boolean) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/instance/setPresence/${instanceName}`, {
            presence: typing ? 'composing' : 'paused',
            to: `${to}@s.whatsapp.net`,
          }),
        'setTyping'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution setTyping failed: ${msg}`);
      throw error;
    }
  }

  async checkNumber(instanceName: string, number: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/instance/checkNumber/${instanceName}?number=${encodeURIComponent(number)}`),
        'checkNumber'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error(`Evolution checkNumber failed: ${msg}`);
      throw error;
    }
  }

  // ── Messaging ────────────────────────────────────────

  async sendText(
    instanceName: string,
    number: string,
    text: string,
    options?: { delay?: number; linkPreview?: boolean; mentionsEveryOne?: boolean }
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendText/${instanceName}`, {
            number,
            text,
            delay: options?.delay ?? 1200,
            linkPreview: options?.linkPreview ?? true,
            mentionsEveryOne: options?.mentionsEveryOne ?? false,
          }),
        'sendText'
      );
      logger.info(`WhatsApp text sent to ${number} via ${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution sendText failed', { error: error.message, number });
      throw error;
    }
  }

  async sendMedia(
    instanceName: string,
    number: string,
    mediaUrl: string,
    caption?: string,
    mediaType: 'image' | 'video' | 'audio' | 'document' = 'image',
    fileName?: string
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendMedia/${instanceName}`, {
            number,
            mediatype: mediaType,
            media: mediaUrl,
            caption: caption || '',
            ...(fileName && { fileName }),
          }),
        'sendMedia'
      );
      logger.info(`WhatsApp ${mediaType} sent to ${number} via ${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution sendMedia failed', { error: error.message, number });
      throw error;
    }
  }

  async sendMediaMessage(
    instanceName: string,
    number: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'audio' | 'document',
    caption?: string,
    fileName?: string
  ) {
    return this.sendMedia(instanceName, number, mediaUrl, caption, mediaType, fileName);
  }

  async sendButtons(
    instanceName: string,
    number: string,
    title: string,
    description: string,
    buttons: { type: string; displayText: string; id: string }[],
    footer?: string
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendButtons/${instanceName}`, {
            number,
            title,
            description,
            footer: footer || '',
            buttons,
          }),
        'sendButtons'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution sendButtons failed', { error: msg, number });
      throw error;
    }
  }

  async sendList(
    instanceName: string,
    number: string,
    title: string,
    description: string,
    buttonText: string,
    sections: { title: string; rows: { title: string; description?: string; rowId: string }[] }[]
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendList/${instanceName}`, {
            number,
            title,
            description,
            buttonText,
            sections,
          }),
        'sendList'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution sendList failed', { error: msg, number });
      throw error;
    }
  }

  async sendReaction(instanceName: string, number: string, messageId: string, reaction: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendReaction/${instanceName}`, {
            number,
            reactionMessage: {
              key: { id: messageId, remoteJid: `${number}@s.whatsapp.net` },
              reaction,
            },
          }),
        'sendReaction'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution sendReaction failed', { error: msg, number });
      throw error;
    }
  }

  async sendLocation(
    instanceName: string,
    number: string,
    latitude: number,
    longitude: number,
    name?: string,
    address?: string
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/message/sendLocation/${instanceName}`, {
            number,
            latitude,
            longitude,
            name: name || '',
            address: address || '',
          }),
        'sendLocation'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution sendLocation failed', { error: msg, number });
      throw error;
    }
  }

  // ── Chat ─────────────────────────────────────────────

  async fetchChats(instanceName: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/chat/fetchChats/${instanceName}`),
        'fetchChats'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution fetchChats failed', { error: msg });
      throw error;
    }
  }

  async fetchMessages(instanceName: string, remoteJid: string, page = 1, offset = 50) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.get(
            `/chat/fetchMessages/${instanceName}?where.key.remoteJid=${encodeURIComponent(remoteJid)}&page=${page}&offset=${offset}`
          ),
        'fetchMessages'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution fetchMessages failed', { error: msg });
      throw error;
    }
  }

  async markAsRead(instanceName: string, remoteJid: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/chat/markAsRead/${instanceName}`, { remoteJid }),
        'markAsRead'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution markAsRead failed', { error: msg });
      throw error;
    }
  }

  // ── Groups ───────────────────────────────────────────

  async fetchAllGroups(instanceName: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/group/fetchAllGroups/${instanceName}`),
        'fetchAllGroups'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution fetchAllGroups failed', { error: msg });
      throw error;
    }
  }

  async createGroup(instanceName: string, name: string, participants: string[]) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/group/create/${instanceName}`, {
            name,
            participants: participants.map((p) => `${p}@s.whatsapp.net`),
          }),
        'createGroup'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution createGroup failed', { error: msg });
      throw error;
    }
  }

  async getInviteCode(instanceName: string, groupJid: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/group/inviteCode/${instanceName}`, { groupJid }),
        'getInviteCode'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution getInviteCode failed', { error: msg });
      throw error;
    }
  }

  async getGroupMetadata(instanceName: string, groupId: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/group/groupMetadata/${instanceName}`, { groupJid: groupId }),
        'getGroupMetadata'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution getGroupMetadata failed', { error: msg });
      throw error;
    }
  }

  async acceptGroupInvite(instanceName: string, inviteCode: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/group/acceptInvite/${instanceName}`, { code: inviteCode }),
        'acceptGroupInvite'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution acceptGroupInvite failed', { error: msg });
      throw error;
    }
  }

  // ── Contacts ─────────────────────────────────────────

  async getProfilePicture(instanceName: string, number: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/chat/getProfilePicture/${instanceName}?number=${encodeURIComponent(number)}`),
        'getProfilePicture'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution getProfilePicture failed', { error: msg });
      throw error;
    }
  }

  // ── Webhook ──────────────────────────────────────────

  async setWebhook(
    instanceName: string,
    webhookUrl: string,
    events: string[] = [
      EVOLUTION_WEBHOOK_EVENTS.MESSAGES_UPSERT,
      EVOLUTION_WEBHOOK_EVENTS.CONNECTION_UPDATE,
      EVOLUTION_WEBHOOK_EVENTS.QRCODE_UPDATED,
    ],
    webhookByEvents = true,
    webhookBase64 = true
  ) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () =>
          this.client.post(`/webhook/instance/${instanceName}`, {
            url: webhookUrl,
            webhook_by_events: webhookByEvents,
            webhook_base64: webhookBase64,
            events,
          }),
        'setWebhook'
      );
      logger.info(`Evolution webhook set for ${instanceName}: ${webhookUrl}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution setWebhook failed', { error: msg });
      throw error;
    }
  }

  async findWebhook(instanceName: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.get(`/webhook/find/${instanceName}`),
        'findWebhook'
      );
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution findWebhook failed', { error: msg });
      throw error;
    }
  }

  // ── Profile ──────────────────────────────────────────

  async updateProfileName(instanceName: string, name: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/business/updateProfileName/${instanceName}`, { name }),
        'updateProfileName'
      );
      logger.info(`Evolution profile name updated for ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution updateProfileName failed', { error: msg });
      throw error;
    }
  }

  async updateProfileStatus(instanceName: string, status: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.withRetry(
        () => this.client.post(`/business/updateProfileStatus/${instanceName}`, { status }),
        'updateProfileStatus'
      );
      logger.info(`Evolution profile status updated for ${instanceName}`);
      return data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      logger.error('Evolution updateProfileStatus failed', { error: msg });
      throw error;
    }
  }

  // ── Batch Operations ─────────────────────────────────

  async sendBulkMessages(
    instanceName: string,
    messages: BulkMessage[],
    concurrency = 5
  ): Promise<{
    success: boolean;
    results: { number: string; success: boolean; error?: string }[];
    sent: number;
    failed: number;
    total: number;
  }> {
    this.ensureEnabled();
    const results: { number: string; success: boolean; error?: string }[] = [];
    let index = 0;

    const worker = async () => {
      while (index < messages.length) {
        const i = index++;
        const msg = messages[i];
        try {
          await this.sendText(instanceName, msg.number, msg.text, msg.options);
          results.push({ number: msg.number, success: true });
        } catch (error: any) {
          results.push({ number: msg.number, success: false, error: error.message || 'unknown error' });
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, messages.length) }, () => worker());
    await Promise.all(workers);

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.info(`EvolutionApi.sendBulkMessages: ${sent} sent, ${failed} failed out of ${messages.length} total`);
    return { success: failed === 0, results, sent, failed, total: messages.length };
  }

  // ── Utility ──────────────────────────────────────────

  getWebhookEvents() {
    return ALL_WEBHOOK_EVENTS;
  }
}

export const evolutionApi = new EvolutionApiClient();
