// ============================================================
// TikTok Business API - Complete Service
// ============================================================
// Manages TikTok advertising operations:
// - OAuth authentication
// - Advertiser management
// - Campaign CRUD operations
// - Ad group management
// - Ad and creative management
// - Analytics and insights
// - Video upload (chunked)
// - Spark Ads (organic post boosting)
// - Lead generation forms
// ============================================================

import { AxiosInstance } from 'axios';
import { TIKTOK_CONFIG } from '../config';
import { createApiClient, makeApiCall } from '../utils/apiClient';
import { tokenManager } from '../utils/tokenManager';
import {
  getTikTokAuthUrl,
  handleTikTokCallback,
  refreshTikTokToken,
  getTikTokAdvertiserInfo,
} from './auth';

// ============================================================
// Types
// ============================================================
export interface TikTokCampaignData {
  campaignName: string;
  objectiveType: 'AWARENESS' | 'TRAFFIC' | 'INTERACTION' | 'CONVERSION' | 'LEAD_GENERATION' | 'VIDEO_VIEWS' | 'REACH';
  budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL' | 'BUDGET_MODE_INFINITE';
  budget?: number;
  startTime?: string; // Unix timestamp
  endTime?: string;
  status: 'SENT' | 'DRAFT' | 'STATUS_PAUSE';
  operation?: 'ENABLE' | 'DISABLE' | 'DELETE';
  splitTestVariable?: string[];
}

export interface TikTokAdGroupData {
  campaignId: string;
  adGroupName: string;
  placementType: 'PLACEMENT_TYPE_STANDARD' | 'PLACEMENT_TYPE_AUTOMATIC';
  placementIds?: string[];
  targeting: any;
  budgetMode: 'BUDGET_MODE_DAY' | 'BUDGET_MODE_TOTAL';
  budget: number;
  bidType: 'BID_TYPE_CPC' | 'BID_TYPE_CPM' | 'BID_TYPE_OCPM';
  bidPrice?: number;
  optimizationGoal: string;
  billingEvent: string;
  startTime: string;
  endTime?: string;
  status: 'SENT' | 'DRAFT' | 'STATUS_PAUSE';
  frequency?: number;
  frequencySchedule?: any;
}

export interface TikTokAdData {
  adGroupId: string;
  adName: string;
  creatives: TikTokCreativeData[];
  status: 'SENT' | 'DRAFT' | 'STATUS_PAUSE';
  trackingPixelId?: string;
  clickTrackingUrl?: string;
  impressionTrackingUrl?: string;
}

export interface TikTokCreativeData {
  creativeName: string;
  identityType: 'CUSTOMIZED_USER' | 'AUTH_AD_ACCOUNT';
  identityId?: string;
  imageIds?: string[];
  videoId?: string;
  title?: string;
  callToAction?: string;
  landingPageUrl?: string;
  displayName?: string;
  profileImageId?: string;
  adFormat?: string;
  musicId?: string;
  leadFormId?: string;
  sparkAd?: {
    sparkAdId: string;
    advertiserId: string;
  };
}

// ============================================================
// TikTok Service Class
// ============================================================
export class TikTokService {
  private advertiserId: string;
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string, advertiserId: string) {
    this.accessToken = accessToken;
    this.advertiserId = advertiserId;
    this.client = createApiClient({
      baseUrl: TIKTOK_CONFIG.baseUrl,
      platform: 'tiktok',
      headers: {
        'Access-Token': accessToken,
      },
      getAccessToken: async () => this.accessToken,
      onTokenRefresh: async () => {
        try {
          const tokens = tokenManager.getTokens('tiktok', advertiserId);
          if (tokens?.refreshToken) {
            const refreshed = await refreshTikTokToken(tokens.refreshToken);
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
    return getTikTokAuthUrl({ state });
  }

  static async handleCallback(code: string) {
    return handleTikTokCallback(code);
  }

  static async refreshToken(refreshToken: string) {
    return refreshTikTokToken(refreshToken);
  }

  // ============================================================
  // Advertisers
  // ============================================================
  async getAdvertisers(): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/advertiser/info/',
      params: { advertiser_ids: '[]' },
    });
    return response.data?.data?.list || response.data?.data || [];
  }

  async getAdvertiserInfo(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/advertiser/info/`,
      params: { advertiser_ids: JSON.stringify([this.advertiserId]) },
    });
    return response.data?.data?.list?.[0] || response.data?.data;
  }

  // ============================================================
  // Campaigns
  // ============================================================
  async createCampaign(data: TikTokCampaignData): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/campaign/create/',
      data: {
        advertiser_id: this.advertiserId,
        campaign_name: data.campaignName,
        objective_type: data.objectiveType,
        budget_mode: data.budgetMode,
        budget: data.budget,
        start_time: data.startTime,
        end_time: data.endTime,
        status: data.status,
        ...(data.splitTestVariable ? { split_test_variable: data.splitTestVariable } : {}),
      },
    });
    return response.data;
  }

  async getCampaigns(
    status?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<any> {
    const params: any = {
      advertiser_id: this.advertiserId,
      page,
      page_size: pageSize,
    };
    if (status) params.filtering = JSON.stringify([{ field: 'status', operator: 'EQ', values: [status] }]);

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/campaign/get/',
      params,
    });
    return response.data;
  }

  async getCampaign(campaignId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/campaign/get/',
      params: {
        advertiser_id: this.advertiserId,
        filtering: JSON.stringify([{ field: 'campaign_ids', operator: 'IN', values: [campaignId] }]),
      },
    });
    return response.data;
  }

  async updateCampaign(
    campaignId: string,
    data: Partial<TikTokCampaignData>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/campaign/update/',
      data: {
        advertiser_id: this.advertiserId,
        campaign_id: campaignId,
        ...(data.campaignName ? { campaign_name: data.campaignName } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {}),
        ...(data.budgetMode ? { budget_mode: data.budgetMode } : {}),
        ...(data.endTime ? { end_time: data.endTime } : {}),
        ...(data.operation ? { operation: data.operation } : {}),
      },
    });
    return response.data;
  }

  async deleteCampaign(campaignId: string): Promise<any> {
    return this.updateCampaign(campaignId, { operation: 'DELETE' });
  }

  // ============================================================
  // Ad Groups (Ad Sets)
  // ============================================================
  async createAdGroup(data: TikTokAdGroupData): Promise<any> {
    const payload: any = {
      advertiser_id: this.advertiserId,
      campaign_id: data.campaignId,
      adgroup_name: data.adGroupName,
      placement_type: data.placementType,
      targeting: JSON.stringify(data.targeting),
      budget_mode: data.budgetMode,
      budget: data.budget,
      bid_type: data.bidType,
      optimization_goal: data.optimizationGoal,
      billing_event: data.billingEvent,
      start_time: data.startTime,
      status: data.status,
    };

    if (data.placementIds) payload.placement_ids = data.placementIds;
    if (data.bidPrice) payload.bid_price = data.bidPrice;
    if (data.endTime) payload.end_time = data.endTime;
    if (data.frequency) payload.frequency = data.frequency;
    if (data.frequencySchedule) payload.frequency_schedule = JSON.stringify(data.frequencySchedule);

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/adgroup/create/',
      data: payload,
    });
    return response.data;
  }

  async getAdGroups(campaignId?: string, page: number = 1, pageSize: number = 100): Promise<any> {
    const params: any = {
      advertiser_id: this.advertiserId,
      page,
      page_size: pageSize,
    };
    if (campaignId) {
      params.filtering = JSON.stringify([{ field: 'campaign_ids', operator: 'IN', values: [campaignId] }]);
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/adgroup/get/',
      params,
    });
    return response.data;
  }

  async updateAdGroup(adGroupId: string, data: Partial<TikTokAdGroupData>): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/adgroup/update/',
      data: {
        advertiser_id: this.advertiserId,
        adgroup_id: adGroupId,
        ...data,
      },
    });
    return response.data;
  }

  // ============================================================
  // Ads
  // ============================================================
  async createAd(data: TikTokAdData): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/ad/create/',
      data: {
        advertiser_id: this.advertiserId,
        adgroup_id: data.adGroupId,
        ad_name: data.adName,
        creatives: data.creatives.map((c) => ({
          creative_name: c.creativeName,
          identity_type: c.identityType,
          identity_id: c.identityId,
          image_ids: c.imageIds,
          video_id: c.videoId,
          title: c.title,
          call_to_action: c.callToAction,
          landing_page_url: c.landingPageUrl,
          display_name: c.displayName,
          profile_image_id: c.profileImageId,
          ad_format: c.adFormat,
          music_id: c.musicId,
          lead_form_id: c.leadFormId,
          ...(c.sparkAd ? { spark_ad: c.sparkAd } : {}),
        })),
        status: data.status,
        ...(data.trackingPixelId ? { tracking_pixel_id: data.trackingPixelId } : {}),
        ...(data.clickTrackingUrl ? { click_tracking_url: data.clickTrackingUrl } : {}),
        ...(data.impressionTrackingUrl ? { impression_tracking_url: data.impressionTrackingUrl } : {}),
      },
    });
    return response.data;
  }

  async getAds(
    adGroupId?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<any> {
    const params: any = {
      advertiser_id: this.advertiserId,
      page,
      page_size: pageSize,
    };
    if (adGroupId) {
      params.filtering = JSON.stringify([{ field: 'adgroup_ids', operator: 'IN', values: [adGroupId] }]);
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/ad/get/',
      params,
    });
    return response.data;
  }

  async updateAd(adId: string, data: Partial<TikTokAdData>): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/ad/update/',
      data: {
        advertiser_id: this.advertiserId,
        ad_id: adId,
        ...data,
      },
    });
    return response.data;
  }

  async deleteAd(adId: string): Promise<any> {
    return this.updateAd(adId, {
      status: 'DELETE' as any,
      adGroupId: '', // placeholder
      creatives: [], // placeholder
      adName: '', // placeholder
    });
  }

  // ============================================================
  // Analytics & Insights
  // ============================================================
  async getCampaignInsights(
    campaignIds: string[],
    dateRange: { start: string; end: string },
    dimensions?: string[],
    metrics?: string[]
  ): Promise<any> {
    const defaultMetrics = [
      'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'cost',
      'reach', 'conversion', 'cost_per_conversion', 'conversion_rate',
      'video_views', 'video_views_3s', 'video_watched_2s',
      'video_watched_6s', 'video_views_p25', 'video_views_p50',
      'video_views_p75', 'video_views_p100', 'likes', 'comments',
      'shares', 'follows', 'total_sales', 'total_purchase_value',
      'roas',
    ];

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/insights/campaigns/get/',
      data: {
        advertiser_id: this.advertiserId,
        campaign_ids: campaignIds,
        start_date: dateRange.start,
        end_date: dateRange.end,
        dimensions: dimensions || ['campaign_id', 'stat_time_day'],
        metrics: metrics || defaultMetrics,
      },
    });
    return response.data;
  }

  async getAdGroupInsights(
    adGroupIds: string[],
    dateRange: { start: string; end: string },
    metrics?: string[]
  ): Promise<any> {
    const defaultMetrics = [
      'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'cost',
      'reach', 'conversion', 'cost_per_conversion', 'conversion_rate',
      'video_views', 'video_views_3s', 'video_watched_2s', 'video_watched_6s',
      'likes', 'comments', 'shares', 'follows',
    ];

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/insights/adgroups/get/',
      data: {
        advertiser_id: this.advertiserId,
        adgroup_ids: adGroupIds,
        start_date: dateRange.start,
        end_date: dateRange.end,
        metrics: metrics || defaultMetrics,
      },
    });
    return response.data;
  }

  async getAdInsights(
    adIds: string[],
    dateRange: { start: string; end: string },
    metrics?: string[]
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/insights/ads/get/',
      data: {
        advertiser_id: this.advertiserId,
        ad_ids: adIds,
        start_date: dateRange.start,
        end_date: dateRange.end,
        metrics: metrics || [
          'impressions', 'clicks', 'ctr', 'cpc', 'cpm', 'cost',
          'conversion', 'cost_per_conversion', 'video_views',
          'likes', 'comments', 'shares',
        ],
      },
    });
    return response.data;
  }

  async getAnalytics(
    dateRange: { start: string; end: string },
    level: 'CAMPAIGN' | 'ADGROUP' | 'AD' = 'CAMPAIGN',
    ids?: string[]
  ): Promise<any> {
    if (level === 'CAMPAIGN' && ids) {
      return this.getCampaignInsights(ids, dateRange);
    } else if (level === 'ADGROUP' && ids) {
      return this.getAdGroupInsights(ids, dateRange);
    } else if (level === 'AD' && ids) {
      return this.getAdInsights(ids, dateRange);
    }
    throw new Error('IDs required for analytics query');
  }

  // ============================================================
  // Video Upload (Chunked)
  // ============================================================
  async uploadVideo(videoUrl: string, fileName: string): Promise<string> {
    // Step 1: Initialize upload
    const initResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/video/upload/',
      data: {
        advertiser_id: this.advertiserId,
        upload_type: 'UPLOAD_BY_URL',
        video_url: videoUrl,
        file_name: fileName,
      },
    });

    return initResponse.data?.data?.video_id || '';
  }

  async uploadVideoChunked(
    filePath: string,
    fileName: string,
    fileSize: number
  ): Promise<string> {
    // Step 1: Initialize chunked upload
    const initResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/video/init_upload/',
      data: {
        advertiser_id: this.advertiserId,
        file_name: fileName,
        file_size: fileSize,
        upload_type: 'UPLOAD_BY_CHUNK',
      },
    });

    const { upload_id } = initResponse.data?.data || {};

    // Steps 2-N: Upload chunks
    // (Implementation would read file in chunks and POST each)
    // For simplicity, we return the upload_id for the caller to implement
    return upload_id;
  }

  // ============================================================
  // Image Upload
  // ============================================================
  async uploadImage(imageUrl: string, fileName?: string): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/image/upload/',
      data: {
        advertiser_id: this.advertiserId,
        upload_type: 'UPLOAD_BY_URL',
        image_url: imageUrl,
        file_name: fileName || 'image.jpg',
      },
    });
    return response.data?.data?.image_id || '';
  }

  // ============================================================
  // Music
  // ============================================================
  async getMusicList(keyword?: string): Promise<any[]> {
    const params: any = { advertiser_id: this.advertiserId, page: 1, page_size: 20 };
    if (keyword) params.keyword = keyword;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/music/get/',
      params,
    });
    return response.data?.data?.list || [];
  }

  // ============================================================
  // Spark Ads (Organic Post Boosting)
  // ============================================================
  async getSparkAdList(
    sparkAdvertiserId?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/spark_ad/get/',
      params: {
        advertiser_id: this.advertiserId,
        spark_advertiser_id: sparkAdvertiserId || this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  }

  async createSparkAd(
    sparkAdId: string,
    sparkAdvertiserId: string
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/spark_ad/create/',
      data: {
        advertiser_id: this.advertiserId,
        spark_ad_id: sparkAdId,
        spark_ad_advertiser_id: sparkAdvertiserId,
      },
    });
    return response.data;
  }

  // ============================================================
  // Lead Generation Forms
  // ============================================================
  async getLeadForms(page: number = 1, pageSize: number = 20): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/lead_form/list/',
      params: {
        advertiser_id: this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  }

  // ============================================================
  // Tracking Pixels
  // ============================================================
  async getTrackingPixels(page: number = 1, pageSize: number = 20): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/pixel/get/',
      params: {
        advertiser_id: this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  }

  // ============================================================
  // Audience / Targeting
  // ============================================================
  async getAudienceLists(page: number = 1, pageSize: number = 20): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/dmp/custom_audience/list/',
      params: {
        advertiser_id: this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  }

  async createCustomAudience(data: {
    name: string;
    type: 'FILE' | 'TIKTOK_PIXEL' | 'APP_EVENT';
    uploadType?: string;
    filePath?: string;
  }): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/dmp/custom_audience/create/',
      data: {
        advertiser_id: this.advertiserId,
        custom_audience_name: data.name,
        custom_audience_type: data.type,
      },
    });
    return response.data;
  }

  // ============================================================
  // Profile Card & Call-to-Action
  // ============================================================
  async updateProfileCard(data: {
    profileCardTitle: string;
    profileCardSubtitle?: string;
    profileCardImageId?: string;
    profileCardButton?: string;
    profileCardUrl?: string;
  }): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/profile_card/update/',
      data: {
        advertiser_id: this.advertiserId,
        profile_card_title: data.profileCardTitle,
        profile_card_subtitle: data.profileCardSubtitle,
        profile_card_image_id: data.profileCardImageId,
        profile_card_button: data.profileCardButton,
        profile_card_url: data.profileCardUrl,
      },
    });
    return response.data;
  }

  // ============================================================
  // Category & Interest Targeting
  // ============================================================
  async getInterestCategories(parentId?: string): Promise<any> {
    const params: any = { advertiser_id: this.advertiserId };
    if (parentId) params.parent_id = parentId;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/targeting/category/get/',
      params,
    });
    return response.data;
  }
}
