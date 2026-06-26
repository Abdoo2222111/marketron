// ============================================================
// Instagram Service - Instagram-Specific Features
// ============================================================
// Focuses on Instagram-specific API features via the Graph API:
// - Stories publishing and management
// - Reels (video sharing) 
// - IGTV / Long-form video
// - Shopping tags and product tagging
// - Mentions and user tagging
// - Hashtag analytics
// - Account insights & audience demographics
// - Comments management
// - Messaging insights
// ============================================================

import { AxiosInstance } from 'axios';
import { FACEBOOK_CONFIG } from '../config';
import { createApiClient, makeApiCall } from '../utils/apiClient';
import { tokenManager } from '../utils/tokenManager';
import { refreshFacebookToken } from '../facebook/auth';

// ============================================================
// Types
// ============================================================
export interface InstagramStoryData {
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  caption?: string;
  stickerData?: any;
  locationId?: string;
  musicSticker?: {
    musicId: string;
    startTimeSeconds?: number;
  };
  pollSticker?: {
    question: string;
    options: string[];
  };
  quizSticker?: {
    question: string;
    options: string[];
    correctAnswer: number;
  };
  countdownSticker?: {
    title: string;
    endTime: string;
  };
}

export interface InstagramReelData {
  videoUrl: string;
  caption: string;
  thumbOffset?: number;
  coverUrl?: string;
  audioName?: string;
  locationId?: string;
  collaborators?: string[];
  taggedUserIds?: string[];
}

export interface InstagramComment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  likeCount: number;
  replyCount: number;
  replies?: InstagramComment[];
}

export interface InstagramAudienceInsights {
  ageDistribution: Array<{ label: string; value: number }>;
  genderDistribution: Array<{ label: string; value: number }>;
  topCountries: Array<{ name: string; value: number }>;
  topCities: Array<{ name: string; value: number }>;
  followersGrowth: Array<{ date: string; value: number }>;
  activeTimes: Array<{ day: string; hour: number; value: number }>;
}

// ============================================================
// Instagram Service Class
// ============================================================
export class InstagramService {
  private igUserId: string;
  private client: AxiosInstance;
  private accessToken: string;
  private platform: 'instagram';

  constructor(accessToken: string, igUserId: string) {
    this.accessToken = accessToken;
    this.igUserId = igUserId;
    this.client = createApiClient({
      baseUrl: FACEBOOK_CONFIG.graphUrl,
      platform: 'instagram',
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
  // Stories
  // ============================================================
  async createStory(data: InstagramStoryData): Promise<any> {
    const params: any = {
      media_type: data.mediaType,
      access_token: this.accessToken,
    };

    if (data.mediaType === 'IMAGE') {
      params.image_url = data.mediaUrl;
    } else {
      params.video_url = data.mediaUrl;
    }

    if (data.caption) params.caption = data.caption;
    if (data.locationId) params.location_id = data.locationId;

    // Add stickers if provided
    if (data.stickerData) {
      params.story_sticker_data = JSON.stringify(data.stickerData);
    }

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media_stories`,
      params,
    });

    return response.data;
  }

  async createStoryWithMusic(
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO',
    musicId: string,
    startTimeSeconds?: number
  ): Promise<any> {
    return this.createStory({
      mediaType,
      mediaUrl,
      musicSticker: { musicId, startTimeSeconds },
    });
  }

  async createStoryPoll(
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO',
    question: string,
    options: string[]
  ): Promise<any> {
    return this.createStory({
      mediaType,
      mediaUrl,
      pollSticker: { question, options },
    });
  }

  async getStories(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/stories`,
      params: {
        fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp,username,caption',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getStoryInsights(storyId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${storyId}/insights`,
      params: {
        metric: 'impressions,reach,navigation,exits,replies,reactions,taps_forward,taps_back,story_views',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Reels
  // ============================================================
  async createReel(data: InstagramReelData): Promise<any> {
    const params: any = {
      media_type: 'REELS',
      video_url: data.videoUrl,
      caption: data.caption,
      access_token: this.accessToken,
    };

    if (data.thumbOffset) params.thumb_offset = data.thumbOffset;
    if (data.coverUrl) params.cover_url = data.coverUrl;
    if (data.audioName) params.audio_name = data.audioName;
    if (data.locationId) params.location_id = data.locationId;
    if (data.collaborators) params.collaborators = JSON.stringify(data.collaborators);
    if (data.taggedUserIds) params.tag_users = JSON.stringify(data.taggedUserIds);

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media`,
      params,
    });

    const creationId = response.data.id;

    // Publish the reel
    const publishResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return { creationId, ...publishResponse.data };
  }

  async getReels(limit: number = 50): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/media`,
      params: {
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count,play_count,video_title',
        limit,
        media_type: 'REELS',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getReelInsights(reelId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${reelId}/insights`,
      params: {
        metric: 'impressions,reach,plays,saved,shares,likes,comments,audio_retention,video_views',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Media (Posts, Carousels, IGTV)
  // ============================================================
  async createMediaPost(data: {
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    mediaUrl?: string;
    childrenUrls?: string[];
    caption: string;
    locationId?: string;
    collaboratorIds?: string[];
    taggedUserIds?: string[];
    productTags?: Array<{ productId: string; x: number; y: number }>;
  }): Promise<any> {
    const params: any = {
      caption: data.caption,
      access_token: this.accessToken,
    };

    if (data.mediaType === 'CAROUSEL' && data.childrenUrls) {
      // Create each child media first
      const childIds: string[] = [];
      for (const childUrl of data.childrenUrls) {
        const childParams: any = {
          media_type: childUrl.match(/\.(mp4|mov)$/i) ? 'VIDEO' : 'IMAGE',
          access_token: this.accessToken,
          is_carousel_item: true,
        };
        if (childUrl.match(/\.(mp4|mov)$/i)) {
          childParams.video_url = childUrl;
        } else {
          childParams.image_url = childUrl;
        }

        const childResponse = await makeApiCall(this.client, {
          method: 'POST',
          url: `/${this.igUserId}/media`,
          params: childParams,
        });
        childIds.push(childResponse.data.id);
      }

      params.media_type = 'CAROUSEL';
      params.children = JSON.stringify(childIds);
    } else {
      params.media_type = data.mediaType;
      if (data.mediaUrl) {
        if (data.mediaType === 'IMAGE') {
          params.image_url = data.mediaUrl;
        } else {
          params.video_url = data.mediaUrl;
        }
      }
    }

    if (data.locationId) params.location_id = data.locationId;
    if (data.collaboratorIds) params.collaborator_ids = JSON.stringify(data.collaboratorIds);
    if (data.taggedUserIds) params.user_tags = JSON.stringify(data.taggedUserIds);
    if (data.productTags) {
      params.product_tags = JSON.stringify(
        data.productTags.map((t) => ({
          product_id: t.productId,
          x: t.x,
          y: t.y,
        }))
      );
    }

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media`,
      params,
    });

    const creationId = response.data.id;

    // Publish
    const publishResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return { creationId, ...publishResponse.data };
  }

  async getMedia(mediaId?: string, limit: number = 50): Promise<any> {
    const url = mediaId ? `/${mediaId}` : `/${this.igUserId}/media`;
    const params: any = { access_token: this.accessToken };

    if (!mediaId) {
      params.fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count,children{media_url,media_type}';
      params.limit = limit;
    }

    const response = await makeApiCall(this.client, { method: 'GET', url, params });
    return response.data;
  }

  async getMediaInsights(mediaId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/insights`,
      params: {
        metric: 'impressions,reach,saved,shares,likes,comments,video_views,profile_visits,follows',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Comments
  // ============================================================
  async getComments(mediaId: string, limit: number = 50): Promise<InstagramComment[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${mediaId}/comments`,
      params: {
        fields: 'id,text,username,timestamp,like_count,replies_count',
        limit,
        access_token: this.accessToken,
      },
    });

    return (response.data?.data || []).map((c: any) => ({
      id: c.id,
      text: c.text,
      username: c.username,
      timestamp: c.timestamp,
      likeCount: c.like_count || 0,
      replyCount: c.replies_count || 0,
    }));
  }

  async replyToComment(commentId: string, message: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${commentId}/replies`,
      params: {
        message,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'DELETE',
      url: `/${commentId}`,
      params: { access_token: this.accessToken },
    });
    return response.data;
  }

  async hideComment(commentId: string, hide: boolean = true): Promise<any> {
    const action = hide ? 'block' : 'unblock';
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${commentId}/${action}`,
      params: { access_token: this.accessToken },
    });
    return response.data;
  }

  async getCommentReplies(commentId: string, limit: number = 25): Promise<InstagramComment[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${commentId}/replies`,
      params: {
        fields: 'id,text,username,timestamp,like_count',
        limit,
        access_token: this.accessToken,
      },
    });
    return (response.data?.data || []).map((c: any) => ({
      id: c.id,
      text: c.text,
      username: c.username,
      timestamp: c.timestamp,
      likeCount: c.like_count || 0,
      replyCount: 0,
    }));
  }

  // ============================================================
  // Shopping & Product Tagging
  // ============================================================
  async tagProductOnMedia(
    mediaId: string,
    productTags: Array<{ productId: string; x: number; y: number }>
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${mediaId}/product_tags`,
      params: {
        updated_tags: JSON.stringify(
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

  async getShoppingCatalogs(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/shopping_catalogs`,
      params: {
        fields: 'id,name,product_count,store_name',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getProductsFromCatalog(catalogId: string, limit: number = 50): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${catalogId}/products`,
      params: {
        fields: 'id,name,description,price,image_url,url,retailer_id',
        limit,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Hashtag Analytics
  // ============================================================
  async searchHashtag(hashtagName: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/hashtags`,
      params: {
        q: hashtagName,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getHashtagInsights(
    hashtagId: string,
    metrics: string[] = ['impressions', 'reach', 'engagement'],
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

  async getHashtagMedia(
    hashtagId: string,
    limit: number = 50
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${hashtagId}/top_media`,
      params: {
        fields: 'id,caption,media_type,media_url,permalink,like_count,comments_count',
        limit,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getHashtagRecentlySearched(limit: number = 25): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/recently_searched_hashtags`,
      params: {
        limit,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Account Insights / Audience
  // ============================================================
  async getAccountInsights(
    metrics: string[] = [
      'impressions', 'reach', 'follower_count', 'profile_views',
      'total_interactions', 'likes', 'comments', 'shares', 'saved',
    ],
    period: 'day' | 'week' | 'days_28' | 'lifetime' = 'day',
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
      url: `/${this.igUserId}/insights`,
      params,
    });
    return response.data;
  }

  async getAudienceInsights(): Promise<InstagramAudienceInsights> {
    // Get audience demographics
    const [ageResponse, genderResponse, countryResponse, cityResponse] =
      await Promise.all([
        makeApiCall(this.client, {
          method: 'GET',
          url: `/${this.igUserId}/insights`,
          params: {
            metric: 'audience_city,audience_country,audience_gender_age',
            period: 'lifetime',
            breakdown: 'age',
            access_token: this.accessToken,
          },
        }),
        makeApiCall(this.client, {
          method: 'GET',
          url: `/${this.igUserId}/insights`,
          params: {
            metric: 'audience_city,audience_country,audience_gender_age',
            period: 'lifetime',
            breakdown: 'gender',
            access_token: this.accessToken,
          },
        }),
        makeApiCall(this.client, {
          method: 'GET',
          url: `/${this.igUserId}/insights`,
          params: {
            metric: 'audience_city,audience_country,audience_gender_age',
            period: 'lifetime',
            breakdown: 'country',
            access_token: this.accessToken,
          },
        }),
        makeApiCall(this.client, {
          method: 'GET',
          url: `/${this.igUserId}/insights`,
          params: {
            metric: 'audience_city,audience_country,audience_gender_age',
            period: 'lifetime',
            breakdown: 'city',
            access_token: this.accessToken,
          },
        }),
      ]);

    // Parse and normalize audience data
    const parseBreakdown = (response: any, labelKey: string, valueKey: string) => {
      const data = response.data?.data || [];
      return data.map((item: any) => ({
        label: item[labelKey] || item.name,
        value: parseInt(item[valueKey] || item.value || '0', 10),
      }));
    };

    return {
      ageDistribution: parseBreakdown(ageResponse, 'label', 'value'),
      genderDistribution: parseBreakdown(genderResponse, 'label', 'value'),
      topCountries: parseBreakdown(countryResponse, 'name', 'value'),
      topCities: parseBreakdown(cityResponse, 'name', 'value'),
      followersGrowth: [],
      activeTimes: [],
    };
  }

  async getFollowersGrowth(startDate?: string, endDate?: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/insights`,
      params: {
        metric: 'follower_count',
        period: 'day',
        since: startDate,
        until: endDate,
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  async getOnlineFollowers(): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${this.igUserId}/insights`,
      params: {
        metric: 'online_followers',
        period: 'lifetime',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // Mentions & Tags
  // ============================================================
  async getMentions(mediaId?: string): Promise<any> {
    const url = mediaId ? `/${mediaId}` : `/${this.igUserId}/media`;
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url,
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,username,comments_count,like_count',
        access_token: this.accessToken,
      },
    });

    // Filter posts that mention the account
    const username = ''; // Would need to get actual username
    const posts = response.data?.data || [];
    return posts.filter((p: any) =>
      p.caption && p.caption.includes(`@${username}`)
    );
  }

  async tagUserOnMedia(
    mediaId: string,
    userIds: string[]
  ): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${mediaId}/tags`,
      params: {
        taggings: JSON.stringify(
          userIds.map((id) => ({ user_id: id }))
        ),
        access_token: this.accessToken,
      },
    });
    return response.data;
  }

  // ============================================================
  // IGTV / Long-Form Video
  // ============================================================
  async createIGTVVideo(data: {
    videoUrl: string;
    title: string;
    caption: string;
    coverUrl?: string;
    description?: string;
  }): Promise<any> {
    const params: any = {
      media_type: 'VIDEO',
      video_url: data.videoUrl,
      caption: data.caption,
      access_token: this.accessToken,
      igtv_title: data.title,
    };
    if (data.coverUrl) params.cover_url = data.coverUrl;
    if (data.description) params.description = data.description;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media`,
      params,
    });

    const creationId = response.data.id;

    const publishResponse = await makeApiCall(this.client, {
      method: 'POST',
      url: `/${this.igUserId}/media_publish`,
      params: {
        creation_id: creationId,
        access_token: this.accessToken,
      },
    });

    return { creationId, ...publishResponse.data };
  }

  // ============================================================
  // Container Status Check
  // ============================================================
  async getMediaStatus(creationId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: `/${creationId}`,
      params: {
        fields: 'id,status_code,status',
        access_token: this.accessToken,
      },
    });
    return response.data;
  }
}
