// ===== الأنواع والواجهات المشتركة =====

// ----- المنصات -----
export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'snapchat';

export const PLATFORMS: Platform[] = ['facebook', 'instagram', 'tiktok', 'snapchat'];

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'فيسبوك',
  instagram: 'إنستجرام',
  tiktok: 'تيك توك',
  snapchat: 'سناب شات',
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  snapchat: '#FFFC00',
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  facebook: 'facebook',
  instagram: 'instagram',
  tiktok: 'tiktok',
  snapchat: 'snapchat',
};

// ----- الحملات -----
export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'engagement'
  | 'conversions'
  | 'sales';

export const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  'awareness',
  'traffic',
  'engagement',
  'conversions',
  'sales',
];

export const CAMPAIGN_OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'الوعي بالعلامة التجارية',
  traffic: 'زيادة الزيارات',
  engagement: 'التفاعل',
  conversions: 'التحويلات',
  sales: 'المبيعات',
};

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'مسودة',
  active: 'نشط',
  paused: 'موقف',
  completed: 'منتهي',
  archived: 'مؤرشف',
};

export type BudgetType = 'daily' | 'lifetime';

export interface Campaign {
  id: string;
  userId: string;
  teamId?: string;
  platform: Platform;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  budgetType: BudgetType;
  budgetAmount: number;
  budgetCurrency: string;
  startDate: string;
  endDate?: string;
  // الاستهداف
  targetCountry?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: 'all' | 'male' | 'female';
  targetInterests?: string[];
  // المحتوى الإبداعي
  creativeText?: string;
  creativeHeadline?: string;
  creativeCta?: string;
  creativeImageUrl?: string;
  creativeVideoUrl?: string;
  // مقاييس من المنصة
  platformCampaignId?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
  roas?: number;
  revenue?: number;
  // نظام
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ----- الإعلانات -----
export interface Ad {
  id: string;
  campaignId: string;
  platform: Platform;
  name: string;
  status: CampaignStatus;
  creativeText?: string;
  creativeHeadline?: string;
  creativeCta?: string;
  creativeImageUrl?: string;
  creativeVideoUrl?: string;
  platformAdId?: string;
  // مقاييس
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  createdAt: string;
  updatedAt: string;
}

// ----- لقطات الأداء اليومية -----
export interface AdSnapshot {
  id: string;
  campaignId: string;
  adId?: string;
  platform: Platform;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  revenue: number;
}

// ----- المستخدم -----
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'client';
  avatar?: string;
  company?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ----- الفريق -----
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'مالك',
  admin: 'مدير',
  editor: 'محرر',
  viewer: 'مشاهد',
};

export interface TeamMember {
  id: string;
  teamId: string;
  userId?: string;
  user?: User;
  role: TeamRole;
  status: 'active' | 'pending' | 'invited';
  invitedEmail?: string;
  joinedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
}

// ----- المحتوى -----
export type ContentType = 'image' | 'video' | 'text' | 'template';

export interface Content {
  id: string;
  userId: string;
  type: ContentType;
  platform: Platform;
  title: string;
  description?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ----- المنافسون -----
export interface Competitor {
  id: string;
  userId: string;
  name: string;
  platform: Platform;
  platformPageId?: string;
  platformUsername?: string;
  notes?: string;
  estimatedSpend?: number;
  activeAdsCount?: number;
  lastAnalyzedAt?: string;
  createdAt: string;
}

export interface CompetitorAd {
  id: string;
  competitorId: string;
  platform: Platform;
  snapshotDate: string;
  headline?: string;
  text?: string;
  cta?: string;
  imageUrl?: string;
  videoUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  estimatedSpend?: number;
}

export interface CompetitorComparison {
  id: string;
  name: string;
  marketShare: number;
  innovation: number;
  pricing: number;
  messaging: number;
  visual: number;
  strengths: string[];
  weaknesses: string[];
}

// ----- أبحاث السوق -----
export interface MarketReport {
  id: string;
  userId: string;
  productName: string;
  productCategory: string;
  country: string;
  reportData: MarketReportData;
  reportSummary: string;
  createdAt: string;
}

export interface MarketReportData {
  marketSize: {
    totalAddressable: number;
    serviceable: number;
    obtainable: number;
    currency: string;
    source: string;
  };
  marketTrends: Array<{
    trend: string;
    description: string;
    impact: 'positive' | 'negative';
    dataPoints: string;
  }>;
  seasonality: Array<{
    month: string;
    demandLevel: number;
    notes: string;
  }>;
  competitorLandscape: Array<{
    name: string;
    marketShareEstimate: number;
    strengths: string[];
    weaknesses: string[];
    priceRange: string;
  }>;
  pricingAnalysis: {
    avgPrice: number;
    priceRange: string;
    recommendedPrice: number;
    reasoning: string;
  };
  customerInsights: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
    desires: string[];
    buyingFactors: string[];
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  entryStrategy: {
    recommendedChannels: string[];
    budgetRange: string;
    timeline: string;
    keyMetrics: string[];
    risks: string[];
  };
}

// ----- الذكاء الاصطناعي -----
export type AiGenerationType =
  | 'ad-text'
  | 'ad-image'
  | 'video-script'
  | 'hashtags'
  | 'campaign-analysis'
  | 'competitor-analysis'
  | 'market-research'
  | 'recommendation'
  | 'why-not-selling';

export interface AiGenerationRequest {
  type: AiGenerationType;
  inputData: Record<string, any>;
}

export interface AiGenerationResponse {
  id: string;
  type: AiGenerationType;
  outputData: Record<string, any>;
  modelUsed: string;
  tokensUsed: number;
  createdAt: string;
}

export interface CampaignAnalysis {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    effort: string;
  }>;
  benchmarksComparison: {
    ctrBenchmark: number;
    cpcBenchmark: number;
    cpaBenchmark: number;
    yourCtr: number;
    yourCpc: number;
    yourCpa: number;
  };
}

export interface WhyNotSellingResponse {
  problemIdentification: {
    primaryIssue: string;
    secondaryIssues: string[];
    evidence: string;
  };
  rootCauses: Array<{
    cause: string;
    impactLevel: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  quickWins: Array<{
    action: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
    timeToResult: string;
  }>;
  exampleAd: {
    headline: string;
    primaryText: string;
    cta: string;
    rationale: string;
  };
}

// ----- API Response -----
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// ----- الإشعارات -----
export type NotificationType = 'campaign' | 'invoice' | 'system' | 'alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ----- الفواتير -----
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  userId: string;
  teamId?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  planType: string;
  periodStart: string;
  periodEnd: string;
  paymentMethod?: string;
  paidAt?: string;
  invoiceNumber: string;
  createdAt: string;
}

// ----- الإعدادات -----
export interface PlatformConnection {
  id: string;
  userId: string;
  platform: Platform;
  platformAccountId: string;
  platformAccountName: string;
  status: 'connected' | 'expired' | 'disconnected';
  connectedAt: string;
}

export interface BrandSettings {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandName?: string;
}
