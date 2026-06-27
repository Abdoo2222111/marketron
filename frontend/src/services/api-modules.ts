import api from './api';

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  startDate?: string;
  endDate?: string;
}

export interface CampaignStats {
  total: number;
  active: number;
  paused: number;
  draft: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}

export const campaignsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; platform?: string }) =>
    api.get('/campaigns', { params }),
  get: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: Partial<Campaign>) => api.post('/campaigns', data),
  update: (id: string, data: Partial<Campaign>) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`),
  activate: (id: string) => api.post(`/campaigns/${id}/activate`),
  getStats: () => api.get('/campaigns/stats'),
  getInsights: (id: string) => api.get(`/campaigns/${id}/insights`),
};

export interface ContentItem {
  id: string;
  type: string;
  platform?: string;
  title?: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  createdAt: string;
}

export const contentApi = {
  list: (params?: { page?: number; limit?: number; type?: string; platform?: string }) =>
    api.get('/content', { params }),
  create: (data: Partial<ContentItem>) => api.post('/content', data),
  delete: (id: string) => api.delete(`/content/${id}`),
};

export interface Competitor {
  id: string;
  name: string;
  platform: string;
  platformUsername?: string;
  notes?: string;
  estimatedSpend?: number;
  activeAdsCount: number;
  lastAnalyzedAt?: string;
  createdAt: string;
}

export const competitorsApi = {
  list: () => api.get('/competitors'),
  create: (data: Partial<Competitor>) => api.post('/competitors', data),
  update: (id: string, data: Partial<Competitor>) => api.put(`/competitors/${id}`, data),
  delete: (id: string) => api.delete(`/competitors/${id}`),
  analyze: (id: string) => api.post(`/competitors/${id}/analyze`),
};

export interface AnalyticsOverview {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export const analyticsApi = {
  getOverview: () => api.get('/analytics/overview'),
  getCampaign: (id: string) => api.get(`/analytics/campaign/${id}`),
  getPlatform: (platform: string) => api.get(`/analytics/platform/${platform}`),
};

export interface MarketReport {
  id: string;
  productName: string;
  productCategory?: string;
  country: string;
  reportSummary?: string;
  reportData: any;
  createdAt: string;
}

export const marketApi = {
  list: () => api.get('/market-research/reports'),
  create: (data: { productName: string; country: string; productCategory?: string }) =>
    api.post('/market-research/analyze', data),
  get: (id: string) => api.get(`/market-research/reports/${id}`),
};

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export interface AiAgent {
  id: string;
  name: string;
  type: string;
  description?: string;
  systemPrompt?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  isActive: boolean;
  createdAt: string;
}

export const aiAgentsApi = {
  list: () => api.get('/ai-agents'),
  get: (id: string) => api.get(`/ai-agents/${id}`),
  create: (data: Partial<AiAgent>) => api.post('/ai-agents', data),
  update: (id: string, data: Partial<AiAgent>) => api.put(`/ai-agents/${id}`, data),
  delete: (id: string) => api.delete(`/ai-agents/${id}`),
  chat: (id: string, content: string) => api.post(`/ai-agents/${id}/chat`, { content }),
  getConversation: (id: string) => api.get(`/ai-agents/${id}/conversation`),
  clearConversation: (id: string) => api.delete(`/ai-agents/${id}/conversation`),
  getTypes: () => api.get('/ai-agents/types'),
  listRules: () => api.get('/ai-agents/reply-rules'),
  createRule: (data: any) => api.post('/ai-agents/reply-rules', data),
  updateRule: (id: string, data: any) => api.put(`/ai-agents/reply-rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/ai-agents/reply-rules/${id}`),
};

export interface SocialInbox {
  id: string;
  name: string;
  platform: string;
  phoneNumber?: string;
  platformAccountId?: string;
  isActive: boolean;
  createdAt: string;
}

export const socialApi = {
  listInboxes: () => api.get('/social/inboxes'),
  createInbox: (data: { name: string; platform: string; phoneNumber?: string; platformAccountId?: string }) =>
    api.post('/social/inboxes', data),
  deleteInbox: (id: string) => api.delete(`/social/inboxes/${id}`),
  syncInbox: (id: string) => api.post(`/social/inboxes/${id}/sync`),
  listMessages: (params?: { platform?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/social/messages', { params }),
  markAsRead: (id: string) => api.patch(`/social/messages/${id}/read`),
  sendReply: (messageId: string, text: string) => api.post(`/social/messages/${messageId}/reply`, { text }),
  generateAiReply: (messageText: string, tone = 'professional') =>
    api.post('/social/ai-reply', { messageText, tone }),
};

export const settingsApi = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data: any) => api.put('/settings/profile', data),
};

// ── Credits & Tokens ─────────────────────────────────────
export const creditsApi = {
  getBalance: () => api.get('/auth/credits/balance'),
  getStats: () => api.get('/auth/credits/stats'),
  getTransactions: () => api.get('/auth/credits/transactions'),
  purchase: (amount: number) => api.post('/auth/credits/purchase', { amount }),
};

// ── AI Providers ─────────────────────────────────────────
export interface AiProviderInfo {
  name: string;
  label: string;
  configured: boolean;
  models: string[];
}

export const aiProvidersApi = {
  list: () => api.get('/ai/providers'),
  generate: (data: { prompt: string; provider?: string; model?: string; systemPrompt?: string }) =>
    api.post('/ai/generate', data),
};

// ── Google OAuth ─────────────────────────────────────────
export const googleAuthApi = {
  getAuthUrl: () => api.get('/auth/google'),
  callback: (code: string) => api.post('/auth/google/callback', { code }),
};

// ── Platform Connections ─────────────────────────────────
export interface PlatformConnection {
  id: string;
  platform: string;
  platformAccountId: string;
  platformAccountName?: string;
  status: string;
  createdAt: string;
  tokenExpiresAt?: string | null;
}

export const platformsApi = {
  list: () => api.get('/platforms'),
  connectFacebook: (accessToken: string, pageId?: string) =>
    api.post('/platforms/facebook', { accessToken, pageId }),
  connectInstagram: (accessToken: string, accountId?: string) =>
    api.post('/platforms/instagram', { accessToken, accountId }),
  connectWhatsApp: (instanceName: string, phoneNumber?: string) =>
    api.post('/platforms/whatsapp', { instanceName, phoneNumber }),
  connectTelegram: (botToken: string) =>
    api.post('/platforms/telegram', { botToken }),
  disconnect: (platform: string) => api.delete(`/platforms/${platform}`),
  getWhatsAppQR: () => api.get('/platforms/whatsapp/qr'),
  getFacebookPages: () => api.get('/platforms/facebook/pages'),
  syncMessages: (platform: string) => api.post(`/platforms/${platform}/sync`),
  refreshToken: (platform: string) => api.post(`/platforms/${platform}/refresh`),
  sendMessage: (platform: string, recipientId: string, text: string) =>
    api.post(`/platforms/${platform}/send`, { recipientId, text }),
  getFacebookOAuthUrl: () => api.get('/platforms/facebook/oauth-url'),
};
