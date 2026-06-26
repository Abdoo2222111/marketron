// ============================================================
// Instagram Content Management
// ============================================================
// Manages Instagram content (photos, videos, carousels, reels)
// via the Graph API for Instagram Business Accounts.
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';

export interface InstagramMediaItem {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL';
  mediaUrl: string;
  permalink: string;
  caption?: string;
  thumbnailUrl?: string;
  timestamp: string;
  username: string;
  likeCount: number;
  commentsCount: number;
  savedCount?: number;
  videoViews?: number;
  children?: InstagramMediaItem[];
  isCommentEnabled: boolean;
}

export class InstagramContentManager {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string) {
    this.client = client;
    this.accessToken = accessToken;
  }

  // ============================================================
  // Media Retrieval
  // ============================================================

  /**
   * Get media for an Instagram Business Account
   */
  async getMedia(
    igUserId: string,
    limit: number = 25,
    before?: string,
    after?: string
  ): Promise<{ data: InstagramMediaItem[]; paging: any }> {
    const params: any = {
      fields: 'id,media_type,media_url,permalink,caption,thumbnail_url,timestamp,username,like_count,comments_count,is_comment_enabled',
      limit,
      access_token: this.accessToken,
    };
    if (before) params.before = before;
    if (after) params.after = after;

    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${igUserId}/media`,
      params,
    });

    const items = (response.data?.data || []).map((item: any) => ({
      id: item.id,
      mediaType: item.media_type || 'IMAGE',
      mediaUrl: item.media_url || '',
      permalink: item.permalink || '',
      caption: item.caption || '',
      thumbnailUrl: item.thumbnail_url || item.media_url || '',
      timestamp: item.timestamp || '',
      username: item.username || '',
      likeCount: item.like_count || 0,
      commentsCount: item.comments_count || 0,
      isCommentEnabled: item.is_comment_enabled !== false,
    }));

    return {
      data: items,
      paging: response.data?.paging || {},
    };
  }

  /**
   * Get a single media item by ID
   */
  async getMediaItem(mediaId: string): Promise<InstagramMediaItem> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}`,
      params: {
        fields: 'id,media_type,media_url,permalink,caption,thumbnail_url,timestamp,username,like_count,comments_count,is_comment_enabled',
        access_token: this.accessToken,
      },
    });

    const item = response.data;
    return {
      id: item.id,
      mediaType: item.media_type || 'IMAGE',
      mediaUrl: item.media_url || '',
      permalink: item.permalink || '',
      caption: item.caption || '',
      thumbnailUrl: item.thumbnail_url || item.media_url || '',
      timestamp: item.timestamp || '',
      username: item.username || '',
      likeCount: item.like_count || 0,
      commentsCount: item.comments_count || 0,
      isCommentEnabled: item.is_comment_enabled !== false,
    };
  }

  /**
   * Get children of a carousel album
   */
  async getCarouselChildren(mediaId: string): Promise<InstagramMediaItem[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/children`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp',
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((child: any) => ({
      id: child.id,
      mediaType: child.media_type || 'IMAGE',
      mediaUrl: child.media_url || '',
      permalink: child.permalink || '',
      thumbnailUrl: child.thumbnail_url || child.media_url || '',
      timestamp: child.timestamp || '',
      username: '',
      likeCount: 0,
      commentsCount: 0,
      isCommentEnabled: true,
    }));
  }

  // ============================================================
  // Content Publishing
  // ============================================================

  /**
   * Create a media container (step 1 of IG publishing)
   */
  async createMediaContainer(
    igUserId: string,
    data: {
      mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL';
      mediaUrl?: string;
      caption?: string;
      locationId?: string;
      shareToFeed?: boolean;
      thumbOffset?: number;
      coverUrl?: string;
      productTags?: Array<{ productId: string; merchantId: string }>;
      children?: string[];
    }
  ): Promise<string> {
    const params: any = {
      media_type: data.mediaType,
      access_token: this.accessToken,
    };

    if (data.mediaUrl) {
      if (data.mediaType === 'VIDEO' || data.mediaType === 'REEL') {
        if (data.mediaType === 'REEL') {
          params.video_url = data.mediaUrl;
          params.media_type = 'REELS';
        } else {
          params.video_url = data.mediaUrl;
        }
      } else {
        params.image_url = data.mediaUrl;
      }
    }

    if (data.caption) params.caption = data.caption;
    if (data.locationId) params.location_id = data.locationId;
    if (data.shareToFeed === false) params.share_to_feed = false;
    if (data.thumbOffset !== undefined) params.thumb_offset = data.thumbOffset;
    if (data.coverUrl) params.cover_url = data.coverUrl;
    if (data.children?.length) params.children = data.children;

    // Product tags
    if (data.productTags?.length) {
      params.product_tags = data.productTags.map((t) => ({
        product_id: t.productId,
        merchant_id: t.merchantId,
      }));
    }

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${igUserId}/media`,
      params,
    });

    return response.data?.id || '';
  }

  /**
   * Publish a media container (step 2 of IG publishing)
   */
  async publishMedia(igUserId: string, creationId: string): Promise<string> {
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
   * Convenience method: publish an image in 2 steps
   */
  async publishImage(
    igUserId: string,
    imageUrl: string,
    caption?: string
  ): Promise<string> {
    const containerId = await this.createMediaContainer(igUserId, {
      mediaType: 'IMAGE',
      mediaUrl: imageUrl,
      caption,
    });

    return this.publishMedia(igUserId, containerId);
  }

  /**
   * Convenience method: publish a video in 2 steps
   */
  async publishVideo(
    igUserId: string,
    videoUrl: string,
    caption?: string,
    thumbOffset?: number
  ): Promise<string> {
    const containerId = await this.createMediaContainer(igUserId, {
      mediaType: 'VIDEO',
      mediaUrl: videoUrl,
      caption,
      thumbOffset,
    });

    return this.publishMedia(igUserId, containerId);
  }

  /**
   * Convenience method: publish a carousel
   */
  async publishCarousel(
    igUserId: string,
    childIds: string[],
    caption?: string
  ): Promise<string> {
    const containerId = await this.createMediaContainer(igUserId, {
      mediaType: 'CAROUSEL',
      children: childIds,
      caption,
    });

    return this.publishMedia(igUserId, containerId);
  }

  /**
   * Publish a Reel
   */
  async publishReel(
    igUserId: string,
    videoUrl: string,
    caption?: string,
    coverUrl?: string,
    thumbOffset?: number
  ): Promise<string> {
    const containerId = await this.createMediaContainer(igUserId, {
      mediaType: 'REEL',
      mediaUrl: videoUrl,
      caption,
      coverUrl,
      thumbOffset,
      shareToFeed: false,
    });

    return this.publishMedia(igUserId, containerId);
  }

  // ============================================================
  // Comment Moderation
  // ============================================================

  /**
   * Get comments for a media item
   */
  async getComments(
    mediaId: string,
    limit: number = 50
  ): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/comments`,
      params: {
        fields: 'id,text,timestamp,username,like_count,replies{id,text,timestamp,username}',
        limit,
        access_token: this.accessToken,
      },
    });
    return response.data?.data || [];
  }

  /**
   * Create a reply to a comment
   */
  async replyToComment(
    commentId: string,
    text: string
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${commentId}/replies`,
      params: {
        message: text,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${commentId}`,
      params: { access_token: this.accessToken },
    });
    return response.data;
  }

  /**
   * Enable/disable comments on a media item
   */
  async toggleComments(mediaId: string, enabled: boolean): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${mediaId}`,
      params: {
        comment_enabled: enabled,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get hashtag ID from name
   */
  async getHashtagId(
    igUserId: string,
    hashtagName: string
  ): Promise<string | null> {
    try {
      const response = await makeApiCall(this.client, {
        method: 'GET',
        url: '/ig_hashtag_search',
        params: {
          user_id: igUserId,
          q: hashtagName,
          access_token: this.accessToken,
        },
      });
      return response.data?.data?.[0]?.id || null;
    } catch {
      return null;
    }
  }
}
