// ============================================================
// Snapchat Marketing API - Complete Service
// ============================================================
// Manages Snapchat advertising operations:
// - OAuth authentication
// - Organization & advertiser management
// - Campaign CRUD operations
// - Ad squad (ad set) management
// - Ad and creative management
// - Lenses & Filters
// - Story Ads & Commercials
// - Analytics and insights
// ============================================================

import { AxiosInstance } from 'axios';
import { SNAPCHAT_CONFIG } from '../config';
import { createApiClient, makeApiCall } from '../utils/apiClient';
import { tokenManager } from '../utils/tokenManager';
import {
  getSnapchatAuthUrl,
  handleSnapchatCallback,
  refreshSnapchatToken,
  getSnapchatOrganizations,
} from './auth';

// ============================================================
// Types
// ============================================================
export interface SnapchatCampaignData {
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  startTime: string;
  endTime?: string;
  dailyBudgetMicro?: number;
  lifetimeBudgetMicro?: number;
  adProduct: 'SNAP_ADS' | 'LENSES' | 'FILTERS' | 'STORY_ADS' | 'COMMERCIALS' | 'COLLECTION_ADS' | 'SPOTLIGHT_ADS';
  objective: 'AWARENESS' | 'APP_INSTALL' | 'WEBSITE_CONVERSION' | 'LEAD_GENERATION' | 'LONG_VIDEO_VIEW' | 'TRAFFIC' | 'VIDEO_VIEW';
}

export interface SnapchatAdSquadData {
  name: string;
  campaignId: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  targeting: any;
  budgetMicro: number;
  budgetType: 'DAILY' | 'LIFETIME';
  bidMicro?: number;
  optimizationGoal: string;
  billingEvent: string;
  startTime: string;
  endTime?: string;
  placement?: string;
  creativeType?: string;
}

export interface SnapchatAdData {
  name: string;
  adSquadId: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  creative: SnapchatCreativeData;
}

export interface SnapchatCreativeData {
  type: 'IMAGE' | 'VIDEO' | 'LENS' | 'FILTER' | 'STORY' | 'COMMERCIAL' | 'COLLECTION';
  name: string;
  brandName?: string;
  headline?: string;
  callToAction?: string;
  imageUrl?: string;
  videoUrl?: string;
  redirectUrl?: string;
  deepLink?: string;
  topSnapMediaUrl?: string;
  topSnapMediaType?: 'IMAGE' | 'VIDEO';
  bottomSnapMediaUrl?: string;
  attachmentUrl?: string;
  collectionItems?: any[];
  lensId?: string;
  filterId?: string;
}

// ============================================================
// Snapchat Service Class
// ============================================================
export class SnapchatService {
  private organizationId: string;
  private advertiserId: string;
  private client: AxiosInstance;
  private accessToken: string;

  constructor(
    accessToken: string,
    organizationId: string,
    advertiserId: string
  ) {
    this.accessToken = accessToken;
    this.organizationId = organizationId;
    this.advertiserId = advertiserId;
    this.client = createApiClient({
      baseUrl: SNAPCHAT_CONFIG.baseUrl,
      platform: 'snapchat',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      getAccessToken: async () => this.accessToken,
      onTokenRefresh: async () => {
        try {
          const tokens = tokenManager.getTokens('snapchat', 'default');
          if (tokens?.refreshToken) {
            const refreshed = await refreshSnapchatToken(tokens.refreshToken);
            this.accessToken = refreshed.accessToken;
            return refreshed.accessToken;
          }
          return null;
        } catch {
          return null;
        }
      },
    });
  }

  // ============================================================
  // Static OAuth
  // ============================================================
  static getAuthUrl(state?: string): string {
    return getSnapchatAuthUrl(state);
  }

  static async handleCallback(code: string) {
    return handleSnapchatCallback(code);
  }

  static async refreshToken(refreshToken: string) {
    return refreshSnapchatToken(refreshToken);
  }

  static async getOrganizations(accessToken: string) {
    return getSnapchatOrganizations(accessToken);
  }

  // ============================================================
  // Organizations & Advertisers
  // ============================================================
  async getOrganizations(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/me/organizations',
    });
    return response.data?.organizations || [];
  }

  async getOrganization(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/organizations/${this.organizationId}`,
    });
    return response.data?.organization;
  }

  async getAdvertisers(): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/organizations/${this.organizationId}/adaccounts`,
    });
    return response.data?.adaccounts || [];
  }

  async getAdvertiser(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adaccounts/${this.advertiserId}`,
    });
    return response.data?.adaccount;
  }

  // ============================================================
  // Campaigns
  // ============================================================
  async createCampaign(data: SnapchatCampaignData): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adaccounts/${this.advertiserId}/campaigns`,
      data: {
        campaigns: [
          {
            name: data.name,
            status: data.status,
            start_time: data.startTime,
            end_time: data.endTime,
            daily_budget_micro: data.dailyBudgetMicro,
            lifetime_budget_micro: data.lifetimeBudgetMicro,
            ad_product: data.adProduct,
            objective: data.objective,
          },
        ],
      },
    });
    return response.data;
  }

  async getCampaigns(status?: string): Promise<any> {
    const params: any = {};
    if (status) params.status = status;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adaccounts/${this.advertiserId}/campaigns`,
      params,
    });
    return response.data;
  }

  async getCampaign(campaignId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/campaigns/${campaignId}`,
    });
    return response.data;
  }

  async updateCampaign(
    campaignId: string,
    data: Partial<SnapchatCampaignData>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'PUT',
      url: `/campaigns/${campaignId}`,
      data: {
        campaigns: [{ id: campaignId, ...data }],
      },
    });
    return response.data;
  }

  async deleteCampaign(campaignId: string): Promise<any> {
    return this.updateCampaign(campaignId, { status: 'ARCHIVED' });
  }

  // ============================================================
  // Ad Squads (Ad Sets)
  // ============================================================
  async createAdSquad(data: SnapchatAdSquadData): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/campaigns/${data.campaignId}/adsquads`,
      data: {
        adsquads: [
          {
            name: data.name,
            campaign_id: data.campaignId,
            status: data.status,
            targeting: JSON.stringify(data.targeting),
            budget_micro: data.budgetMicro,
            budget_type: data.budgetType,
            bid_micro: data.bidMicro,
            optimization_goal: data.optimizationGoal,
            billing_event: data.billingEvent,
            start_time: data.startTime,
            end_time: data.endTime,
            placement: data.placement,
            creative_type: data.creativeType,
          },
        ],
      },
    });
    return response.data;
  }

  async getAdSquads(campaignId?: string): Promise<any> {
    const url = campaignId
      ? `/campaigns/${campaignId}/adsquads`
      : `/adaccounts/${this.advertiserId}/adsquads`;

    const response = await makeApiCall(this.client, { method: 'GET', url });
    return response.data;
  }

  async updateAdSquad(
    adSquadId: string,
    data: Partial<SnapchatAdSquadData>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'PUT',
      url: `/adsquads/${adSquadId}`,
      data: { adsquads: [{ id: adSquadId, ...data }] },
    });
    return response.data;
  }

  // ============================================================
  // Ads
  // ============================================================
  async createAd(data: SnapchatAdData): Promise<any> {
    // First create the creative
    const creativeResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adsquads/${data.adSquadId}/creatives`,
      data: {
        creatives: [
          {
            type: data.creative.type,
            name: data.creative.name,
            brand_name: data.creative.brandName,
            headline: data.creative.headline,
            call_to_action: data.creative.callToAction,
            media_url: data.creative.imageUrl || data.creative.videoUrl,
            redirect_url: data.creative.redirectUrl,
            deep_link: data.creative.deepLink,
            top_snap_media_url: data.creative.topSnapMediaUrl,
            top_snap_media_type: data.creative.topSnapMediaType,
            bottom_snap_media_url: data.creative.bottomSnapMediaUrl,
            attachment_url: data.creative.attachmentUrl,
          },
        ],
      },
    });

    const creativeId = creativeResponse.data?.creatives?.[0]?.id;
    if (!creativeId) throw new Error('فشل في إنشاء المحتوى الإبداعي');

    // Then create the ad
    const adResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adsquads/${data.adSquadId}/ads`,
      data: {
        ads: [
          {
            name: data.name,
            ad_squad_id: data.adSquadId,
            status: data.status,
            creative_id: creativeId,
          },
        ],
      },
    });

    return { ...adResponse.data, creativeId };
  }

  async getAds(adSquadId?: string): Promise<any> {
    const url = adSquadId
      ? `/adsquads/${adSquadId}/ads`
      : `/adaccounts/${this.advertiserId}/ads`;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url,
    });
    return response.data;
  }

  async updateAd(adId: string, data: Partial<SnapchatAdData>): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'PUT',
      url: `/ads/${adId}`,
      data: { ads: [{ id: adId, ...data }] },
    });
    return response.data;
  }

  // ============================================================
  // Lenses
  // ============================================================
  async createLens(data: {
    name: string;
    lensFileUrl: string;
    previewImageUrl: string;
    startTime: string;
    endTime: string;
    geofence?: any;
    budgetMicro: number;
  }): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adaccounts/${this.advertiserId}/lenses`,
      data: {
        lenses: [
          {
            name: data.name,
            lens_file_url: data.lensFileUrl,
            preview_image_url: data.previewImageUrl,
            start_time: data.startTime,
            end_time: data.endTime,
            geofence: data.geofence,
            budget_micro: data.budgetMicro,
          },
        ],
      },
    });
    return response.data;
  }

  async getLenses(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adaccounts/${this.advertiserId}/lenses`,
    });
    return response.data;
  }

  // ============================================================
  // Filters
  // ============================================================
  async createFilter(data: {
    name: string;
    filterFileUrl: string;
    startTime: string;
    endTime: string;
    geofence?: any;
    budgetMicro: number;
  }): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adaccounts/${this.advertiserId}/filters`,
      data: {
        filters: [
          {
            name: data.name,
            filter_file_url: data.filterFileUrl,
            start_time: data.startTime,
            end_time: data.endTime,
            geofence: data.geofence,
            budget_micro: data.budgetMicro,
          },
        ],
      },
    });
    return response.data;
  }

  async getFilters(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adaccounts/${this.advertiserId}/filters`,
    });
    return response.data;
  }

  // ============================================================
  // Story Ads
  // ============================================================
  async createStoryAd(data: {
    name: string;
    adSquadId: string;
    brandName: string;
    headline: string;
    callToAction: string;
    topSnapMediaUrl: string;
    topSnapMediaType: 'IMAGE' | 'VIDEO';
    bottomSnapMediaUrl: string;
    redirectUrl: string;
  }): Promise<any> {
    return this.createAd({
      name: data.name,
      adSquadId: data.adSquadId,
      status: 'ACTIVE',
      creative: {
        type: 'STORY',
        name: data.name,
        brandName: data.brandName,
        headline: data.headline,
        callToAction: data.callToAction,
        topSnapMediaUrl: data.topSnapMediaUrl,
        topSnapMediaType: data.topSnapMediaType,
        bottomSnapMediaUrl: data.bottomSnapMediaUrl,
        redirectUrl: data.redirectUrl,
      },
    });
  }

  // ============================================================
  // Commercials (6s Non-Skippable)
  // ============================================================
  async createCommercial(data: {
    name: string;
    adSquadId: string;
    videoUrl: string;
    redirectUrl: string;
    brandName: string;
    callToAction: string;
  }): Promise<any> {
    return this.createAd({
      name: data.name,
      adSquadId: data.adSquadId,
      status: 'ACTIVE',
      creative: {
        type: 'COMMERCIAL',
        name: data.name,
        brandName: data.brandName,
        callToAction: data.callToAction,
        videoUrl: data.videoUrl,
        redirectUrl: data.redirectUrl,
      },
    });
  }

  // ============================================================
  // Collection Ads
  // ============================================================
  async createCollectionAd(data: {
    name: string;
    adSquadId: string;
    brandName: string;
    headline: string;
    callToAction: string;
    topSnapMediaUrl: string;
    collectionItems: Array<{
      imageUrl: string;
      name: string;
      price: string;
      redirectUrl: string;
    }>;
  }): Promise<any> {
    return this.createAd({
      name: data.name,
      adSquadId: data.adSquadId,
      status: 'ACTIVE',
      creative: {
        type: 'COLLECTION',
        name: data.name,
        brandName: data.brandName,
        headline: data.headline,
        callToAction: data.callToAction,
        topSnapMediaUrl: data.topSnapMediaUrl,
        collectionItems: data.collectionItems,
      },
    });
  }

  // ============================================================
  // Analytics & Insights
  // ============================================================
  async getCampaignInsights(
    campaignIds: string[],
    startTime: string,
    endTime: string,
    granularity: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' = 'DAY'
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/campaigns/${campaignIds[0]}/stats`,
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity,
        types: 'impressions,swipes,spend,video_views,conversions,screenshots',
      },
    });
    return response.data;
  }

  async getAdSquadInsights(
    adSquadId: string,
    startTime: string,
    endTime: string,
    granularity: 'DAY' = 'DAY'
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adsquads/${adSquadId}/stats`,
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity,
        types: 'impressions,swipes,spend,video_views,conversions,screenshots',
      },
    });
    return response.data;
  }

  async getAdInsights(
    adId: string,
    startTime: string,
    endTime: string
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/ads/${adId}/stats`,
      params: {
        start_time: startTime,
        end_time: endTime,
        granularity: 'DAY',
        types: 'impressions,swipes,spend,video_views,conversions,screenshots',
      },
    });
    return response.data;
  }

  async getAnalytics(
    dateRange: { start: string; end: string },
    level: 'CAMPAIGN' | 'ADSQUAD' | 'AD' = 'CAMPAIGN',
    ids?: string[]
  ): Promise<any> {
    if (!ids || ids.length === 0) {
      throw new Error('IDs required for analytics');
    }

    if (level === 'CAMPAIGN') {
      return this.getCampaignInsights(ids, dateRange.start, dateRange.end);
    } else if (level === 'ADSQUAD') {
      return this.getAdSquadInsights(ids[0], dateRange.start, dateRange.end);
    } else {
      return this.getAdInsights(ids[0], dateRange.start, dateRange.end);
    }
  }

  // ============================================================
  // Media Upload
  // ============================================================
  async uploadMedia(mediaUrl: string): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adaccounts/${this.advertiserId}/media`,
      data: {
        media: [
          {
            url: mediaUrl,
            type: mediaUrl.match(/\.(mp4|mov|avi)$/i) ? 'VIDEO' : 'IMAGE',
          },
        ],
      },
    });
    return response.data?.media?.[0]?.id || '';
  }

  // ============================================================
  // Targeting Templates
  // ============================================================
  async getTargetingTemplates(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/adaccounts/${this.advertiserId}/targeting_templates`,
    });
    return response.data;
  }

  async createTargetingTemplate(data: {
    name: string;
    targeting: any;
    sourceProduct?: string;
  }): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/adaccounts/${this.advertiserId}/targeting_templates`,
      data: {
        targeting_templates: [
          {
            name: data.name,
            targeting: JSON.stringify(data.targeting),
            source_product: data.sourceProduct,
          },
        ],
      },
    });
    return response.data;
  }
}
