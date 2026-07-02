import api from './api';

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'draft' | 'completed' | 'draft_pending_approval' | 'approved' | 'published';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  objective?: string;
  dailyBudget?: number;
  startDate?: string;
  endDate?: string;
  targetCountry?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: string;
  interests?: string[];
  adCreative?: Record<string, any>;
  description?: string;
  createdAt: string;
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
  provider?: string;
  model?: string;
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
  chat: (id: string, body: { content: string; provider?: string; model?: string }) => api.post(`/ai-agents/${id}/chat`, body),
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
  getAiProviders: () => api.get('/settings/ai-providers'),
  upsertAiProvider: (provider: string, data: { apiKey: string; baseUrl?: string; defaultModel?: string; isActive?: boolean }) =>
    api.put(`/settings/ai-providers/${provider}`, data),
  deleteAiProvider: (provider: string) => api.delete(`/settings/ai-providers/${provider}`),
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

export interface AiGenerationResult {
  text: string;
  provider: string;
  model: string;
  tokensUsed: number;
}

export interface AiAdTextResult {
  headline: string;
  mainText: string;
  cta: string;
  variations: string[];
}

export interface AiImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  altText: string;
  style: string;
  variations: string[];
}

export interface AiAnalysisResult {
  campaignName: string;
  overallPerformance: string;
  metrics: { impressions: number; clicks: number; conversions: number; spend: number; ctr: number; cpc: number; roas: number };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AiRecommendationResult {
  general: Array<{ title: string; description: string; priority: string; expectedImpact: string }>;
  platformSpecific: string[];
}

export const aiProvidersApi = {
  list: () => api.get('/ai/providers'),
  generate: (data: { prompt: string; provider?: string; model?: string; systemPrompt?: string; temperature?: number; maxTokens?: number }) =>
    api.post('/ai/generate', data),
  getHistory: () => api.get('/ai/history'),
  generateAdText: (data: { prompt: string; platform?: string; tone?: string; language?: string }) =>
    api.post('/ai/generate-text', data),
  generateImage: (data: { prompt: string; style?: string; platform?: string }) =>
    api.post('/ai/generate-image', data),
  analyzeCampaign: (campaignId: string) =>
    api.post('/ai/analyze-campaign', { campaignId }),
  getRecommendations: (data?: { campaignId?: string; platform?: string }) =>
    api.post('/ai/recommend', data || {}),
  whyNotSelling: (data: { product: string; country: string; campaignId?: string }) =>
    api.post('/ai/why-not-selling', data),
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

// ── V2: Organizations & Onboarding ────────────────────
export interface Organization {
  id: string;
  name: string;
  domainSlug?: string;
  mode: string;
  businessProfile?: BusinessProfile;
  personaConfig?: PersonaConfig;
  _count?: { users: number; campaigns: number; conversations: number };
}

export interface BusinessProfile {
  id: string;
  organizationId: string;
  industry?: string;
  productsServices?: string;
  priceRange?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  faqs?: string;
  sourceUrl?: string;
  enrichedByAi: boolean;
}

export interface PersonaConfig {
  id: string;
  organizationId: string;
  agentName?: string;
  greetingMessage?: string;
  escalationRules?: string;
  activeMode: string;
}

export const organizationsApi = {
  list: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; domainSlug?: string; mode?: string }) => api.post('/organizations', data),
  update: (id: string, data: any) => api.put(`/organizations/${id}`, data),
  getBusinessProfile: (id: string) => api.get(`/organizations/${id}/business-profile`),
  updateBusinessProfile: (id: string, data: any) => api.put(`/organizations/${id}/business-profile`, data),
  getPersonaConfig: (id: string) => api.get(`/organizations/${id}/persona`),
  updatePersonaConfig: (id: string, data: any) => api.put(`/organizations/${id}/persona`, data),
};

export const onboardingApi = {
  start: (data: { name?: string; industry?: string; productsServices?: string; sourceUrl?: string; domainSlug?: string }) =>
    api.post('/onboarding/start', data),
  step2: (data: { productsServices?: string[]; priceRange?: string; targetAudience?: any; toneOfVoice?: string; faqs?: any[] }) =>
    api.post('/onboarding/step-2', data),
  step3: (data: { sourceUrl?: string }) => api.post('/onboarding/step-3', data),
  step4: (data: { agentName?: string; greetingMessage?: string; activeMode?: string }) =>
    api.post('/onboarding/step-4', data),
  status: () => api.get('/onboarding/status'),
};

// ── V2: Conversations & Messages ─────────────────────
export interface Conversation {
  id: string;
  organizationId: string;
  customerName?: string;
  customerPhone?: string;
  status: string;
  lastMessageAt?: string;
  _count?: { messages: number };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  direction: string;
  senderType: string;
  content: string;
  aiConfidenceScore?: number;
  createdAt: string;
}

export const conversationsApi = {
  list: (params?: { status?: string }) => api.get('/conversations', { params }),
  get: (id: string) => api.get(`/conversations/${id}`),
  create: (data: { content: string; customerPhone?: string; customerName?: string }) => api.post('/conversations', data),
  generateAiReply: (id: string) => api.post(`/conversations/${id}/ai-reply`),
  resolve: (id: string) => api.post(`/conversations/${id}/resolve`),
};

// ── V2: Sandbox / AI Brain ───────────────────────────
export const sandboxApi = {
  chat: (data: { message: string; history?: { role: string; content: string }[]; provider?: string; model?: string }) =>
    api.post('/sandbox/chat', data),
  generateCampaignDraft: (brief: string) => api.post('/sandbox/campaign-draft', { brief }),
  enrich: (url: string) => api.post('/sandbox/enrich', { url }),
};

// ── BYOK (Bring Your Own Key) ──────────────────────────
export interface ApiKeyVaultRecord {
  id: string;
  provider: string;
  label?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefaultForType?: 'text' | 'image' | 'audio' | null;
  status: string;
  lastUsedAt?: string;
  createdAt: string;
}

export const apiKeysApi = {
  list: () => api.get<{ success: boolean; data: ApiKeyVaultRecord[] }>('/api-keys'),
  upsert: (provider: string, data: { apiKey: string; baseUrl?: string; defaultModel?: string; label?: string; isDefaultForType?: string }) =>
    api.put<{ success: boolean; data: ApiKeyVaultRecord }>(`/api-keys/${provider}`, data),
  delete: (id: string) => api.delete(`/api-keys/${id}`),
  test: (provider: string, apiKey: string, baseUrl?: string) =>
    api.post<{ success: boolean; data: { valid: boolean; error?: string } }>('/api-keys/test', { provider, apiKey, baseUrl }),
};

// ── Personas ────────────────────────────────────────────
export interface PersonaDefinition {
  section: string;
  name: string;
  emoji: string;
  category: string;
  systemPrompt: string;
  customPrompt: string;
  defaultTemperature: number;
  isCustomized: boolean;
}

export interface PersonaCustomization {
  section: string;
  customPrompt: string;
}

export const personasApi = {
  list: () => api.get<{ success: boolean; data: PersonaDefinition[] }>('/personas'),
  get: (section: string) => api.get<{ success: boolean; data: PersonaDefinition }>(`/personas/${section}`),
  update: (section: string, customPrompt: string) =>
    api.put<{ success: boolean; data: PersonaDefinition; message: string }>(`/personas/${section}`, { customPrompt }),
  reset: (section: string) => api.delete<{ success: boolean; data: PersonaDefinition; message: string }>(`/personas/${section}`),
};

// ── Engine Router (unified AI generation) ──────────────
export const engineApi = {
  generate: (data: { section: string; prompt: string; type: 'text' | 'image' | 'audio' | 'video' | 'embedding' | 'vision'; model?: string; temperature?: number; maxTokens?: number; size?: string; extraParams?: Record<string, any> }) =>
    api.post('/engine/generate', data),
};

// ── Pollinations Rich AI (Image / Video / Audio / Vision / Embeddings) ──
export interface PollinationsImageResult {
  images: Array<{ url: string; b64_json?: string }>;
  model: string;
}

export interface PollinationsVideoResult {
  videoUrl: string;
  model: string;
}

export interface PollinationsAudioResult {
  audioUrl: string;
  audioBase64?: string;
  model: string;
  duration: number;
}

export interface PollinationsTranscriptionResult {
  text: string;
  model: string;
  duration: number;
}

export interface PollinationsEmbeddingResult {
  embeddings: number[][];
  model: string;
  tokensUsed: number;
}

export interface PollinationsVisionResult {
  text: string;
  model: string;
}

export interface PollinationsModelInfo {
  id: string;
  input_modalities: string[];
  output_modalities: string[];
  supported_endpoints: string[];
  tools?: boolean;
  reasoning?: boolean;
  context_length?: number;
}

export const pollinationsApi = {
  listModels: () => api.get('/pollinations/models'),
  generateImage: (data: { prompt: string; model?: string; negativePrompt?: string; size?: string; n?: number; quality?: 'standard' | 'hd'; style?: 'vivid' | 'natural' }) =>
    api.post<{ success: boolean; data: PollinationsImageResult }>('/pollinations/image', data),
  generateVideo: (data: { prompt: string; model?: string; imageUrl?: string; size?: string }) =>
    api.post<{ success: boolean; data: PollinationsVideoResult }>('/pollinations/video', data),
  generateAudio: (data: { text: string; model?: string; voice?: string; format?: 'mp3' | 'wav' | 'ogg' }) =>
    api.post<{ success: boolean; data: PollinationsAudioResult }>('/pollinations/audio', data),
  transcribe: (data: { audio: string; model?: string; language?: string; filename?: string }) =>
    api.post<{ success: boolean; data: PollinationsTranscriptionResult }>('/pollinations/transcribe', data),
  generateEmbeddings: (data: { input: string | string[]; model?: string; dimensions?: number }) =>
    api.post<{ success: boolean; data: PollinationsEmbeddingResult }>('/pollinations/embeddings', data),
  analyzeImage: (data: { imageUrl: string; prompt?: string; model?: string }) =>
    api.post<{ success: boolean; data: PollinationsVisionResult }>('/pollinations/vision', data),
};

// ── Platform Tokens (Ad Platform API Keys) ───────────
export interface PlatformToken {
  id: string;
  platform: string;
  label: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  status: string;
  metadata?: any;
  createdAt: string;
}

export const platformTokensApi = {
  list: () => api.get<{ success: boolean; data: PlatformToken[] }>('/platform-tokens'),
  upsert: (platform: string, data: { accessToken: string; refreshToken?: string; label?: string }) =>
    api.put<{ success: boolean; data: PlatformToken }>(`/platform-tokens/${platform}`, data),
  delete: (id: string) => api.delete(`/platform-tokens/${id}`),
  validate: (platform: string) => api.post<{ success: boolean; data: { valid: boolean; permissions?: string[]; pages?: any[]; error?: string; expiresAt?: string } }>(`/platform-tokens/${platform}/validate`),
};

// ── Facebook Token Inspector ─────────────────────────
export const facebookTokenApi = {
  inspect: (accessToken: string) =>
    api.post<{ success: boolean; data: { valid: boolean; appId?: string; appName?: string; expiresAt?: string; scopes?: string[]; userId?: string; userName?: string; pages?: Array<{ id: string; name: string; accessToken?: string; category?: string }>; adAccounts?: Array<{ id: string; name: string; accountStatus?: string }>; error?: string } }>('/platform-tokens/facebook/inspect', { accessToken }),
};
