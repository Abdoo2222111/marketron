// ============================================================
// Common Types - Unified Interface for All Platforms
// ============================================================
// Defines the standard interface that each platform integration
// implements, along with shared types for campaigns, ads,
// analytics, audiences, and creatives.
// ============================================================

// ============================================================
// Platform Identification
// ============================================================
export type PlatformName = 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google';

// ============================================================
// Token Types
// ============================================================
export interface PlatformTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scopes: string[];
  platformUserId?: string;
  platformUserName?: string;
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// Campaign Types
// ============================================================
export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'COMPLETED';
export type BudgetType = 'DAILY' | 'LIFETIME' | 'NONE';

export interface CampaignBudget {
  amount: number;
  currency: string;
  type: BudgetType;
}

export interface Campaign {
  id: string;
  platform: PlatformName;
  name: string;
  objective: string;
  status: CampaignStatus;
  budget: CampaignBudget | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  raw: any;
}

export interface CreateCampaignInput {
  name: string;
  objective: string;
  status: CampaignStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  bidStrategy?: string;
  buyingType?: string;
  specialAdCategories?: string[];
}

export interface UpdateCampaignInput {
  name?: string;
  status?: CampaignStatus;
  dailyBudget?: number;
  lifetimeBudget?: number;
  startTime?: string;
  endTime?: string;
  bidStrategy?: string;
}

// ============================================================
// Ad Types
// ============================================================
export interface AdCreative {
  id?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  videoUrl?: string;
  callToAction?: string;
  linkUrl?: string;
  thumbnailUrl?: string;
  name?: string;
  type?: string;
}

export interface Ad {
  id: string;
  platform: PlatformName;
  campaignId: string;
  adSetId: string | null;
  name: string;
  status: string;
  creative: AdCreative | null;
  createdAt: string;
  raw: any;
}

export interface CreateAdInput {
  name: string;
  adSetId: string;
  creative: {
    name?: string;
    title?: string;
    body?: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction?: string;
    linkUrl?: string;
    objectUrl?: string;
    imageHash?: string;
    videoId?: string;
    thumbnailUrl?: string;
  };
  status: CampaignStatus;
  trackingSpecs?: any;
  conversionDomain?: string;
}

export interface UpdateAdInput {
  name?: string;
  status?: CampaignStatus;
  creative?: Partial<AdCreative>;
}

// ============================================================
// Analytics / Insights Types
// ============================================================
export type InsightsGranularity = 'DAY' | 'WEEK' | 'MONTH' | 'HOUR';

export interface CampaignInsights {
  campaignId?: string;
  dateStart: string;
  dateEnd: string;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number | null;
  cpm: number | null;
  cpa: number | null;
  spend: number;
  currency: string;
  conversions: number;
  conversionRate: number | null;
  costPerConversion: number | null;
  roas: number | null;
  videoViews: number | null;
  videoViewRate: number | null;
  engagement: number | null;
  shares?: number;
  comments?: number;
  likes?: number;
  saves?: number;
  swipeUps?: number;
}

export interface AccountInsights {
  platform: PlatformName;
  accountId: string;
  dateStart: string;
  dateEnd: string;
  metrics: CampaignInsights;
  topCampaigns?: Array<{ id: string; name: string; spend: number; impressions: number; clicks: number }>;
  dailyBreakdown?: Array<{ date: string; metrics: Partial<CampaignInsights> }>;
}

export interface AudienceInsights {
  platform: PlatformName;
  accountId: string;
  ageDistribution?: Array<{ label: string; value: number; percentage: number }>;
  genderDistribution?: Array<{ label: string; value: number; percentage: number }>;
  topCountries?: Array<{ name: string; value: number; percentage: number }>;
  topCities?: Array<{ name: string; value: number; percentage: number }>;
  followerGrowth?: Array<{ date: string; count: number }>;
  activeHours?: Array<{ day: string; hour: number; value: number }>;
}

export interface CompetitiveInsights {
  platform: PlatformName;
  accountId: string;
  benchmarkCTR?: number;
  benchmarkCPC?: number;
  benchmarkCPM?: number;
  shareOfVoice?: number;
  topCompetitorAds?: Array<{
    id: string;
    platform: PlatformName;
    headline?: string;
    estimatedMetrics: Partial<CampaignInsights>;
  }>;
}

// ============================================================
// Creative / Content Types
// ============================================================
export interface Creative {
  id: string;
  platform: PlatformName;
  name: string;
  type: string;
  status: string;
  thumbnailUrl?: string;
  mediaUrl?: string;
  title?: string;
  body?: string;
  callToAction?: string;
  linkUrl?: string;
  renderingUrls?: string[];
  adFormat?: string;
  raw: any;
}

export interface CreateCreativeInput {
  name: string;
  type: string;
  title?: string;
  body?: string;
  mediaUrl?: string;
  callToAction?: string;
  linkUrl?: string;
  imageHash?: string;
  videoId?: string;
  thumbnailUrl?: string;
  pageId?: string;
  identityId?: string;
  identityType?: string;
}

// ============================================================
// Standardized Platform Integration Interface
// ============================================================
// كل منصة إعلانية يجب أن تنفذ هذه الواجهة لتوفير
// واجهة موحدة للتكامل مع المنصة
export interface PlatformIntegration {
  // ============================================================
  // المصادقة (Authentication)
  // ============================================================
  getAuthUrl(redirectUri: string): Promise<string>;
  handleCallback(code: string, redirectUri: string): Promise<PlatformTokens>;
  refreshToken(refreshToken: string): Promise<PlatformTokens>;
  disconnect(): Promise<void>;

  // ============================================================
  // الحملات (Campaigns)
  // ============================================================
  getCampaigns(accountId: string, status?: string): Promise<Campaign[]>;
  createCampaign(data: CreateCampaignInput): Promise<Campaign>;
  updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  getCampaignInsights(
    id: string,
    startDate: Date,
    endDate: Date,
    granularity?: InsightsGranularity
  ): Promise<CampaignInsights>;

  // ============================================================
  // الإعلانات (Ads)
  // ============================================================
  getAds(campaignId: string): Promise<Ad[]>;
  createAd(campaignId: string, data: CreateAdInput): Promise<Ad>;
  updateAd(id: string, data: UpdateAdInput): Promise<Ad>;

  // ============================================================
  // التحليلات (Analytics)
  // ============================================================
  getAccountInsights(accountId: string, startDate: Date, endDate: Date): Promise<AccountInsights>;
  getAudienceInsights(accountId: string): Promise<AudienceInsights>;
  getCompetitiveInsights(accountId: string): Promise<CompetitiveInsights>;

  // ============================================================
  // المحتوى (Content)
  // ============================================================
  getCreatives(adId: string): Promise<Creative[]>;
  uploadCreative(data: CreateCreativeInput): Promise<Creative>;
}

// ============================================================
// Page Types (Facebook/Instagram)
// ============================================================
export interface PlatformPage {
  id: string;
  platform: PlatformName;
  name: string;
  category: string;
  followers: number;
  profilePicture: string;
  accessToken?: string;
  url: string;
  verified: boolean;
}

// ============================================================
// Ad Account Types
// ============================================================
export interface AdAccount {
  id: string;
  platform: PlatformName;
  name: string;
  currency: string;
  balance: number;
  status: string;
  dailySpendLimit: number;
  amountSpent: number;
  timezoneName: string;
}

// ============================================================
// Audience Types
// ============================================================
export interface CustomAudience {
  id: string;
  platform: PlatformName;
  name: string;
  description?: string;
  type: string;
  size: number;
  status: string;
  createdAt: string;
  subType?: string;
}

export interface LookalikeAudience {
  id: string;
  platform: PlatformName;
  name: string;
  sourceAudienceId: string;
  percentage: number;
  country: string;
  size: number;
  status: string;
}

// ============================================================
// Error Types
// ============================================================
export interface IntegrationError {
  platform: PlatformName;
  status: number | null;
  code: string;
  message: string;
  messageAr: string;
  details: any;
  retryable: boolean;
}
