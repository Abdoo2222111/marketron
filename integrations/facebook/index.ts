// ============================================================
// Facebook/Instagram Graph API - Complete Service
// ============================================================
// Manages Facebook and Instagram marketing operations:
// - OAuth authentication flow
// - Page management and insights
// - Ad account management
// - Campaign CRUD operations
// - Ad set and ad management
// - Analytics and reporting
// - Content publishing (Facebook + Instagram)
// - Creative asset management
// ============================================================

import axios, { AxiosInstance } from 'axios';
import { FACEBOOK_CONFIG } from '../config';
import { createApiClient, makeApiCall, paginateAll, rateLimiter } from '../utils/apiClient';
import { tokenManager } from '../utils/tokenManager';
import {
  getFacebookAuthUrl,
  handleFacebookCallback,
  exchangeForLongLivedToken,
  refreshFacebookToken,
  debugFacebookToken,
  getFacebookUserInfo,
  revokeFacebookToken,
} from './auth';

// ============================================================
// Types
// ============================================================
export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  profilePicture: string;
  accessToken?: string;
  url: string;
  verified: boolean;
}

export interface FacebookAdAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  status: string;
  dailySpendLimit: number;
  amountSpent: number;
  timezoneName: string;
}

export type CampaignObjective =
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_SALES'
  | 'APP_INSTALLS'
  | 'REACH'
  | 'VIDEO_VIEWS'
  | 'BRAND_AWARENESS'
  | 'CONVERSIONS';

export interface CampaignData {
  name: string;
  objective: CampaignObjective;
  status: 'ACTIVE' | 'PAUSED';
  specialAdCategories?: string[];
  dailyBudget?: number; // in cents
  lifetimeBudget?: number; // in cents
  startTime?: string;
  endTime?: string;
  bidStrategy?: 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP' | 'COST_CAP' | 'TARGET_COST';
  buyingType?: 'AUCTION' | 'RESERVED';
}

export interface AdSetData {
  name: string;
  campaignId: string;
  targeting: any;
  bidAmount?: number;
  dailyBudget?: number;
  lifetimeBudget?: number;
  optimizationGoal: string;
  billingEvent: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'PAUSED';
  bidStrategy?: string;
  pacingType?: string[];
  destinationType?: string;
}

export interface AdCreativeData {
  name: string;
  objectStorySpec?: any;
  assetFeedSpec?: any;
  title?: string;
  body?: string;
  objectUrl?: string;
  callToActionType?: string;
  imageHash?: string;
  videoId?: string;
  linkUrl?: string;
  thumbnailUrl?: string;
  template?: string;
}

export interface AdData {
  name: string;
  adSetId: string;
  creative: AdCreativeData;
  status: 'ACTIVE' | 'PAUSED';
  trackingSpecs?: any;
  conversionDomain?: string;
}

export interface InsightsParams {
  datePreset?: string;
  timeRange?: { since: string; until: string };
  fields?: string[];
  breakdowns?: string[];
  level?: 'campaign' | 'adset' | 'ad';
  filtering?: any[];
  limit?: number;
}

export interface UnifiedInsights {
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number | null;
  cpm: number | null;
  cpa: number | null;
  spend: number;
  conversions: number;
  costPerConversion: number | null;
  roas: number | null;
  videoViews: number | null;
  videoViewRate: number | null;
  engagement: number | null;
  engagementRate: number | null;
}

export interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  profilePicture: string;
  followers: number;
  follows: number;
  mediaCount: number;
  website: string;
  biography: string;
}

export interface InstagramMedia {
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  caption: string;
  mediaUrl: string;
  locationId?: string;
  collaboratorIds?: string[];
  childrenIds?: string[];
  isCarouselItem?: boolean;
}

// ============================================================
// Facebook Service Class
// ============================================================
export class FacebookService {
  private userId: string;
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string, userId?: string) {
    this.accessToken = accessToken;
    this.userId = userId || '';
    this.client = createApiClient({
      baseUrl: FACEBOOK_CONFIG.graphUrl,
      platform: 'facebook',
      getAccessToken: async () => this.accessToken,
      onTokenRefresh: async () => {
        try {
          const newToken = await refreshFacebookToken(this.accessToken);
          this.accessToken = newToken;
          return newToken;
        } catch {
          return null;
        }
      },
    });
  }

  // ============================================================
  // Static OAuth Methods
  // ============================================================
  static getAuthUrl(state?: string): string {
    return getFacebookAuthUrl(state);
  }

  static async handleCallback(code: string) {
    return handleFacebookCallback(code);
  }

  static async refreshToken(token: string): Promise<string> {
    return refreshFacebookToken(token);
  }

  static async debugToken(token: string) {
    return debugFacebookToken(token);
  }

  // ============================================================
  // Get Current User
  // ============================================================
  async getMe(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/me',
      params: { fields: 'id,name,email,picture,accounts{id,name,category,fan_count,picture,access_token}' },
    });
    return response.data;
  }

  // ============================================================
  // Pages
  // ============================================================
  async getPages(): Promise<FacebookPage[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/me/accounts',
      params: {
        fields: 'id,name,category,fan_count,picture,access_token,website,verification_status',
        limit: 100,
      },
    });

    return (response.data?.data || []).map((page: any) => ({
      id: page.id,
      name: page.name,
      category: page.category || '',
      followers: page.fan_count || 0,
      profilePicture: page.picture?.data?.url || '',
      accessToken: page.access_token,
      url: `https://facebook.com/${page.id}`,
      verified: page.verification_status === 'verified',
    }));
  }

  async getPageInsights(
    pageId: string,
    metrics: string[],
    period: 'day' | 'week' | 'days_28' | 'month' | 'lifetime' = 'day',
    since?: string,
    until?: string
  ): Promise<any> {
    const params: any = {
      metric: metrics.join(','),
      period,
    };
    if (since) params.since = since;
    if (until) params.until = until;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${pageId}/insights`,
      params,
    });
    return response.data;
  }

  // ============================================================
  // Ad Accounts
  // ============================================================
  async getAdAccounts(): Promise<FacebookAdAccount[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/me/adaccounts',
      params: {
        fields: 'id,name,currency,balance,account_status,daily_spend_limit,amount_spent,timezone_name,business_name',
        limit: 100,
      },
    });

    return (response.data?.data || []).map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      currency: acc.currency || 'USD',
      balance: parseFloat(acc.balance || '0') / 100,
      status: acc.account_status?.toString() || 'unknown',
      dailySpendLimit: parseFloat(acc.daily_spend_limit || '0') / 100,
      amountSpent: parseFloat(acc.amount_spent || '0') / 100,
      timezoneName: acc.timezone_name || '',
    }));
  }

  async getAdAccount(accountId: string): Promise<FacebookAdAccount> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${accountId}`,
      params: {
        fields: 'id,name,currency,balance,account_status,daily_spend_limit,amount_spent,timezone_name,business_name',
      },
    });

    const acc = response.data;
    return {
      id: acc.id,
      name: acc.name,
      currency: acc.currency || 'USD',
      balance: parseFloat(acc.balance || '0') / 100,
      status: acc.account_status?.toString() || 'unknown',
      dailySpendLimit: parseFloat(acc.daily_spend_limit || '0') / 100,
      amountSpent: parseFloat(acc.amount_spent || '0') / 100,
      timezoneName: acc.timezone_name || '',
    };
  }

  // ============================================================
  // Campaigns
  // ============================================================
  async createCampaign(accountId: string, data: CampaignData): Promise<any> {
    const params: any = {
      name: data.name,
      objective: data.objective,
      status: data.status,
      special_ad_categories: data.specialAdCategories?.join(',') || 'NONE',
      access_token: this.accessToken,
    };

    if (data.dailyBudget) params.daily_budget = data.dailyBudget;
    if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
    if (data.startTime) params.start_time = data.startTime;
    if (data.endTime) params.end_time = data.endTime;
    if (data.bidStrategy) params.bid_strategy = data.bidStrategy;
    if (data.buyingType) params.buying_type = data.buyingType;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/campaigns`,
      params,
    });

    return response.data;
  }

  async getCampaigns(
    accountId: string,
    status?: string[],
    fields?: string[]
  ): Promise<any> {
    const defaultFields = fields || [
      'id', 'name', 'objective', 'status', 'daily_budget', 'lifetime_budget',
      'start_time', 'end_time', 'created_time', 'updated_time',
      'account_id', 'buying_type', 'bid_strategy',
      'campaign_id', 'effective_status',
    ];

    const params: any = {
      fields: defaultFields.join(','),
      limit: 100,
    };

    if (status && status.length > 0) {
      params.filtering = JSON.stringify(
        status.map((s) => ({ field: 'effective_status', operator: 'IN', value: [s] }))
      );
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/campaigns`,
      params,
    });

    return response.data;
  }

  async getCampaign(campaignId: string, fields?: string[]): Promise<any> {
    const defaultFields = fields || [
      'id', 'name', 'objective', 'status', 'daily_budget', 'lifetime_budget',
      'start_time', 'end_time', 'created_time', 'updated_time',
      'account_id', 'buying_type', 'bid_strategy', 'effective_status',
    ];

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${campaignId}`,
      params: { fields: defaultFields.join(',') },
    });

    return response.data;
  }

  async updateCampaign(campaignId: string, data: Partial<CampaignData>): Promise<any> {
    const params: any = { access_token: this.accessToken };
    if (data.name) params.name = data.name;
    if (data.status) params.status = data.status;
    if (data.dailyBudget) params.daily_budget = data.dailyBudget;
    if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
    if (data.startTime) params.start_time = data.startTime;
    if (data.endTime) params.end_time = data.endTime;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${campaignId}`,
      params,
    });

    return response.data;
  }

  async deleteCampaign(campaignId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${campaignId}`,
    });
    return response.data;
  }

  // ============================================================
  // Ad Sets
  // ============================================================
  async createAdSet(accountId: string, data: AdSetData): Promise<any> {
    const params: any = {
      name: data.name,
      campaign_id: data.campaignId,
      targeting: JSON.stringify(data.targeting),
      optimization_goal: data.optimizationGoal,
      billing_event: data.billingEvent,
      start_time: data.startTime,
      status: data.status,
      access_token: this.accessToken,
    };

    if (data.bidAmount) params.bid_amount = data.bidAmount;
    if (data.dailyBudget) params.daily_budget = data.dailyBudget;
    if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
    if (data.endTime) params.end_time = data.endTime;
    if (data.bidStrategy) params.bid_strategy = data.bidStrategy;
    if (data.pacingType) params.pacing_type = JSON.stringify(data.pacingType);
    if (data.destinationType) params.destination_type = data.destinationType;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/adsets`,
      params,
    });

    return response.data;
  }

  async getAdSets(campaignId?: string, accountId?: string): Promise<any> {
    const params: any = {
      fields: 'id,name,campaign_id,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,start_time,end_time,bid_amount,bid_strategy,created_time,effective_status',
      limit: 100,
    };

    let url: string;
    if (campaignId) {
      url = `/${campaignId}/adsets`;
    } else if (accountId) {
      url = `/act_${accountId}/adsets`;
    } else {
      throw new Error('Either campaignId or accountId is required');
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url,
      params,
    });
    return response.data;
  }

  async updateAdSet(adSetId: string, data: Partial<AdSetData>): Promise<any> {
    const params: any = { access_token: this.accessToken };
    if (data.name) params.name = data.name;
    if (data.status) params.status = data.status;
    if (data.dailyBudget) params.daily_budget = data.dailyBudget;
    if (data.lifetimeBudget) params.lifetime_budget = data.lifetimeBudget;
    if (data.bidAmount) params.bid_amount = data.bidAmount;
    if (data.endTime) params.end_time = data.endTime;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${adSetId}`,
      params,
    });
    return response.data;
  }

  // ============================================================
  // Ads
  // ============================================================
  async createAd(accountId: string, data: AdData): Promise<any> {
    // Build creative params
    const creativeParams: any = {};
    if (data.creative.objectStorySpec) {
      creativeParams.object_story_spec = JSON.stringify(data.creative.objectStorySpec);
    } else if (data.creative.assetFeedSpec) {
      creativeParams.asset_feed_spec = JSON.stringify(data.creative.assetFeedSpec);
    } else {
      if (data.creative.title) creativeParams.title = data.creative.title;
      if (data.creative.body) creativeParams.body = data.creative.body;
      if (data.creative.objectUrl) creativeParams.object_url = data.creative.objectUrl;
      if (data.creative.callToActionType) creativeParams.call_to_action_type = data.creative.callToActionType;
      if (data.creative.imageHash) creativeParams.image_hash = data.creative.imageHash;
      if (data.creative.videoId) creativeParams.video_id = data.creative.videoId;
      if (data.creative.linkUrl) creativeParams.link_url = data.creative.linkUrl;
      if (data.creative.thumbnailUrl) creativeParams.thumbnail_url = data.creative.thumbnailUrl;
    }

    // First create the creative
    const creativeResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/adcreatives`,
      params: {
        ...creativeParams,
        name: data.creative.name || data.name,
        access_token: this.accessToken,
      },
    });

    const creativeId = creativeResponse.data.id;

    // Then create the ad
    const adParams: any = {
      name: data.name,
      adset_id: data.adSetId,
      creative: JSON.stringify({ creative_id: creativeId }),
      status: data.status,
      access_token: this.accessToken,
    };

    if (data.trackingSpecs) adParams.tracking_specs = JSON.stringify(data.trackingSpecs);
    if (data.conversionDomain) adParams.conversion_domain = data.conversionDomain;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/ads`,
      params: adParams,
    });

    return { ...response.data, creativeId };
  }

  async getAds(adSetId?: string, accountId?: string): Promise<any> {
    const params: any = {
      fields: 'id,name,adset_id,campaign_id,status,creative,created_time,effective_status,tracking_specs',
      limit: 100,
    };

    let url: string;
    if (adSetId) {
      url = `/${adSetId}/ads`;
    } else if (accountId) {
      url = `/act_${accountId}/ads`;
    } else {
      throw new Error('Either adSetId or accountId is required');
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url,
      params,
    });
    return response.data;
  }

  async updateAd(adId: string, data: Partial<AdData>): Promise<any> {
    const params: any = { access_token: this.accessToken };
    if (data.name) params.name = data.name;
    if (data.status) params.status = data.status;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${adId}`,
      params,
    });
    return response.data;
  }

  async deleteAd(adId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${adId}`,
    });
    return response.data;
  }

  // ============================================================
  // Insights & Analytics
  // ============================================================
  async getCampaignInsights(
    campaignId: string,
    params?: InsightsParams
  ): Promise<UnifiedInsights> {
    const defaultFields = [
      'impressions', 'reach', 'frequency', 'clicks', 'ctr', 'cpc', 'cpm',
      'cpa', 'spend', 'actions', 'conversions', 'cost_per_conversion',
      'conversion_rate_ranking', 'video_avg_time_watched_actions',
      'video_p25_watched_actions', 'video_p50_watched_actions',
      'video_p75_watched_actions', 'video_p95_watched_actions',
      'cost_per_action_type', 'action_values', 'roas',
    ];

    const queryParams: any = {
      fields: (params?.fields || defaultFields).join(','),
      level: params?.level || 'campaign',
    };

    if (params?.datePreset) queryParams.date_preset = params.datePreset;
    if (params?.timeRange) queryParams.time_range = JSON.stringify(params.timeRange);
    if (params?.breakdowns) queryParams.breakdowns = params.breakdowns.join(',');
    if (params?.filtering) queryParams.filtering = JSON.stringify(params.filtering);
    if (params?.limit) queryParams.limit = params.limit;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${campaignId}/insights`,
      params: queryParams,
    });

    const insight = response.data?.data?.[0] || {};
    return this.normalizeInsights(insight);
  }

  async getAdAccountInsights(
    accountId: string,
    dateRange?: { start: Date; end: Date },
    level?: string
  ): Promise<any> {
    const params: any = {
      fields: 'impressions,reach,frequency,clicks,ctr,cpc,cpm,spend,actions,conversions,cost_per_conversion,roas',
      level: level || 'account',
      date_preset: 'last_30d',
      limit: 100,
    };

    if (dateRange) {
      params.time_range = JSON.stringify({
        since: dateRange.start.toISOString().split('T')[0],
        until: dateRange.end.toISOString().split('T')[0],
      });
      delete params.date_preset;
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/act_${accountId}/insights`,
      params,
    });

    return response.data;
  }

  async getAdAccountAnalytics(accountId: string): Promise<any> {
    return this.getAdAccountInsights(accountId);
  }

  private normalizeInsights(insight: any): UnifiedInsights {
    const getActionValue = (actionType: string): number => {
      const action = (insight.actions || []).find(
        (a: any) => a.action_type === actionType
      );
      return action ? parseInt(action.value, 10) : 0;
    };

    const getCostValue = (actionType: string): number | null => {
      const cost = (insight.cost_per_action_type || []).find(
        (c: any) => c.action_type === actionType
      );
      return cost ? parseFloat(cost.value) : null;
    };

    return {
      impressions: parseInt(insight.impressions || '0', 10),
      reach: parseInt(insight.reach || '0', 10),
      frequency: parseFloat(insight.frequency || '0'),
      clicks: parseInt(insight.clicks || '0', 10),
      ctr: parseFloat(insight.ctr || '0'),
      cpc: insight.cpc ? parseFloat(insight.cpc) : null,
      cpm: insight.cpm ? parseFloat(insight.cpm) : null,
      cpa: getCostValue('conversion') || getCostValue('lead') || getCostValue('purchase'),
      spend: parseFloat(insight.spend || '0'),
      conversions: parseInt(insight.conversions || '0', 10) || getActionValue('purchase') || getActionValue('lead'),
      costPerConversion: insight.cost_per_conversion
        ? parseFloat(insight.cost_per_conversion)
        : getCostValue('purchase') || getCostValue('lead'),
      roas: insight.roas ? parseFloat(insight.roas) : null,
      videoViews: getActionValue('video_view') || parseInt(insight.video_avg_time_watched_actions?.[0]?.value || '0', 10),
      videoViewRate: insight.video_view_rate ? parseFloat(insight.video_view_rate) : null,
      engagement:
        getActionValue('like') + getActionValue('comment') + getActionValue('share') + getActionValue('post'),
      engagementRate: insight.engagement_rate ? parseFloat(insight.engagement_rate) : null,
    };
  }

  // ============================================================
  // Content Publishing (Facebook Pages)
  // ============================================================
  async publishPost(
    pageId: string,
    data: {
      message: string;
      link?: string;
      published?: boolean;
      scheduledPublishTime?: string;
      photos?: string[];
      videoUrl?: string;
    }
  ): Promise<any> {
    const params: any = {
      message: data.message,
      access_token: this.accessToken,
    };

    if (data.link) params.link = data.link;
    if (data.published === false) params.published = false;
    if (data.scheduledPublishTime) params.scheduled_publish_time = data.scheduledPublishTime;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}/feed`,
      params,
    });

    return response.data;
  }

  async publishPhoto(
    pageId: string,
    data: { url: string; caption: string; published?: boolean }
  ): Promise<any> {
    const params: any = {
      url: data.url,
      caption: data.caption,
      access_token: this.accessToken,
    };
    if (data.published === false) params.published = false;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}/photos`,
      params,
    });
    return response.data;
  }

  async publishVideo(
    pageId: string,
    data: { videoUrl: string; title: string; description: string; published?: boolean }
  ): Promise<any> {
    const params: any = {
      file_url: data.videoUrl,
      title: data.title,
      description: data.description,
      access_token: this.accessToken,
    };
    if (data.published === false) params.published = false;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}/videos`,
      params,
    });
    return response.data;
  }

  // ============================================================
  // Creative & Assets
  // ============================================================
  async createImageAdCreative(
    accountId: string,
    data: {
      name: string;
      title: string;
      body: string;
      imageHash: string;
      objectUrl: string;
      callToActionType: string;
    }
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/adcreatives`,
      params: {
        name: data.name,
        title: data.title,
        body: data.body,
        image_hash: data.imageHash,
        object_url: data.objectUrl,
        call_to_action_type: data.callToActionType,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async createVideoAdCreative(
    accountId: string,
    data: {
      name: string;
      title: string;
      body: string;
      videoId: string;
      objectUrl: string;
      callToActionType: string;
      thumbnailUrl?: string;
    }
  ): Promise<any> {
    const params: any = {
      name: data.name,
      title: data.title,
      body: data.body,
      video_id: data.videoId,
      object_url: data.objectUrl,
      call_to_action_type: data.callToActionType,
      access_token: this.accessToken,
    };
    if (data.thumbnailUrl) params.image_url = data.thumbnailUrl;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/adcreatives`,
      params,
    });
    return response.data;
  }

  async uploadImage(accountId: string, imageUrl: string): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/adimages`,
      params: {
        url: imageUrl,
        access_token: this.accessToken,
      },
    });
    return response.data?.images?.[Object.keys(response.data?.images || {})[0]]?.hash || '';
  }

  async uploadVideo(
    accountId: string,
    videoUrl: string,
    title?: string
  ): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/act_${accountId}/advideos`,
      params: {
        file_url: videoUrl,
        title: title || 'Video Upload',
        access_token: this.accessToken,
      },
    });
    return response.data?.id || '';
  }

  // ============================================================
  // Instagram
  // ============================================================
  async getInstagramAccount(pageId: string): Promise<InstagramAccount | null> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${pageId}`,
      params: {
        fields: 'instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count,website,biography}',
      },
    });

    const ig = response.data?.instagram_business_account;
    if (!ig) return null;

    return {
      id: ig.id,
      username: ig.username,
      name: ig.name,
      profilePicture: ig.profile_picture_url || '',
      followers: ig.followers_count || 0,
      follows: ig.follows_count || 0,
      mediaCount: ig.media_count || 0,
      website: ig.website || '',
      biography: ig.biography || '',
    };
  }

  async getInstagramInsights(
    igUserId: string,
    metrics: string[],
    period: 'day' | 'week' | 'days_28' | 'month' = 'day',
    since?: string,
    until?: string
  ): Promise<any> {
    const params: any = {
      metric: metrics.join(','),
      period,
    };
    if (since) params.since = since;
    if (until) params.until = until;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/insights`,
      params,
    });
    return response.data;
  }

  async getInstagramMedia(igUserId: string, limit: number = 50): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/media`,
      params: {
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{media_url,media_type}',
        limit,
      },
    });
    return response.data;
  }

  async getInstagramMediaInsights(mediaId: string, metrics: string[]): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/insights`,
      params: {
        metric: metrics.join(','),
      },
    });
    return response.data;
  }

  async getInstagramStories(igUserId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/stories`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp',
      },
    });
    return response.data;
  }

  // ============================================================
  // Content Publishing (Instagram)
  // ============================================================
  async publishInstagramMedia(
    igUserId: string,
    data: { mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL'; caption: string; mediaUrl: string; locationId?: string }
  ): Promise<any> {
    const params: any = {
      media_type: data.mediaType,
      caption: data.caption,
      access_token: this.accessToken,
    };

    if (data.mediaType === 'IMAGE') {
      params.image_url = data.mediaUrl;
    } else if (data.mediaType === 'VIDEO') {
      params.video_url = data.mediaUrl;
    }
    if (data.locationId) params.location_id = data.locationId;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media`,
      params,
    });

    const creationId = response.data.id;

    // Publish the media container
    const publishResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return { creationId, ...publishResponse.data };
  }

  async publishInstagramReel(
    igUserId: string,
    data: { videoUrl: string; caption: string; thumbOffset?: number; coverUrl?: string }
  ): Promise<any> {
    const params: any = {
      media_type: 'REELS',
      video_url: data.videoUrl,
      caption: data.caption,
      access_token: this.accessToken,
    };
    if (data.thumbOffset) params.thumb_offset = data.thumbOffset;
    if (data.coverUrl) params.cover_url = data.coverUrl;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media`,
      params,
    });

    const creationId = response.data.id;

    // Publish the reel
    const publishResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return { creationId, ...publishResponse.data };
  }

  async publishInstagramStory(
    igUserId: string,
    data: { mediaType: 'IMAGE' | 'VIDEO'; mediaUrl: string; caption?: string }
  ): Promise<any> {
    const params: any = {
      media_type: data.mediaType,
      access_token: this.accessToken,
    };

    if (data.mediaType === 'IMAGE') {
      params.image_url = data.mediaUrl;
    } else {
      params.video_url = data.mediaUrl;
    }

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media_stories`,
      params,
    });

    return response.data;
  }

  // ============================================================
  // Instagram Shopping & Tags
  // ============================================================
  async tagInstagramMediaProduct(
    mediaId: string,
    productTags: Array<{ productId: string; x: number; y: number }>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${mediaId}/tags`,
      params: {
        tags: JSON.stringify(
          productTags.map((t) => ({
            product_id: t.productId,
            x: t.x,
            y: t.y,
          }))
        ),
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getInstagramShoppingCatalogs(igUserId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/shopping_catalogs`,
      params: {
        fields: 'id,name,product_count,store_name',
      },
    });
    return response.data;
  }

  // ============================================================
  // Hashtag Analytics
  // ============================================================
  async getInstagramHashtagSearch(igUserId: string, hashtagName: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/hashtags`,
      params: {
        q: hashtagName,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getInstagramHashtagInsights(
    hashtagId: string,
    metrics: string[],
    period: 'day' | 'week' = 'day'
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${hashtagId}/insights`,
      params: {
        metric: metrics.join(','),
        period,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Instagram Account Insights (Audience)
  // ============================================================
  async getInstagramAudienceInsights(
    igUserId: string,
    metrics: string[],
    breakdown: 'age' | 'gender' | 'country' | 'city'
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/insights`,
      params: {
        metric: metrics.join(','),
        period: 'lifetime',
        breakdown,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }
}
