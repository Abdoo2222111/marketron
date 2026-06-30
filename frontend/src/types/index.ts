export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer' | 'client';
  accountType: 'individual' | 'company';
  companyName?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: PlatformType;
  objective: CampaignObjective;
  status: CampaignStatus;
  budget: number;
  dailyBudget?: number;
  spent: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  cpa?: number;
  roas?: number;
  startDate: string;
  endDate?: string;
  targetAudience: Audience;
  creatives?: Creative[];
  clientId?: string;
  createdAt: string;
  updatedAt?: string;
  metrics?: CampaignMetrics;
}

export interface CampaignMetrics {
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spent: number;
  conversions: number;
  conversionRate: number;
  roas: number;
}

export interface Audience {
  country?: string;
  countries?: string[];
  ageMin?: number;
  ageMax?: number;
  gender?: 'all' | 'male' | 'female';
  interests?: string[];
  devices?: string[];
  browsers?: string[];
}

export interface Creative {
  id: string;
  type: 'image' | 'video' | 'carousel';
  title: string;
  body: string;
  cta: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  platform?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface Competitor {
  id: string;
  name: string;
  website?: string;
  logo?: string;
  activeAds: number;
  monthlySpend: number;
  platforms: string[];
  categories: string[];
  ads: CompetitorAd[];
}

export interface CompetitorAd {
  id: string;
  title: string;
  body: string;
  mediaUrl: string;
  platform: string;
  estimatedSpend: number;
  estimatedImpressions: number;
  startDate: string;
  isActive: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'viewer';
  avatar?: string;
  joinedAt: string;
}

export interface PlatformConnection {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'snapchat';
  name: string;
  connected: boolean;
  connectedAt?: string;
  pages?: string[];
  avatar?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface MarketResearch {
  productName: string;
  marketSize: number;
  competitors: { name: string; marketShare: number }[];
  avgPrice: number;
  seasonality: { month: string; demand: number }[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  recommendations: string[];
}

export interface AIContent {
  headlines: string[];
  descriptions: string[];
  hashtags: string[];
  imageSuggestions: string[];
}

export type PlatformType = 'facebook' | 'instagram' | 'tiktok' | 'snapchat';
export type CampaignObjective = 'awareness' | 'engagement' | 'traffic' | 'conversions' | 'sales';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft' | 'archived';
export type ContentType = 'post' | 'story' | 'ad' | 'carousel' | 'reel' | 'article' | 'description';
export type ContentTone = 'professional' | 'casual' | 'luxury' | 'funny' | 'inspirational' | 'formal';
export type ContentLength = 'short' | 'medium' | 'long';

export interface CreateCampaignData {
  name: string;
  description?: string;
  platform: PlatformType;
  pageId?: string;
  objective: CampaignObjective;
  budget: number;
  startDate: string;
  endDate?: string;
  targetAudience: {
    country?: string;
    ageMin: number;
    ageMax: number;
    gender?: string;
    interests?: string[];
  };
  content: {
    primaryText: string;
    headline: string;
    description: string;
    cta: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Content {
  id: string;
  type: ContentType;
  status: string;
  title: string;
  body: string;
  platform: PlatformType;
  scheduledAt?: string;
  scheduledFor?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  media?: string[] | { url: string; type: string }[];
  performance?: {
    impressions: number;
    clicks: number;
    engagement: number;
  };
}

export interface GenerateContentParams {
  type: ContentType;
  platform: PlatformType;
  tone: ContentTone;
  length: ContentLength;
  topic?: string;
  keywords?: string[];
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCtr: number;
  averageCpc: number;
  averageRoas: number;
}

export interface PerformanceDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
}

export interface PlatformBreakdown {
  platform: PlatformType;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface AnalyticsFilter {
  platform?: PlatformType;
  startDate?: string;
  endDate?: string;
  dateRange?: '7d' | '30d' | '90d' | 'custom';
}

export interface CompetitorComparison {
  competitor: Competitor;
  yourMetrics: {
    ads: number;
    spend: number;
    impressions: number;
  };
  competitorMetrics: {
    ads: number;
    spend: number;
    impressions: number;
  };
  difference: {
    ads: number;
    spend: number;
    impressions: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
