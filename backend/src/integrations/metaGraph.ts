import axios, { AxiosInstance } from 'axios';
import {
  META_PAGE_ACCESS_TOKEN,
  META_API_VERSION,
  INSTAGRAM_BUSINESS_ACCOUNT_ID,
} from '../config';
import logger from '../utils/logger';

class MetaGraphClient {
  private client: AxiosInstance;
  private enabled: boolean;

  constructor() {
    this.enabled = !!META_PAGE_ACCESS_TOKEN;
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${META_API_VERSION}`,
      timeout: 30000,
    });
  }

  isEnabled() {
    return this.enabled;
  }

  private ensureEnabled() {
    if (!this.enabled) {
      throw new Error('Meta Page Access Token not configured');
    }
  }

  private get params() {
    return { access_token: META_PAGE_ACCESS_TOKEN };
  }

  async getPageInfo(pageId: string = 'me') {
    this.ensureEnabled();
    try {
      const { data } = await this.client.get(`/${pageId}`, {
        params: {
          ...this.params,
          fields: 'id,name,access_token',
        },
      });
      return data;
    } catch (error: any) {
      logger.error('Meta getPageInfo failed', { error: error.message });
      throw error;
    }
  }

  async getConversations(pageId: string = 'me') {
    this.ensureEnabled();
    try {
      const { data } = await this.client.get(`/${pageId}/conversations`, {
        params: {
          ...this.params,
          fields: 'id,link,updated_time,message_count,unread_count,senders,messages{id,created_time,from,to,message,sticker,attachments}',
          limit: 50,
        },
      });
      return data.data || [];
    } catch (error: any) {
      logger.error('Meta getConversations failed', { error: error.message });
      throw error;
    }
  }

  async sendMessage(recipientId: string, message: string, pageId: string = 'me') {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post(`/${pageId}/messages`, {
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: { text: message },
        access_token: META_PAGE_ACCESS_TOKEN,
      });
      logger.info(`Meta message sent to ${recipientId}`);
      return data;
    } catch (error: any) {
      logger.error('Meta sendMessage failed', { error: error.message, recipientId });
      throw error;
    }
  }

  async sendInstagramMessage(recipientIgId: string, message: string) {
    this.ensureEnabled();
    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      throw new Error('INSTAGRAM_BUSINESS_ACCOUNT_ID not configured');
    }
    try {
      const { data } = await this.client.post(`/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages`, {
        recipient: { id: recipientIgId },
        message: { text: message },
        access_token: META_PAGE_ACCESS_TOKEN,
      });
      logger.info(`Instagram message sent to ${recipientIgId}`);
      return data;
    } catch (error: any) {
      logger.error('Meta sendInstagramMessage failed', { error: error.message, recipientIgId });
      throw error;
    }
  }

  async getInstagramMessages() {
    this.ensureEnabled();
    if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      throw new Error('INSTAGRAM_BUSINESS_ACCOUNT_ID not configured');
    }
    try {
      const { data } = await this.client.get(`/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/messages`, {
        params: {
          ...this.params,
          fields: 'id,created_time,from,to,message',
        },
      });
      return data.data || [];
    } catch (error: any) {
      logger.error('Meta getInstagramMessages failed', { error: error.message });
      throw error;
    }
  }

  async sendCommentReply(commentId: string, message: string) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post(`/${commentId}/replies`, {
        message,
        access_token: META_PAGE_ACCESS_TOKEN,
      });
      return data;
    } catch (error: any) {
      logger.error('Meta sendCommentReply failed', { error: error.message });
      throw error;
    }
  }
}

export const metaGraph = new MetaGraphClient();
