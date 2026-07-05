import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

class TelegramApiClient {
  private client: AxiosInstance;
  private botToken: string;
  private enabled: boolean;

  constructor() {
    this.botToken = config.telegram.botToken;
    this.enabled = !!this.botToken;
    this.client = axios.create({
      baseURL: `https://api.telegram.org/bot${this.botToken}`,
      timeout: 15000,
    });
    if (this.enabled) {
      logger.info('Telegram Bot API client initialized');
    } else {
      logger.warn('Telegram Bot Token not configured — Telegram features disabled');
    }
  }

  isEnabled() {
    return this.enabled;
  }

  private ensureEnabled() {
    if (!this.enabled) {
      throw new Error('Telegram Bot Token not configured. Set TELEGRAM_BOT_TOKEN in .env');
    }
  }

  async getMe() {
    this.ensureEnabled();
    const { data } = await this.client.get('/getMe');
    return data;
  }

  async sendMessage(chatId: string | number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    disable_web_page_preview?: boolean;
    disable_notification?: boolean;
    reply_to_message_id?: number;
  }) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post('/sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'HTML',
        disable_web_page_preview: options?.disable_web_page_preview ?? true,
        disable_notification: options?.disable_notification ?? false,
        reply_to_message_id: options?.reply_to_message_id,
      });
      logger.info(`Telegram message sent to ${chatId}`);
      return data;
    } catch (error: any) {
      logger.error('Telegram sendMessage failed', { error: error.message, chatId });
      throw error;
    }
  }

  async setWebhook(webhookUrl: string, options?: {
    max_connections?: number;
    allowed_updates?: string[];
    secret_token?: string;
  }) {
    this.ensureEnabled();
    try {
      const { data } = await this.client.post('/setWebhook', {
        url: webhookUrl,
        max_connections: options?.max_connections || 40,
        allowed_updates: options?.allowed_updates || ['message', 'callback_query'],
        secret_token: options?.secret_token,
        drop_pending_updates: true,
      });
      logger.info(`Telegram webhook set to ${webhookUrl}`);
      return data;
    } catch (error: any) {
      logger.error('Telegram setWebhook failed', { error: error.message });
      throw error;
    }
  }

  async deleteWebhook() {
    this.ensureEnabled();
    const { data } = await this.client.post('/deleteWebhook', { drop_pending_updates: true });
    return data;
  }

  async getWebhookInfo() {
    this.ensureEnabled();
    const { data } = await this.client.get('/getWebhookInfo');
    return data;
  }

  async getChat(chatId: string | number) {
    this.ensureEnabled();
    const { data } = await this.client.post('/getChat', { chat_id: chatId });
    return data;
  }

  async getChatMember(chatId: string | number, userId: number) {
    this.ensureEnabled();
    const { data } = await this.client.post('/getChatMember', { chat_id: chatId, user_id: userId });
    return data;
  }

  async sendChatAction(chatId: string | number, action: 'typing' | 'upload_photo' | 'record_video' | 'upload_video' | 'record_audio' | 'upload_audio' | 'upload_document' | 'find_location') {
    this.ensureEnabled();
    await this.client.post('/sendChatAction', { chat_id: chatId, action });
  }

  get botUsername(): string {
    return this.botToken.split(':')[0] || '';
  }
}

export const telegramApi = new TelegramApiClient();
