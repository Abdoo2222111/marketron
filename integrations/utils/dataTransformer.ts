// ============================================================
// Data Transformer - Cross-Platform Data Normalization
// ============================================================
// Transforms platform-specific API responses into a unified
// schema for the dashboard. Handles metric normalization,
// field mapping, and currency conversion.
// ============================================================

// ============================================================
// Common/Unified Types
// ============================================================
export interface UnifiedCampaign {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google';
  name: string;
  objective: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED' | 'COMPLETED';
  budget: {
    amount: number;
    currency: string;
    type: 'DAILY' | 'LIFETIME' | 'NONE';
  } | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  raw: any;
}

export interface UnifiedAd {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google';
  campaignId: string;
  adSetId: string | null;
  name: string;
  status: string;
  creative: {
    title?: string;
    body?: string;
    imageUrl?: string;
    videoUrl?: string;
    callToAction?: string;
    linkUrl?: string;
    thumbnailUrl?: string;
  };
  createdAt: string;
  raw: any;
}

export interface UnifiedAnalytics {
  platform: string;
  campaignId?: string;
  adId?: string;
  dateStart: string;
  dateEnd: string;
  metrics: {
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
    engagementRate: number | null;
    // Platform-specific
    shares?: number;
    comments?: number;
    likes?: number;
    saves?: number;
    swipeUps?: number;
  };
  breakdowns?: Record<string, any>;
  raw?: any;
}

export interface UnifiedPage {
  id: string;
  platform: string;
  name: string;
  category: string;
  followers: number;
  profilePicture: string;
  url: string;
  verified: boolean;
}

// ============================================================
// Platform → Unified Mappers
// ============================================================

// ---------- Facebook / Instagram ----------
export function facebookCampaignToUnified(fbCampaign: any): UnifiedCampaign {
  return {
    id: fbCampaign.id,
    platform: 'facebook',
    name: fbCampaign.name,
    objective: mapFacebookObjective(fbCampaign.objective),
    status: mapFacebookStatus(fbCampaign.status),
    budget: fbCampaign.daily_budget
      ? { amount: parseFloat(fbCampaign.daily_budget) / 100, currency: fbCampaign.account_currency || 'USD', type: 'DAILY' }
      : fbCampaign.lifetime_budget
      ? { amount: parseFloat(fbCampaign.lifetime_budget) / 100, currency: fbCampaign.account_currency || 'USD', type: 'LIFETIME' }
      : null,
    startTime: fbCampaign.start_time || null,
    endTime: fbCampaign.end_time || null,
    createdAt: fbCampaign.created_time,
    updatedAt: fbCampaign.updated_time,
    raw: fbCampaign,
  };
}

export function facebookInsightsToUnified(insights: any, currency: string = 'USD'): UnifiedAnalytics {
  return {
    platform: 'facebook',
    dateStart: insights.date_start,
    dateEnd: insights.date_stop,
    metrics: {
      impressions: parseInt(insights.impressions || '0', 10),
      reach: parseInt(insights.reach || '0', 10),
      frequency: parseFloat(insights.frequency || '0'),
      clicks: parseInt(insights.clicks || '0', 10),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: insights.cpc ? parseFloat(insights.cpc) : null,
      cpm: insights.cpm ? parseFloat(insights.cpm) : null,
      cpa: insights.cpa ? parseFloat(insights.cpa) : null,
      spend: parseFloat(insights.spend || '0'),
      currency,
      conversions: parseInt(insights.conversions || insights.actions?.[0]?.value || '0', 10),
      conversionRate: insights.conversion_rate ? parseFloat(insights.conversion_rate) : null,
      costPerConversion: insights.cost_per_conversion ? parseFloat(insights.cost_per_conversion) : null,
      roas: insights.roas ? parseFloat(insights.roas) : null,
      videoViews: parseInt(insights.video_views || insights.video_avg_time_watched_actions?.[0]?.value || '0', 10),
      videoViewRate: insights.video_view_rate ? parseFloat(insights.video_view_rate) : null,
      engagement: insights.engagement ? parseInt(insights.engagement) : null,
      engagementRate: insights.engagement_rate ? parseFloat(insights.engagement_rate) : null,
      shares: parseInt(insights.shares || '0', 10),
      comments: parseInt(insights.comments || '0', 10),
      likes: parseInt(insights.likes || '0', 10),
    },
    raw: insights,
  };
}

function mapFacebookObjective(obj: string): string {
  const map: Record<string, string> = {
    OUTCOME_AWARENESS: 'AWARENESS',
    OUTCOME_TRAFFIC: 'TRAFFIC',
    OUTCOME_ENGAGEMENT: 'ENGAGEMENT',
    OUTCOME_LEADS: 'LEADS',
    OUTCOME_SALES: 'SALES',
    APP_INSTALLS: 'APP_INSTALLS',
    REACH: 'REACH',
    VIDEO_VIEWS: 'VIDEO_VIEWS',
    LINK_CLICKS: 'TRAFFIC',
    PAGE_LIKES: 'ENGAGEMENT',
    POST_ENGAGEMENT: 'ENGAGEMENT',
    EVENT_RESPONSES: 'ENGAGEMENT',
    CONVERSIONS: 'SALES',
    CATALOG_SALES: 'SALES',
    STORE_VISITS: 'VISITS',
  };
  return map[obj] || obj;
}

function mapFacebookStatus(status: string): UnifiedCampaign['status'] {
  const map: Record<string, UnifiedCampaign['status']> = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
    IN_PROCESS: 'ACTIVE',
    WITH_ISSUES: 'ACTIVE',
  };
  return map[status] || 'PAUSED';
}

// ---------- TikTok ----------
export function tiktokCampaignToUnified(tkCampaign: any): UnifiedCampaign {
  return {
    id: tkCampaign.campaign_id || tkCampaign.id,
    platform: 'tiktok',
    name: tkCampaign.campaign_name,
    objective: mapTikTokObjective(tkCampaign.objective_type),
    status: mapTikTokStatus(tkCampaign.campaign_status || tkCampaign.status),
    budget: tkCampaign.daily_budget
      ? { amount: parseFloat(tkCampaign.daily_budget), currency: tkCampaign.currency || 'USD', type: 'DAILY' }
      : tkCampaign.lifetime_budget
      ? { amount: parseFloat(tkCampaign.lifetime_budget), currency: tkCampaign.currency || 'USD', type: 'LIFETIME' }
      : null,
    startTime: tkCampaign.start_time || null,
    endTime: tkCampaign.end_time || null,
    createdAt: tkCampaign.create_time || tkCampaign.created_at,
    updatedAt: tkCampaign.modify_time || tkCampaign.updated_at,
    raw: tkCampaign,
  };
}

export function tiktokInsightsToUnified(insights: any): UnifiedAnalytics {
  const metrics = insights.metrics || insights;
  return {
    platform: 'tiktok',
    dateStart: insights.start_date || insights.date_start,
    dateEnd: insights.end_date || insights.date_stop,
    metrics: {
      impressions: parseInt(metrics.impressions || metrics.impressions_total || '0', 10),
      reach: parseInt(metrics.reach || metrics.reach_total || '0', 10),
      frequency: metrics.frequency ? parseFloat(metrics.frequency) : 0,
      clicks: parseInt(metrics.clicks || metrics.clicks_total || '0', 10),
      ctr: parseFloat(metrics.ctr || '0'),
      cpc: metrics.cpc ? parseFloat(metrics.cpc) : null,
      cpm: metrics.cpm ? parseFloat(metrics.cpm) : null,
      cpa: metrics.cpa ? parseFloat(metrics.cpa) : null,
      spend: parseFloat(metrics.spend || metrics.cost || '0'),
      currency: metrics.currency || 'USD',
      conversions: parseInt(metrics.conversions || metrics.total_conversions || '0', 10),
      conversionRate: metrics.conversion_rate ? parseFloat(metrics.conversion_rate) : null,
      costPerConversion: metrics.cost_per_conversion ? parseFloat(metrics.cost_per_conversion) : null,
      roas: metrics.roas ? parseFloat(metrics.roas) : null,
      videoViews: parseInt(metrics.video_views || metrics.total_video_views || '0', 10),
      videoViewRate: metrics.video_view_rate ? parseFloat(metrics.video_view_rate) : null,
      engagement: parseInt(metrics.engagement || metrics.total_engagement || '0', 10),
      engagementRate: metrics.engagement_rate ? parseFloat(metrics.engagement_rate) : null,
      shares: parseInt(metrics.shares || '0', 10),
      comments: parseInt(metrics.comments || '0', 10),
      likes: parseInt(metrics.likes || '0', 10),
    },
    raw: insights,
  };
}

function mapTikTokObjective(obj: string): string {
  const map: Record<string, string> = {
    AWARENESS: 'AWARENESS',
    VIDEO_VIEWS: 'AWARENESS',
    TRAFFIC: 'TRAFFIC',
    INTERACTION: 'ENGAGEMENT',
    ENGAGEMENT: 'ENGAGEMENT',
    LEAD_GENERATION: 'LEADS',
    CONVERSION: 'SALES',
    CATALOG_SALES: 'SALES',
    APP_INSTALL: 'APP_INSTALLS',
    REACH: 'REACH',
  };
  return map[obj] || obj;
}

function mapTikTokStatus(status: string): UnifiedCampaign['status'] {
  const map: Record<string, UnifiedCampaign['status']> = {
    STATUS_ACTIVE: 'ACTIVE',
    STATUS_PAUSED: 'PAUSED',
    STATUS_DELETED: 'DELETED',
    STATUS_ARCHIVED: 'ARCHIVED',
    STATUS_DISABLE: 'PAUSED',
    STATUS_FINISHED: 'COMPLETED',
    SENT: 'ACTIVE',
    DRAFT: 'PAUSED',
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
  };
  return map[status] || 'PAUSED';
}

// ---------- Snapchat ----------
export function snapchatCampaignToUnified(scCampaign: any): UnifiedCampaign {
  const campaign = scCampaign.campaign || scCampaign;
  return {
    id: campaign.id,
    platform: 'snapchat',
    name: campaign.name,
    objective: mapSnapchatObjective(campaign.ad_product || campaign.objective),
    status: mapSnapchatStatus(campaign.status),
    budget: campaign.daily_budget_micro
      ? { amount: campaign.daily_budget_micro / 1000000, currency: campaign.currency || 'USD', type: 'DAILY' }
      : campaign.lifetime_budget_micro
      ? { amount: campaign.lifetime_budget_micro / 1000000, currency: campaign.currency || 'USD', type: 'LIFETIME' }
      : null,
    startTime: campaign.start_time || null,
    endTime: campaign.end_time || null,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    raw: scCampaign,
  };
}

export function snapchatInsightsToUnified(insights: any): UnifiedAnalytics {
  return {
    platform: 'snapchat',
    dateStart: insights.start_time || '',
    dateEnd: insights.end_time || '',
    metrics: {
      impressions: parseInt(insights.impressions || '0', 10),
      reach: parseInt(insights.reach || '0', 10),
      frequency: insights.frequency ? parseFloat(insights.frequency) : 0,
      clicks: parseInt(insights.swipes || insights.clicks || '0', 10),
      ctr: parseFloat(insights.ctr || '0'),
      cpc: insights.cpc ? parseFloat(insights.cpc) : null,
      cpm: insights.cpm ? parseFloat(insights.cpm) : null,
      cpa: insights.cpa ? parseFloat(insights.cpa) : null,
      spend: parseFloat(insights.spend || insights.cost || '0'),
      currency: insights.currency || 'USD',
      conversions: parseInt(insights.conversions || insights.screenshots || '0', 10),
      conversionRate: insights.conversion_rate ? parseFloat(insights.conversion_rate) : null,
      costPerConversion: insights.cost_per_conversion ? parseFloat(insights.cost_per_conversion) : null,
      roas: insights.roas ? parseFloat(insights.roas) : null,
      videoViews: parseInt(insights.video_views || insights.views || '0', 10),
      videoViewRate: insights.video_view_rate ? parseFloat(insights.video_view_rate) : null,
      engagement: parseInt(insights.engagement || insights.swipes || '0', 10),
      engagementRate: insights.engagement_rate ? parseFloat(insights.engagement_rate) : null,
      shares: parseInt(insights.shares || '0', 10),
      swipeUps: parseInt(insights.swipe_ups || insights.swipes || '0', 10),
    },
    raw: insights,
  };
}

function mapSnapchatObjective(obj: string): string {
  const map: Record<string, string> = {
    APP_INSTALL: 'APP_INSTALLS',
    APP_INSTALLS: 'APP_INSTALLS',
    AWARENESS: 'AWARENESS',
    LONG_VIDEO_VIEW: 'VIDEO_VIEWS',
    VIDEO_VIEW: 'VIDEO_VIEWS',
    TRAFFIC: 'TRAFFIC',
    WEBSITE_CONVERSION: 'SALES',
    LEAD_GENERATION: 'LEADS',
    STORY_OPEN: 'ENGAGEMENT',
    FILTER_LENS: 'ENGAGEMENT',
    PIXEL_PURCHASE: 'SALES',
    PIXEL_SIGN_UP: 'CONVERSIONS',
  };
  return map[obj] || obj;
}

function mapSnapchatStatus(status: string): UnifiedCampaign['status'] {
  const map: Record<string, UnifiedCampaign['status']> = {
    ACTIVE: 'ACTIVE',
    PAUSED: 'PAUSED',
    DELETED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
    COMPLETED: 'COMPLETED',
    SENT: 'ACTIVE',
    LIVE: 'ACTIVE',
    STOPPED: 'PAUSED',
    FINISHED: 'COMPLETED',
    INACTIVE: 'PAUSED',
  };
  return map[status] || 'PAUSED';
}

// ---------- Google ----------
export function googleCampaignToUnified(gCampaign: any): UnifiedCampaign {
  return {
    id: gCampaign.id || gCampaign.campaignId,
    platform: 'google',
    name: gCampaign.name || gCampaign.campaignName,
    objective: mapGoogleObjective(gCampaign.advertisingChannelType || gCampaign.objective),
    status: mapGoogleStatus(gCampaign.status || gCampaign.campaignStatus),
    budget: gCampaign.budget?.amountMicros
      ? { amount: parseInt(gCampaign.budget.amountMicros) / 1000000, currency: gCampaign.budget.currencyCode || 'USD', type: gCampaign.budget.type === 'DAILY' ? 'DAILY' : 'LIFETIME' }
      : null,
    startTime: gCampaign.startDate || null,
    endTime: gCampaign.endDate || null,
    createdAt: gCampaign.createdAt || '',
    updatedAt: gCampaign.updatedAt || '',
    raw: gCampaign,
  };
}

function mapGoogleObjective(obj: string): string {
  const map: Record<string, string> = {
    DISPLAY: 'AWARENESS',
    VIDEO: 'VIDEO_VIEWS',
    SEARCH: 'TRAFFIC',
    SHOPPING: 'SALES',
    PERFORMANCE_MAX: 'SALES',
    APP: 'APP_INSTALLS',
    SMART: 'SALES',
    DISCOVERY: 'ENGAGEMENT',
    DEMAND_GEN: 'ENGAGEMENT',
  };
  return map[obj] || obj;
}

function mapGoogleStatus(status: string): UnifiedCampaign['status'] {
  const map: Record<string, UnifiedCampaign['status']> = {
    ENABLED: 'ACTIVE',
    PAUSED: 'PAUSED',
    REMOVED: 'DELETED',
    ARCHIVED: 'ARCHIVED',
    SERVING: 'ACTIVE',
    ENDED: 'COMPLETED',
    UNKNOWN: 'PAUSED',
  };
  return map[status] || 'PAUSED';
}

// ============================================================
// Helper: Normalize all campaigns from a platform
// ============================================================
export function normalizeCampaigns(
  campaigns: any[],
  platform: 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google'
): UnifiedCampaign[] {
  const mappers: Record<string, (c: any) => UnifiedCampaign> = {
    facebook: facebookCampaignToUnified,
    instagram: facebookCampaignToUnified,
    tiktok: tiktokCampaignToUnified,
    snapchat: snapchatCampaignToUnified,
    google: googleCampaignToUnified,
  };

  const mapper = mappers[platform];
  if (!mapper) throw new Error(`Unknown platform: ${platform}`);

  return campaigns.map(mapper);
}
