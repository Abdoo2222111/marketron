import api from './api';
import type { PlatformKey } from '@/types/social';

export interface CreateInboxPayload {
  name: string;
  platform: PlatformKey;
  phoneNumber?: string;
  platformAccountId?: string;
}

export interface SendReplyPayload {
  text: string;
}

export const socialApi = {
  // Inboxes
  listInboxes: () => api.get('/social/inboxes'),
  createInbox: (payload: CreateInboxPayload) => api.post('/social/inboxes', payload),
  deleteInbox: (id: string) => api.delete(`/social/inboxes/${id}`),
  syncInbox: (id: string) => api.post(`/social/inboxes/${id}/sync`),

  // Messages
  listMessages: (params?: { platform?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/social/messages', { params }),
  markAsRead: (id: string) => api.patch(`/social/messages/${id}/read`),
  markAllAsRead: (inboxId?: string) => api.post('/social/messages/read-all', { inboxId }),
  sendReply: (messageId: string, payload: SendReplyPayload) =>
    api.post(`/social/messages/${messageId}/reply`, payload),

  // WhatsApp
  generateWhatsAppQR: (inboxId: string) => api.post(`/social/whatsapp/${inboxId}/qr`),
  getWhatsAppStatus: (inboxId: string) => api.get(`/social/whatsapp/${inboxId}/status`),

  // AI
  generateAiReply: (messageText: string, tone?: string) =>
    api.post('/social/ai-reply', { messageText, tone }),
};

export default socialApi;
