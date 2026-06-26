// ============================================================
// Google Service - Analytics, Ads, Search Console & YouTube
// ============================================================
// Integrates Google services for cross-platform reporting:
// - Google Analytics 4 (GA4) Data API
// - Google Ads API
// - Google Search Console API
// - YouTube Data & Analytics APIs
// - Cross-platform reporting with social media data
// ============================================================

import { AxiosInstance } from 'axios';
import { GOOGLE_CONFIG } from '../config';
import { createApiClient, makeApiCall } from '../utils/apiClient';

// ============================================================
// Types
// ============================================================
export interface GoogleAnalyticsParams {
  startDate: string;
  endDate: string;
  metrics: string[];
  dimensions?: string[];
  limit?: number;
  offset?: number;
  orderBy?: string[];
  dimensionFilter?: any;
}

export interface GoogleAdsParams {
  customerId: string;
  startDate: string;
  endDate: string;
  metrics: string[];
  segments?: string[];
  limit?: number;
  pageToken?: string;
}

export interface SearchConsoleParams {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
}

export interface YouTubeAnalyticsParams {
  channelId: string;
  startDate: string;
  endDate: string;
  metrics: string[];
  dimensions?: string[];
}

// ============================================================
// Google Service Class
// ============================================================
export class GoogleService {
  private accessToken: string;
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = createApiClient({
      baseUrl: 'https://www.googleapis.com',
      platform: 'google',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
      getAccessToken: async () => this.accessToken,
    });
  }

  // ============================================================
  // Google Analytics 4 (GA4) Data API
  // ============================================================
  async getAnalyticsData(
    propertyId: string,
    params: GoogleAnalyticsParams
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      data: {
        dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
        metrics: params.metrics.map((m) => ({ name: m })),
        dimensions: params.dimensions?.map((d) => ({ name: d })),
        limit: params.limit || 10000,
        offset: params.offset,
        orderBys: params.orderBy?.map((o) => ({ metric: { metricName: o } })),
        dimensionFilter: params.dimensionFilter,
      },
    });
    return response.data;
  }

  async getAnalyticsRealtime(
    propertyId: string,
    metrics: string[],
    dimensions?: string[]
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      data: {
        metrics: metrics.map((m) => ({ name: m })),
        dimensions: dimensions?.map((d) => ({ name: d })),
      },
    });
    return response.data;
  }

  async getAnalyticsMetadata(propertyId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}/metadata`,
    });
    return response.data;
  }

  // ============================================================
  // Common Analytics Reports
  // ============================================================
  async getTrafficReport(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getAnalyticsData(propertyId, {
      startDate,
      endDate,
      metrics: [
        'screenPageViews',
        'totalUsers',
        'newUsers',
        'sessions',
        'averageSessionDuration',
        'bounceRate',
        'activeUsers',
      ],
      dimensions: ['date', 'sessionSource', 'sessionMedium'],
    });
  }

  async getAcquisitionReport(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getAnalyticsData(propertyId, {
      startDate,
      endDate,
      metrics: [
        'totalUsers',
        'newUsers',
        'sessions',
        'engagedSessions',
        'engagementRate',
      ],
      dimensions: ['firstUserDefaultChannelGroup'],
    });
  }

  async getSocialTrafficReport(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const response = await this.getAnalyticsData(propertyId, {
      startDate,
      endDate,
      metrics: [
        'screenPageViews',
        'totalUsers',
        'sessions',
        'engagedSessions',
        'engagementRate',
        'sessionConversionRate',
        'totalRevenue',
        'transactions',
      ],
      dimensions: ['sessionSource'],
    });

    // Filter only social traffic sources
    const socialSources = [
      'facebook', 'instagram', 'tiktok', 'snapchat',
      'twitter', 'x.com', 'linkedin', 'youtube',
      'pinterest', 'reddit', 'whatsapp', 'messenger',
      'm.facebook.com', 'l.facebook.com',
    ];

    const rows = response.data?.rows || [];
    return rows.filter((row: any) => {
      const source = row.dimensionValues?.[0]?.value?.toLowerCase() || '';
      return socialSources.some((s) => source.includes(s));
    });
  }

  // ============================================================
  // Google Ads API
  // ============================================================
  async getAdsReport(
    customerId: string,
    params: GoogleAdsParams
  ): Promise<any> {
    const queryParts: string[] = [];

    // Build SELECT clause
    const selectFields = [
      ...params.metrics,
      ...(params.segments || []),
      'campaign.id', 'campaign.name', 'campaign.status',
      'ad_group.id', 'ad_group.name', 'ad_group.status',
    ];
    queryParts.push(`SELECT ${selectFields.join(', ')}`);

    // Build FROM clause
    queryParts.push('FROM campaign');

    // Build WHERE clause
    const conditions = [
      `segments.date BETWEEN '${params.startDate}' AND '${params.endDate}'`,
    ];
    queryParts.push(`WHERE ${conditions.join(' AND ')}`);

    // Build ORDER BY and LIMIT
    if (params.metrics.length > 0) {
      queryParts.push(`ORDER BY ${params.metrics[0]} DESC`);
    }
    queryParts.push(`LIMIT ${params.limit || 1000}`);

    const query = queryParts.join(' ');

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'developer-token': GOOGLE_CONFIG.ads.developerToken,
      },
      data: { query, pageToken: params.pageToken },
    });

    return response.data;
  }

  async getCampaigns(
    customerId: string,
    statuses?: string[]
  ): Promise<any> {
    const conditions = [];
    if (statuses && statuses.length > 0) {
      conditions.push(
        `campaign.status IN (${statuses.map((s) => `'${s}'`).join(', ')})`
      );
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'developer-token': GOOGLE_CONFIG.ads.developerToken,
      },
      data: {
        query: `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.start_date,
            campaign.end_date,
            campaign.advertising_channel_type,
            campaign.budget.amount_micros,
            campaign.budget.currency_code,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value
          FROM campaign
          ${whereClause}
          ORDER BY campaign.name
          LIMIT 1000
        `,
      },
    });

    return response.data;
  }

  async getAdGroups(customerId: string, campaignId?: string): Promise<any> {
    const conditions = [];
    if (campaignId) {
      conditions.push(`campaign.id = ${campaignId}`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'developer-token': GOOGLE_CONFIG.ads.developerToken,
      },
      data: {
        query: `
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.type,
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions
          FROM ad_group
          ${whereClause}
          ORDER BY ad_group.name
          LIMIT 1000
        `,
      },
    });

    return response.data;
  }

  // ============================================================
  // Google Search Console API
  // ============================================================
  async getSearchAnalytics(
    siteUrl: string,
    params: SearchConsoleParams
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `https://searchconsole.googleapis.com/v1/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      data: {
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions || ['date', 'query'],
        rowLimit: params.rowLimit || 1000,
      },
    });
    return response.data;
  }

  async getSearchPerformanceReport(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getSearchAnalytics(siteUrl, {
      siteUrl,
      startDate,
      endDate,
      dimensions: ['date', 'query', 'page', 'device', 'country'],
    });
  }

  async listSites(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: 'https://searchconsole.googleapis.com/v1/sites',
    });
    return response.data;
  }

  async getSiteMetrics(siteUrl: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `https://searchconsole.googleapis.com/v1/sites/${encodeURIComponent(siteUrl)}`,
    });
    return response.data;
  }

  // ============================================================
  // YouTube Data API v3
  // ============================================================
  async getChannelInfo(channelId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/channels',
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
      },
    });
    return response.data;
  }

  async getChannelVideos(
    channelId: string,
    maxResults: number = 50,
    order: 'date' | 'viewCount' | 'rating' = 'date'
  ): Promise<any> {
    // First get the upload playlist ID
    const channel = await this.getChannelInfo(channelId);
    const uploadPlaylistId =
      channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadPlaylistId) {
      throw new Error('No upload playlist found for this channel');
    }

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/playlistItems',
      params: {
        part: 'snippet,contentDetails',
        playlistId: uploadPlaylistId,
        maxResults,
      },
    });
    return response.data;
  }

  async getVideoDetails(videoId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/videos',
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
      },
    });
    return response.data;
  }

  // ============================================================
  // YouTube Analytics API
  // ============================================================
  async getYouTubeAnalytics(
    channelId: string,
    params: YouTubeAnalyticsParams
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: 'https://youtubeanalytics.googleapis.com/v2/reports',
      params: {
        ids: `channel==${channelId}`,
        startDate: params.startDate,
        endDate: params.endDate,
        metrics: params.metrics.join(','),
        dimensions: params.dimensions?.join(','),
        includeHistoricalChannelData: true,
      },
    });
    return response.data;
  }

  async getYouTubeChannelReport(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getYouTubeAnalytics(channelId, {
      channelId,
      startDate,
      endDate,
      metrics: [
        'views',
        'estimatedMinutesWatched',
        'averageViewDuration',
        'averageViewPercentage',
        'subscribersGained',
        'subscribersLost',
        'likes',
        'dislikes',
        'comments',
        'shares',
        'videosAddedToPlaylists',
        'videosRemovedFromPlaylists',
        'estimatedRevenue',
        'impressions',
        'impressionsCtr',
      ],
      dimensions: ['day'],
    });
  }

  async getYouTubeDemographics(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getYouTubeAnalytics(channelId, {
      channelId,
      startDate,
      endDate,
      metrics: [
        'views',
        'estimatedMinutesWatched',
        'averageViewDuration',
      ],
      dimensions: ['ageGroup', 'gender'],
    });
  }

  async getYouTubeTrafficSources(
    channelId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getYouTubeAnalytics(channelId, {
      channelId,
      startDate,
      endDate,
      metrics: ['views', 'estimatedMinutesWatched'],
      dimensions: ['insightTrafficSourceType'],
    });
  }

  // ============================================================
  // Cross-Platform Reporting
  // ============================================================
  async getCrossPlatformReport(
    analyticsPropertyId: string,
    googleAdsCustomerId: string,
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<{
    analytics: any;
    ads: any;
    searchConsole: any;
    socialTraffic: any;
  }> {
    const [analytics, ads, searchConsole, socialTraffic] = await Promise.all([
      this.getTrafficReport(analyticsPropertyId, startDate, endDate),
      this.getAdsReport(googleAdsCustomerId, {
        customerId: googleAdsCustomerId,
        startDate,
        endDate,
        metrics: [
          'metrics.impressions',
          'metrics.clicks',
          'metrics.ctr',
          'metrics.average_cpc',
          'metrics.cost_micros',
          'metrics.conversions',
          'metrics.conversions_value',
        ],
        segments: ['segments.date'],
      }).catch(() => null),
      this.getSearchAnalytics(siteUrl, {
        siteUrl,
        startDate,
        endDate,
        dimensions: ['date'],
      }).catch(() => null),
      this.getSocialTrafficReport(analyticsPropertyId, startDate, endDate),
    ]);

    return {
      analytics,
      ads,
      searchConsole,
      socialTraffic,
    };
  }
}
