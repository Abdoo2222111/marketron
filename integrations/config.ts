// ============================================================
// Social Integrations - Platform Configuration
// ============================================================
// Centralized config for all social media platform APIs
// Each config includes API version, base URL, auth endpoints,
// rate limits, and required scopes.
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// Facebook / Instagram Graph API Config
// ============================================================
export const FACEBOOK_CONFIG = {
  apiVersion: 'v20.0',
  baseUrl: 'https://graph.facebook.com/v20.0',
  authUrl: 'https://www.facebook.com/v20.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v20.0/oauth/access_token',
  graphUrl: 'https://graph.facebook.com/v20.0',
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:4000/api/v1/platforms/callback/facebook',
  scopes: [
    'ads_read',
    'ads_management',
    'business_management',
    'pages_read_engagement',
    'pages_manage_ads',
    'pages_manage_metadata',
    'pages_read_user_content',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_content_publish',
    'instagram_manage_comments',
    'public_profile',
  ],
  rateLimits: {
    maxRequestsPerHour: 200,
    maxRequestsPerUserPerHour: 200,
  },
  defaultFields: [
    'id',
    'name',
    'account_id',
    'account_status',
    'currency',
    'amount_spent',
    'balance',
    'daily_spend_limit',
  ],
};

// ============================================================
// TikTok Business API Config
// ============================================================
export const TIKTOK_CONFIG = {
  apiVersion: 'v2.0',
  baseUrl: 'https://business-api.tiktok.com/open_api/v2.0',
  authUrl: 'https://ads.tiktok.com/marketing_api/auth',
  tokenUrl: 'https://business-api.tiktok.com/open_api/v2.0/oauth2/access_token/',
  appId: process.env.TIKTOK_APP_ID || '',
  appSecret: process.env.TIKTOK_APP_SECRET || '',
  redirectUri: process.env.TIKTOK_REDIRECT_URI || 'http://localhost:4000/api/v1/platforms/callback/tiktok',
  scopes: [
    'user.info.basic',
    'ad.insights',
    'ad.management',
    'creative.management',
    'adgroup.management',
    'campaign.management',
    'file.management',
    'page.management',
  ],
  rateLimits: {
    maxRequestsPerMinute: 100,
    maxConcurrentRequests: 10,
  },
  uploadConfig: {
    maxChunkSize: 5 * 1024 * 1024, // 5MB per chunk for video upload
    maxVideoSize: 500 * 1024 * 1024, // 500MB max
    supportedFormats: ['mp4', 'avi', 'mov', 'webm'],
    maxDurationSeconds: 180,
  },
};

// ============================================================
// Snapchat Marketing API Config
// ============================================================
export const SNAPCHAT_CONFIG = {
  apiVersion: 'v1',
  baseUrl: 'https://adsapi.snapchat.com/v1',
  authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
  tokenUrl: 'https://accounts.snapchat.com/login/oauth2/access_token',
  clientId: process.env.SNAPCHAT_CLIENT_ID || '',
  clientSecret: process.env.SNAPCHAT_CLIENT_SECRET || '',
  redirectUri: process.env.SNAPCHAT_REDIRECT_URI || 'http://localhost:4000/api/v1/platforms/callback/snapchat',
  scopes: [
    'snapchat-marketing-api',
    'user.display_name',
    'user.organizations',
  ],
  rateLimits: {
    maxRequestsPerDay: 1000,
    maxRequestsPerMinute: 60,
  },
};

// ============================================================
// Google APIs Config
// ============================================================
export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/v1/platforms/callback/google',
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics',
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ],
  analytics: {
    baseUrl: 'https://analyticsdata.googleapis.com/v1beta',
    defaultDateRange: 30,
  },
  ads: {
    baseUrl: 'https://googleads.googleapis.com/v16',
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  },
  searchConsole: {
    baseUrl: 'https://searchconsole.googleapis.com/v1',
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
  },
};

// ============================================================
// App-wide Config
// ============================================================
export const APP_CONFIG = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',
  encryptionKey: process.env.TOKEN_ENCRYPTION_KEY || 'default-dev-key-change-in-production',
  tokenExpiryBufferMinutes: 5, // Refresh token 5 minutes before expiry
  defaultTimeout: 30000, // 30 seconds default timeout for API calls
  maxRetries: 3,
  retryDelay: 1000, // 1 second initial delay, doubles each retry
};
