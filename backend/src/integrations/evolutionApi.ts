import axios, { AxiosInstance } from 'axios';
import {
  WHATSAPP_EVOLUTION_API_URL,
  WHATSAPP_EVOLUTION_API_KEY,
  WHATSAPP_DEFAULT_INSTANCE,
} from '../config';
import logger from '../utils/logger';

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

  // ── Instance Management ──────────────────────────────

  async createInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE, token?: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post('/instance/create', {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        ...(token && { token }),
        webhookUrl: '',
        webhookByEvents: false,
        webhookBase64: true,
        webhookEvents: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        rejectCall: false,
        alwaysOnline: true,
        readMessages: true,
      });
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
      const { data } = await this.client.get(`/instance/connect/${instanceName}`);
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
      const { data } = await this.client.get(`/instance/connectionState/${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution connectionState failed', { error: error.message });
      return { state: 'DISCONNECTED' };
    }
  }

  async restartInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    const { data } = await this.client.post('/instance/restart', { instanceName });
    return data;
  }

  async logout(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post(`/instance/logout/${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution logout failed', { error: error.message });
      throw error;
    }
  }

  async deleteInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    const { data } = await this.client.delete(`/instance/delete/${instanceName}`);
    return data;
  }

  async setPresence(instanceName: string, presence: 'available' | 'unavailable' | 'composing' | 'recording') {
    this.ensureEnabled();
    const { data } = await this.client.post(`/instance/setPresence/${instanceName}`, { presence });
    return data;
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
      const { data } = await this.client.post(`/message/sendText/${instanceName}`, {
        number,
        text,
        delay: options?.delay ?? 1200,
        linkPreview: options?.linkPreview ?? true,
        mentionsEveryOne: options?.mentionsEveryOne ?? false,
      });
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
      const { data } = await this.client.post(`/message/sendMedia/${instanceName}`, {
        number,
        mediatype: mediaType,
        media: mediaUrl,
        caption: caption || '',
        ...(fileName && { fileName }),
      });
      return data;
    } catch (error: any) {
      logger.error('Evolution sendMedia failed', { error: error.message, number });
      throw error;
    }
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
    const { data } = await this.client.post(`/message/sendButtons/${instanceName}`, {
      number,
      title,
      description,
      footer: footer || '',
      buttons,
    });
    return data;
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
    const { data } = await this.client.post(`/message/sendList/${instanceName}`, {
      number,
      title,
      description,
      buttonText,
      sections,
    });
    return data;
  }

  async sendReaction(instanceName: string, number: string, messageId: string, reaction: string) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/message/sendReaction/${instanceName}`, {
      number,
      reactionMessage: {
        key: { id: messageId, remoteJid: `${number}@s.whatsapp.net` },
        reaction,
      },
    });
    return data;
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
    const { data } = await this.client.post(`/message/sendLocation/${instanceName}`, {
      number,
      latitude,
      longitude,
      name: name || '',
      address: address || '',
    });
    return data;
  }

  // ── Chat ─────────────────────────────────────────────

  async fetchChats(instanceName: string) {
    this.ensureEnabled();
    const { data } = await this.client.get(`/chat/fetchChats/${instanceName}`);
    return data;
  }

  async fetchMessages(instanceName: string, remoteJid: string, page = 1, offset = 50) {
    this.ensureEnabled();
    const { data } = await this.client.get(
      `/chat/fetchMessages/${instanceName}?where.key.remoteJid=${encodeURIComponent(remoteJid)}&page=${page}&offset=${offset}`
    );
    return data;
  }

  async markAsRead(instanceName: string, remoteJid: string) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/chat/markAsRead/${instanceName}`, { remoteJid });
    return data;
  }

  // ── Groups ───────────────────────────────────────────

  async fetchAllGroups(instanceName: string) {
    this.ensureEnabled();
    const { data } = await this.client.get(`/group/fetchAllGroups/${instanceName}`);
    return data;
  }

  async createGroup(instanceName: string, name: string, participants: string[]) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/group/create/${instanceName}`, {
      name,
      participants: participants.map((p) => `${p}@s.whatsapp.net`),
    });
    return data;
  }

  async getInviteCode(instanceName: string, groupJid: string) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/group/inviteCode/${instanceName}`, { groupJid });
    return data;
  }

  // ── Webhook ──────────────────────────────────────────

  async setWebhook(
    instanceName: string,
    webhookUrl: string,
    events: string[] = ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
    webhookByEvents = true,
    webhookBase64 = true
  ) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/webhook/instance/${instanceName}`, {
      url: webhookUrl,
      webhook_by_events: webhookByEvents,
      webhook_base64: webhookBase64,
      events,
    });
    return data;
  }

  async findWebhook(instanceName: string) {
    this.ensureEnabled();
    const { data } = await this.client.get(`/webhook/find/${instanceName}`);
    return data;
  }

  // ── Profile ──────────────────────────────────────────

  async updateProfileName(instanceName: string, name: string) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/business/updateProfileName/${instanceName}`, { name });
    return data;
  }

  async updateProfileStatus(instanceName: string, status: string) {
    this.ensureEnabled();
    const { data } = await this.client.post(`/business/updateProfileStatus/${instanceName}`, { status });
    return data;
  }
}

export const evolutionApi = new EvolutionApiClient();
