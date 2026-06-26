// ============================================================
// TikTok Creative Management
// ============================================================
// Manages TikTok ad creatives: images, videos, text overlays,
// call-to-action buttons, Spark Ads, and lead generation forms.
// ============================================================

import { AxiosInstance } from 'axios';
import { makeApiCall } from '../utils/apiClient';
import { Creative } from '../common/types';

export class TikTokCreativesManager {
  private client: AxiosInstance;
  private advertiserId: string;
  private accessToken: string;

  constructor(client: AxiosInstance, accessToken: string, advertiserId: string) {
    this.client = client;
    this.accessToken = accessToken;
    this.advertiserId = advertiserId;
  }

  // ============================================================
  // Image Management
  // ============================================================

  /**
   * Upload an image by URL
   */
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

  /**
   * Upload images in batch
   */
  async uploadImages(images: Array<{ url: string; name: string }>): Promise<string[]> {
    const uploads = images.map((img) => this.uploadImage(img.url, img.name));
    return Promise.all(uploads);
  }

  /**
   * Get uploaded images
   */
  async getImages(page: number = 1, pageSize: number = 20): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/file/image/get/',
      params: {
        advertiser_id: this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data?.data?.list || [];
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/image/delete/',
      data: {
        advertiser_id: this.advertiserId,
        image_ids: [imageId],
      },
    });
    return response.data;
  }

  // ============================================================
  // Video Management
  // ============================================================

  /**
   * Upload a video by URL
   */
  async uploadVideo(videoUrl: string, fileName: string): Promise<string> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/video/upload/',
      data: {
        advertiser_id: this.advertiserId,
        upload_type: 'UPLOAD_BY_URL',
        video_url: videoUrl,
        file_name: fileName,
      },
    });
    return response.data?.data?.video_id || '';
  }

  /**
   * Get uploaded videos
   */
  async getVideos(page: number = 1, pageSize: number = 20): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/file/video/get/',
      params: {
        advertiser_id: this.advertiserId,
        page,
        page_size: pageSize,
      },
    });
    return response.data?.data?.list || [];
  }

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/file/video/delete/',
      data: {
        advertiser_id: this.advertiserId,
        video_ids: [videoId],
      },
    });
    return response.data;
  }

  // ============================================================
  // Creative Management
  // ============================================================

  /**
   * Get creatives for an ad
   */
  async getCreatives(adId: string, page: number = 1, pageSize: number = 20): Promise<Creative[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/creative/get/',
      params: {
        advertiser_id: this.advertiserId,
        filtering: JSON.stringify([{ field: 'ad_id', operator: 'EQ', values: [adId] }]),
        page,
        page_size: pageSize,
      },
    });

    const list = response.data?.data?.list || [];
    return list.map((c: any) => ({
      id: c.creative_id || c.id,
      platform: 'tiktok' as const,
      name: c.creative_name || '',
      type: c.creative_type || '',
      status: c.status || '',
      thumbnailUrl: c.thumbnail_url || c.image_url || '',
      mediaUrl: c.video_url || c.image_url || '',
      title: c.title || '',
      body: c.creative_text || '',
      callToAction: c.call_to_action || '',
      linkUrl: c.click_tracking_url || c.landing_page_url || '',
      adFormat: c.ad_format || '',
      raw: c,
    }));
  }

  /**
   * Create a creative for an ad group
   */
  async createCreative(data: {
    adGroupId: string;
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
    sparkAdId?: string;
    sparkAdAdvertiserId?: string;
  }): Promise<any> {
    const payload: any = {
      advertiser_id: this.advertiserId,
      adgroup_id: data.adGroupId,
      creatives: [
        {
          creative_name: data.creativeName,
          identity_type: data.identityType,
        },
      ],
    };

    const creative = payload.creatives[0];
    if (data.identityId) creative.identity_id = data.identityId;
    if (data.imageIds) creative.image_ids = data.imageIds;
    if (data.videoId) creative.video_id = data.videoId;
    if (data.title) creative.title = data.title;
    if (data.callToAction) creative.call_to_action = data.callToAction;
    if (data.landingPageUrl) creative.landing_page_url = data.landingPageUrl;
    if (data.displayName) creative.display_name = data.displayName;
    if (data.profileImageId) creative.profile_image_id = data.profileImageId;
    if (data.adFormat) creative.ad_format = data.adFormat;
    if (data.musicId) creative.music_id = data.musicId;
    if (data.leadFormId) creative.lead_form_id = data.leadFormId;
    if (data.sparkAdId && data.sparkAdAdvertiserId) {
      creative.spark_ad = {
        spark_ad_id: data.sparkAdId,
        advertiser_id: data.sparkAdAdvertiserId,
      };
    }

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/creative/create/',
      data: payload,
    });
    return response.data;
  }

  /**
   * Update a creative
   */
  async updateCreative(creativeId: string, data: {
    creativeName?: string;
    title?: string;
    callToAction?: string;
    landingPageUrl?: string;
    imageIds?: string[];
    videoId?: string;
    status?: string;
  }): Promise<any> {
    const payload: any = {
      advertiser_id: this.advertiserId,
      creative_id: creativeId,
    };
    if (data.creativeName) payload.creative_name = data.creativeName;
    if (data.title) payload.title = data.title;
    if (data.callToAction) payload.call_to_action = data.callToAction;
    if (data.landingPageUrl) payload.landing_page_url = data.landingPageUrl;
    if (data.imageIds) payload.image_ids = data.imageIds;
    if (data.videoId) payload.video_id = data.videoId;
    if (data.status) payload.status = data.status;

    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/creative/update/',
      data: payload,
    });
    return response.data;
  }

  /**
   * Delete a creative
   */
  async deleteCreative(creativeId: string): Promise<any> {
    const response = await makeApiCall(this.client, {
      method: 'POST',
      url: '/creative/delete/',
      data: {
        advertiser_id: this.advertiserId,
        creative_id: creativeId,
      },
    });
    return response.data;
  }

  // ============================================================
  // Call-to-Action Management
  // ============================================================

  /**
   * Get available call-to-action types
   */
  async getCallToActionTypes(): Promise<string[]> {
    return [
      'CLICK_WEBSITE', 'CONTACT_US', 'DOWNLOAD', 'INSTALL_APP',
      'LEARN_MORE', 'MESSAGE', 'MORE_INFO', 'ORDER_NOW',
      'REGISTER', 'SEND_MESSAGE', 'SHOP_NOW', 'SIGN_UP',
      'SUBSCRIBE', 'USE_APP', 'VIEW_DETAILS', 'WATCH_VIDEO',
      'BOOK_NOW', 'DONATE', 'GET_QUOTE', 'PLAY_GAME',
      'SEE_MENU', 'TAP_TO_CALL', 'TICKETS', 'VOTE',
    ];
  }

  // ============================================================
  // Ad Format Management
  // ============================================================

  /**
   * Get supported ad formats
   */
  async getSupportedAdFormats(): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/ad_format/get/',
      params: { advertiser_id: this.advertiserId },
    });
    return response.data?.data?.list || [];
  }

  // ============================================================
  // Identity Management
  // ============================================================

  /**
   * Get available identities for creatives
   */
  async getIdentities(): Promise<any[]> {
    const response = await makeApiCall(this.client, {
      method: 'GET',
      url: '/identity/get/',
      params: { advertiser_id: this.advertiserId },
    });
    return response.data?.data?.list || [];
  }
}
