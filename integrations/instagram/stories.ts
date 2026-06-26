// ============================================================
// Instagram Stories Management
// ============================================================
// Manages Instagram Stories via the Graph API for Business Accounts.
// Covers story retrieval, publishing, analytics, and highlights.
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';

export interface InstagramStory {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  permalink: string;
  thumbnailUrl?: string;
  timestamp: string;
  username: string;
  likeCount: number;
  repliesCount: number;
  isHighlight: boolean;
}

export interface StoryInsights {
  impressions: number;
  reach: number;
  tapsForward: number;
  tapsBack: number;
  replies: number;
  exits: number;
  shares: number;
  completionRate?: number;
}

export class InstagramStoriesManager {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string) {
    this.client = client;
    this.accessToken = accessToken;
  }

  // ============================================================
  // Story Retrieval
  // ============================================================

  /**
   * Get active stories for an Instagram Business Account
   */
  async getStories(igUserId: string): Promise<InstagramStory[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/stories`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count',
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((story: any) => ({
      id: story.id,
      mediaType: story.media_type || 'IMAGE',
      mediaUrl: story.media_url || '',
      permalink: story.permalink || '',
      thumbnailUrl: story.thumbnail_url || story.media_url || '',
      timestamp: story.timestamp || '',
      username: story.username || '',
      likeCount: story.like_count || 0,
      repliesCount: story.comments_count || 0,
      isHighlight: false,
    }));
  }

  /**
   * Get story by ID
   */
  async getStory(storyId: string): Promise<InstagramStory> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${storyId}`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count',
        access_token: this.accessToken,
      },
    });

    const story = response.data;
    return {
      id: story.id,
      mediaType: story.media_type || 'IMAGE',
      mediaUrl: story.media_url || '',
      permalink: story.permalink || '',
      thumbnailUrl: story.thumbnail_url || story.media_url || '',
      timestamp: story.timestamp || '',
      username: story.username || '',
      likeCount: story.like_count || 0,
      repliesCount: story.comments_count || 0,
      isHighlight: false,
    };
  }

  // ============================================================
  // Story Publishing
  // ============================================================

  /**
   * Create a story media container (step 1)
   */
  async createStoryContainer(
    igUserId: string,
    data: {
      mediaType: 'IMAGE' | 'VIDEO';
      mediaUrl: string;
      caption?: string;
      locationId?: string;
      stickerData?: string;
      allowMessaging?: boolean;
      replyType?: 'PRIVACY_AND_OFF' | 'PUBLIC' | 'OFF';
    }
  ): Promise<string> {
    const params: any = {
      media_type: data.mediaType,
      access_token: this.accessToken,
    };

    if (data.mediaType === 'VIDEO') {
      params.video_url = data.mediaUrl;
    } else {
      params.image_url = data.mediaUrl;
    }

    if (data.caption) params.caption = data.caption;
    if (data.locationId) params.location_id = data.locationId;
    if (data.stickerData) params.sticker_data = data.stickerData;
    if (data.allowMessaging === false) params.allow_messaging = false;
    if (data.replyType) params.reply_type = data.replyType;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media`,
      params,
    });

    return response.data?.id || '';
  }

  /**
   * Publish a story container (step 2)
   */
  async publishStory(igUserId: string, creationId: string): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return response.data?.id || '';
  }

  /**
   * Convenience: publish a photo story
   */
  async publishPhotoStory(
    igUserId: string,
    imageUrl: string,
    caption?: string
  ): Promise<string> {
    const containerId = await this.createStoryContainer(igUserId, {
      mediaType: 'IMAGE',
      mediaUrl: imageUrl,
      caption,
    });

    return this.publishStory(igUserId, containerId);
  }

  /**
   * Convenience: publish a video story
   */
  async publishVideoStory(
    igUserId: string,
    videoUrl: string,
    caption?: string
  ): Promise<string> {
    const containerId = await this.createStoryContainer(igUserId, {
      mediaType: 'VIDEO',
      mediaUrl: videoUrl,
      caption,
    });

    return this.publishStory(igUserId, containerId);
  }

  // ============================================================
  // Story Insights
  // ============================================================

  /**
   * Get story insights
   */
  async getStoryInsights(storyId: string): Promise<StoryInsights> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${storyId}/insights`,
      params: {
        metric: ['impressions', 'reach', 'taps_forward', 'taps_back', 'replies', 'exits', 'shares'].join(','),
        access_token: this.accessToken,
      },
    });

    const data = response.data?.data || [];
    const result: StoryInsights = {
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

  // ============================================================
  // Highlights
  // ============================================================

  /**
   * Get story highlights for a user
   */
  async getHighlights(igUserId: string): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/highlights`,
      params: {
        fields: 'id,title,cover_media_url,media_count,created_at',
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Get stories in a highlight reel
   */
  async getHighlightStories(highlightId: string): Promise<InstagramStory[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${highlightId}/media`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp',
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((story: any) => ({
      id: story.id,
      mediaType: story.media_type || 'IMAGE',
      mediaUrl: story.media_url || '',
      permalink: story.permalink || '',
      thumbnailUrl: story.thumbnail_url || story.media_url || '',
      timestamp: story.timestamp || '',
      username: '',
      likeCount: 0,
      repliesCount: 0,
      isHighlight: true,
    }));
  }

  // ============================================================
  // Story Replies
  // ============================================================

  /**
   * Get replies to a story
   */
  async getStoryReplies(storyId: string): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${storyId}/comments`,
      params: {
        fields: 'id,text,timestamp,username,like_count',
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Reply to a story mention
   */
  async replyToStory(storyId: string, text: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${storyId}/comments`,
      params: {
        message: text,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }
}
