import axios, { AxiosInstance } from 'axios';
import {
  WHATSAPP_EVOLUTION_API_URL,
  WHATSAPP_EVOLUTION_API_KEY,
  WHATSAPP_DEFAULT_INSTANCE,
} from '../config';
import logger from '../utils/logger';

// ============================================================
// Evolution API Client — MULTI-DEVICE WHATSAPP
// هذا التكامل مربوط بـ Evolution API فقط (مش Meta Business API)
// كل الرسائل والـ Webhooks بتعدي من هنا
// ============================================================

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
      logger.info(`✅ Evolution API client initialized at ${WHATSAPP_EVOLUTION_API_URL}`);
    } else {
      logger.warn('⚠️ Evolution API not configured — WhatsApp features will be disabled');
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

  async createInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post('/instance/create', {
        instanceName,
        qrcode: true,
        number: '',
        token: '',
        integration: 'WHATSAPP-BAILEYS',
      });
      logger.info(`Evolution instance created: ${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution createInstance failed', { error: error.message });
      throw error;
    }
  }

  async connectInstance(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.get(`/instance/connect/${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution connectInstance failed', { error: error.message });
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

  async sendText(instanceName: string, phone: string, text: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post(`/message/sendText/${instanceName}`, {
        number: phone,
        text,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: true,
        },
      });
      logger.info(`WhatsApp message sent to ${phone}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution sendText failed', { error: error.message, phone });
      throw error;
    }
  }

  async sendMedia(instanceName: string, phone: string, mediaUrl: string, caption?: string, mediaType: 'image' | 'video' | 'audio' | 'document' = 'image') {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post(`/message/sendMedia/${instanceName}`, {
        number: phone,
        mediatype: mediaType,
        media: mediaUrl,
        caption,
      });
      return data;
    } catch (error: any) {
      logger.error('Evolution sendMedia failed', { error: error.message, phone });
      throw error;
    }
  }

  async logout(instanceName: string = WHATSAPP_DEFAULT_INSTANCE) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.delete(`/instance/logout/${instanceName}`);
      return data;
    } catch (error: any) {
      logger.error('Evolution logout failed', { error: error.message });
      throw error;
    }
  }
}

export const evolutionApi = new EvolutionApiClient();
