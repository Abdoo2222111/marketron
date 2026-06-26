// ============================================================
// Facebook Pages Management
// ============================================================
// Manages Facebook pages via the Graph API:
// - List and manage pages
// - Page insights and analytics
// - Post scheduling and publishing
// - Photo and video publishing
// - Page settings
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';
import { PlatformPage } from '../common/types';

export class FacebookPagesManager {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string) {
    this.client = client;
    this.accessToken = accessToken;
  }

  /**
   * Get all pages managed by this user
   */
  async getPages(): Promise<PlatformPage[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/me/accounts',
      params: {
        fields: 'id,name,category,fan_count,picture,access_token,website,verification_status,about,description,emails,phone,link',
        limit: 100,
      },
    });

    return (response.data?.data || []).map((page: any) => ({
      id: page.id,
      platform: 'facebook' as const,
      name: page.name,
      category: page.category || '',
      followers: page.fan_count || 0,
      profilePicture: page.picture?.data?.url || '',
      accessToken: page.access_token,
      url: page.link || `https://facebook.com/${page.id}`,
      verified: page.verification_status === 'verified',
    }));
  }

  /**
   * Get a specific page by ID
   */
  async getPage(pageId: string): Promise<PlatformPage> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${pageId}`,
      params: {
        fields: 'id,name,category,fan_count,picture,access_token,website,verification_status,about,description,emails,phone,link,rating_count,rating',
        access_token: this.accessToken,
      },
    });

    const page = response.data;
    return {
      id: page.id,
      platform: 'facebook',
      name: page.name,
      category: page.category || '',
      followers: page.fan_count || 0,
      profilePicture: page.picture?.data?.url || '',
      accessToken: page.access_token,
      url: page.link || `https://facebook.com/${page.id}`,
      verified: page.verification_status === 'verified',
    };
  }

  /**
   * Create a post on a Facebook page
   */
  async createPost(
    pageId: string,
    data: {
      message: string;
      link?: string;
      published?: boolean;
      scheduledPublishTime?: string;
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

  /**
   * Upload a photo to a Facebook page
   */
  async uploadPhoto(
    pageId: string,
    data: { url: string; caption?: string; published?: boolean }
  ): Promise<any> {
    const params: any = {
      url: data.url,
      access_token: this.accessToken,
    };
    if (data.caption) params.caption = data.caption;
    if (data.published === false) params.published = false;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}/photos`,
      params,
    });
    return response.data;
  }

  /**
   * Upload a video to a Facebook page
   */
  async uploadVideo(
    pageId: string,
    data: { videoUrl: string; title: string; description?: string; published?: boolean }
  ): Promise<any> {
    const params: any = {
      file_url: data.videoUrl,
      title: data.title,
      access_token: this.accessToken,
    };
    if (data.description) params.description = data.description;
    if (data.published === false) params.published = false;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}/videos`,
      params,
    });
    return response.data;
  }

  /**
   * Get page insights
   */
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
      access_token: this.accessToken,
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

  /**
   * Get page feed / recent posts
   */
  async getFeed(pageId: string, limit: number = 25): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${pageId}/feed`,
      params: {
        fields: 'id,message,story,created_time,permalink_url,full_picture,likes.limit(1).summary(true),comments.limit(1).summary(true),shares,type,status_type',
        limit,
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Get page conversations / messages
   */
  async getConversations(pageId: string): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${pageId}/conversations`,
      params: {
        fields: 'id,message_count,unread_count,senders,updated_time,is_subscribed',
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Update page settings
   */
  async updateSettings(
    pageId: string,
    settings: Record<string, any>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${pageId}`,
      params: {
        ...settings,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }
}
