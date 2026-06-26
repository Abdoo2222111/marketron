import api from './api';
import type { User, Campaign, Competitor, Invoice, Notification, TeamMember, PlatformConnection, BlogPost, MarketResearch, AIContent, AnalyticsMetric, ChartDataPoint, PricingPlan } from '@/types';

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: Partial<User> & { password: string }) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  getProfile: () => api.get<User>('/auth/me'),
  updateProfile: (data: Partial<User>) => api.put('/auth/me', data),
};

export const campaignService = {
  getAll: () => api.get<Campaign[]>('/campaigns'),
  getById: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
  create: (data: Partial<Campaign>) => api.post('/campaigns', data),
  update: (id: string, data: Partial<Campaign>) => api.put(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  getInsights: (id: string) => api.get(`/campaigns/${id}/insights`),
};

export const analyticsService = {
  getOverview: (period?: string) => api.get<{ metrics: AnalyticsMetric[]; chartData: ChartDataPoint[] }>('/analytics/overview', { params: { period } }),
  getAudience: () => api.get('/analytics/audience'),
  getTimePerformance: () => api.get('/analytics/timing'),
  getCostAnalysis: () => api.get('/analytics/cost'),
  getCustomReport: (params: Record<string, unknown>) => api.post('/analytics/custom', params),
};

export const contentService = {
  getImages: () => api.get('/content', { params: { type: 'image' } }),
  getVideos: () => api.get('/content', { params: { type: 'video' } }),
  getAdTexts: () => api.get('/content', { params: { type: 'ad' } }),
  uploadImage: (formData: FormData) => api.post('/content', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo: (formData: FormData) => api.post('/content', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  generateAI: (description: string) => api.post<AIContent>('/content/generate', { description }),
};

export const competitorService = {
  getAll: () => api.get<Competitor[]>('/competitors'),
  add: (data: { name: string; website?: string }) => api.post('/competitors', data),
  getById: (id: string) => api.get<Competitor>(`/competitors/${id}`),
  compare: (ids: string[]) => api.post('/competitors/compare', { ids }),
  getAds: (id: string) => api.get(`/competitors/${id}/ads`),
};

export const marketResearchService = {
  search: (product: string) => api.post<MarketResearch>('/market-research/analyze', { productName: product, country: 'global' }),
  getSWOT: (product: string) => api.post('/market-research/analyze', { productName: product, country: 'global' }),
  getRecommendations: (product: string, market: string) => api.post('/market-research/analyze', { productName: product, country: market }),
};

export const clientService = {
  getOverview: () => api.get('/client/overview'),
  getReports: () => api.get('/client/reports'),
  getInvoices: () => api.get<Invoice[]>('/client/invoices'),
  downloadReport: (id: string) => api.get(`/client/reports/${id}/download`, { responseType: 'blob' }),
};

export const settingsService = {
  getProfile: () => api.get<User>('/auth/me'),
  updateProfile: (data: Partial<User>) => api.put('/auth/me', data),
  getPlatforms: () => api.get<PlatformConnection[]>('/platforms'),
  connectPlatform: (platform: string, data: unknown) => api.post(`/platforms/${platform}`, data),
  disconnectPlatform: (platform: string) => api.delete(`/platforms/${platform}`),
  getTeam: () => api.get<TeamMember[]>('/team'),
  inviteMember: (data: { email: string; role: string }) => api.post('/team/invite', data),
  removeMember: (id: string) => api.delete(`/team/members/${id}`),
  getNotifications: () => api.get<Notification[]>('/notifications'),
  updateNotificationSettings: (data: Record<string, boolean>) => api.put('/notifications/settings', data),
  getBilling: () => api.get('/settings/billing'),
  updateBilling: (data: unknown) => api.put('/settings/billing', data),
  updateBranding: (data: { logo?: string; colors?: string[]; brandName?: string }) => api.put('/settings/branding', data),
};

export const dashboardService = {
  getOverview: (period?: string) => api.get('/analytics/overview', { params: { period } }),
  getTopCampaigns: () => api.get('/campaigns', { params: { limit: 5 } }),
  getNotifications: () => api.get<Notification[]>('/notifications'),
  getCalendarEvents: () => api.get('/campaigns'),
};

export const blogService = {
  getAll: () => api.get<BlogPost[]>('/blog'),
  getById: (id: string) => api.get<BlogPost>(`/blog/${id}`),
  getCategories: () => api.get('/blog/categories'),
};

export const pricingService = {
  getAll: () => api.get<PricingPlan[]>('/pricing'),
};

// ── Social Inbox ──────────────────────────────────────
export const socialInboxService = {
  getInboxes: () => api.get('/social/inboxes'),
  createInbox: (data: { name: string; platform: 'whatsapp' | 'messenger' | 'instagram'; phoneNumber?: string; platformAccountId?: string }) => api.post('/social/inboxes', data),
  getInbox: (id: string) => api.get(`/social/inboxes/${id}`),
  deleteInbox: (id: string) => api.delete(`/social/inboxes/${id}`),
  getMessages: (params?: { inboxId?: string; platform?: string; status?: string; page?: number; limit?: number }) => api.get('/social/messages', { params }),
  markAsRead: (id: string) => api.patch(`/social/messages/${id}/read`),
  markAllAsRead: (inboxId?: string) => api.post('/social/messages/read-all', { inboxId }),
  sendReply: (messageId: string, text: string) => api.post(`/social/messages/${messageId}/reply`, { text }),
  generateWhatsAppQR: (inboxId: string) => api.post(`/social/whatsapp/${inboxId}/qr`),
  getWhatsAppStatus: (inboxId: string) => api.get(`/social/whatsapp/${inboxId}/status`),
};

// ── AI Agents ─────────────────────────────────────────
export const aiAgentService = {
  getTypes: () => api.get('/ai-agents/types'),
  list: () => api.get('/ai-agents'),
  get: (id: string) => api.get(`/ai-agents/${id}`),
  create: (data: { name: string; type: string; description?: string; systemPrompt?: string }) => api.post('/ai-agents', data),
  update: (id: string, data: any) => api.put(`/ai-agents/${id}`, data),
  delete: (id: string) => api.delete(`/ai-agents/${id}`),
  sendMessage: (agentId: string, content: string) => api.post(`/ai-agents/${agentId}/chat`, { content }),
  getConversation: (agentId: string) => api.get(`/ai-agents/${agentId}/conversation`),
  clearConversation: (agentId: string) => api.delete(`/ai-agents/${agentId}/conversation`),
  getReplyRules: () => api.get('/ai-agents/reply-rules'),
  createReplyRule: (data: any) => api.post('/ai-agents/reply-rules', data),
  updateReplyRule: (ruleId: string, data: any) => api.put(`/ai-agents/reply-rules/${ruleId}`, data),
  deleteReplyRule: (ruleId: string) => api.delete(`/ai-agents/reply-rules/${ruleId}`),
};

// ── Workspace ──────────────────────────────────────────
export const workspaceService = {
  get: () => api.get('/workspace'),
  create: (data: any) => api.post('/workspace', data),
  update: (data: any) => api.put('/workspace', data),
  addClient: (data: { email: string; name: string; role?: string }) => api.post('/workspace/clients', data),
  removeClient: (clientId: string) => api.delete(`/workspace/clients/${clientId}`),
  getStats: () => api.get('/workspace/stats'),
};
