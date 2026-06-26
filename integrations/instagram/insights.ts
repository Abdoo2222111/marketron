// ============================================================
// Instagram Insights / Analytics
// ============================================================
// Retrieves Instagram Business Account insights via the Graph API:
// account insights, media insights, audience demographics,
// and story analytics.
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';

export interface InstagramAccountInsights {
  impressions: number;
  reach: number;
  profileViews: number;
  followerCount: number;
  totalInteractions: number;
  websiteClicks?: number;
  emailContacts?: number;
  phoneCallClicks?: number;
  textMessageClicks?: number;
  directionsClicks?: number;
  profileVisits?: number;
}

export interface InstagramMediaInsights {
  id: string;
  mediaType: string;
  likeCount: number;
  commentsCount: number;
  savedCount: number;
  impressions: number;
  reach: number;
  engagement: number;
  videoViews?: number;
  shares?: number;
}

export interface InstagramStoryInsights {
  impressions: number;
  reach: number;
  tapsForward: number;
  tapsBack: number;
  replies: number;
  exits: number;
  shares: number;
  repliesRate?: number;
  completionRate?: number;
}

export interface InstagramAudienceDemographics {
  ageDistribution: Array<{ label: string; value: number }>;
  genderDistribution: Array<{ label: string; value: number }>;
  topCities: Array<{ name: string; value: number }>;
  topCountries: Array<{ name: string; value: number }>;
  followersCount: number;
}

export class InstagramInsightsManager {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string) {
    this.client = client;
    this.accessToken = accessToken;
  }

  /**
   * Get Instagram Business Account insights
   */
  async getAccountInsights(
    igUserId: string,
    period: 'day' | 'week' | 'days_28' | 'month' | 'lifetime' = 'day',
    since?: string,
    until?: string
  ): Promise<InstagramAccountInsights> {
    const params: any = {
      metric: ['impressions', 'reach', 'profile_views', 'follower_count'].join(','),
      period,
      access_token: this.accessToken,
    };
    if (since) params.since = since;
    if (until) params.until = until;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/insights`,
      params,
    });

    const data = response.data?.data || [];
    const result: InstagramAccountInsights = {
      impressions: 0,
      reach: 0,
      profileViews: 0,
      followerCount: 0,
      totalInteractions: 0,
    };

    data.forEach((metric: any) => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case 'impressions': result.impressions = value; break;
        case 'reach': result.reach = value; break;
        case 'profile_views': result.profileViews = value; break;
        case 'follower_count': result.followerCount = value; break;
      }
    });

    return result;
  }

  /**
   * Get online followers (active times by day/hour)
   */
  async getOnlineFollowers(igUserId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/insights`,
      params: {
        metric: 'online_followers',
        period: 'lifetime',
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Get media insights for a specific media item
   */
  async getMediaInsights(mediaId: string): Promise<InstagramMediaInsights> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/insights`,
      params: {
        metric: ['engagement', 'impressions', 'reach', 'saved', 'video_views'].join(','),
        access_token: this.accessToken,
      },
    });

    const data = response.data?.data || [];
    const result: InstagramMediaInsights = {
      id: mediaId,
      mediaType: '',
      likeCount: 0,
      commentsCount: 0,
      savedCount: 0,
      impressions: 0,
      reach: 0,
      engagement: 0,
    };

    data.forEach((metric: any) => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case 'impressions': result.impressions = value; break;
        case 'reach': result.reach = value; break;
        case 'engagement': result.engagement = value; break;
        case 'saved': result.savedCount = value; break;
        case 'video_views': result.videoViews = value; break;
      }
    });

    return result;
  }

  /**
   * Get recent media with insights
   */
  async getRecentMediaInsights(
    igUserId: string,
    limit: number = 25
  ): Promise<InstagramMediaInsights[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/media`,
      params: {
        fields: `id,media_type,caption,like_count,comments_count,media_url,permalink,timestamp,insights.metric(${['engagement', 'impressions', 'reach', 'saved', 'video_views'].join(',')})`,
        limit,
        access_token: this.accessToken,
      },
    });

    const mediaList = response.data?.data || [];
    return mediaList.map((media: any) => ({
      id: media.id,
      mediaType: media.media_type || '',
      likeCount: media.like_count || 0,
      commentsCount: media.comments_count || 0,
      savedCount: media.insights?.data?.find((m: any) => m.name === 'saved')?.values?.[0]?.value || 0,
      impressions: media.insights?.data?.find((m: any) => m.name === 'impressions')?.values?.[0]?.value || 0,
      reach: media.insights?.data?.find((m: any) => m.name === 'reach')?.values?.[0]?.value || 0,
      engagement: media.insights?.data?.find((m: any) => m.name === 'engagement')?.values?.[0]?.value || 0,
      videoViews: media.insights?.data?.find((m: any) => m.name === 'video_views')?.values?.[0]?.value || 0,
      shares: media.insights?.data?.find((m: any) => m.name === 'shares')?.values?.[0]?.value || 0,
    }));
  }

  /**
   * Get story insights
   */
  async getStoryInsights(storyId: string): Promise<InstagramStoryInsights> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${storyId}/insights`,
      params: {
        metric: ['impressions', 'reach', 'taps_forward', 'taps_back', 'replies', 'exits', 'shares'].join(','),
        access_token: this.accessToken,
      },
    });

    const data = response.data?.data || [];
    const result: InstagramStoryInsights = {
      impressions: 0,
      reach: 0,
      tapsForward: 0,
      tapsBack: 0,
      replies: 0,
      exits: 0,
      shares: 0,
    };

    data.forEach((metric: any) => {
      const value = metric.values?.[0]?.value || 0;
      switch (metric.name) {
        case 'impressions': result.impressions = value; break;
        case 'reach': result.reach = value; break;
        case 'taps_forward': result.tapsForward = value; break;
        case 'taps_back': result.tapsBack = value; break;
        case 'replies': result.replies = value; break;
        case 'exits': result.exits = value; break;
        case 'shares': result.shares = value; break;
      }
    });

    return result;
  }

  /**
   * Get audience demographics
   */
  async getAudienceDemographics(igUserId: string): Promise<InstagramAudienceDemographics> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/insights`,
      params: {
        metric: 'audience_city,audience_country,audience_gender_age,audience_locale',
        period: 'lifetime',
        access_token: this.accessToken,
      },
    });

    const data = response.data?.data || [];
    const result: InstagramAudienceDemographics = {
      ageDistribution: [],
      genderDistribution: [],
      topCities: [],
      topCountries: [],
      followersCount: 0,
    };

    data.forEach((metric: any) => {
      if (metric.name === 'audience_gender_age') {
        const breakdowns = metric.total_value?.breakdowns || [];
        breakdowns.forEach((b: any) => {
          const parts = b.dimension_values?.[0]?.split('.').pop() || '';
          const ageMatch = parts.match(/(\d+-\d+)/);
          const gender = parts.startsWith('M') ? 'ذكر' : parts.startsWith('F') ? 'أنثى' : 'غير محدد';
          const ageGroup = ageMatch?.[0] || 'غير محدد';
          const value = b.result?.[0]?.value || 0;

          result.genderDistribution.push({ label: gender, value });
          result.ageDistribution.push({ label: ageGroup, value });
        });
      }

      if (metric.name === 'audience_city') {
        result.topCities = (metric.total_value?.breakdowns || []).map((b: any) => ({
          name: b.dimension_values?.[0] || 'غير معروف',
          value: b.result?.[0]?.value || 0,
        }));
      }

      if (metric.name === 'audience_country') {
        result.topCountries = (metric.total_value?.breakdowns || []).map((b: any) => ({
          name: b.dimension_values?.[0] || 'غير معروف',
          value: b.result?.[0]?.value || 0,
        }));
      }
    });

    return result;
  }

  /**
   * Get hashtag insights (if available)
   */
  async getHashtagInsights(hashtagName: string): Promise<any> {
    try {
      const response = await makeApiCall(this.client, {
        method: 'GET',
        url: `/ig_hashtag_search`,
        params: {
          user_id: this.client.defaults.headers?.IG_USER_ID,
          q: hashtagName,
          access_token: this.accessToken,
        },
      });

      const hashtagId = response.data?.data?.[0]?.id;
      if (!hashtagId) return null;

      const insights = await makeApiCall(this.client, {
        method: 'GET',
        url: `/${hashtagId}/insights`,
        params: {
          metric: 'impressions,reach,profile_visits',
          period: 'day',
          access_token: this.accessToken,
        },
      });

      return insights.data;
    } catch {
      return null;
    }
  }
}
