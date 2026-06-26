// ============================================================
// TikTok OAuth - Authentication Flow
// ============================================================
// Handles TikTok Business API OAuth 2.0:
// - Generate authorization URL
// - Exchange code for access token
// - Refresh tokens
// - Get advertiser info
// ============================================================

import axios from 'axios';
import { TIKTOK_CONFIG } from '../config';
import { tokenManager } from '../utils/tokenManager';

// ============================================================
// Types
// ============================================================
export interface TikTokTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  scope: string;
  advertiserIds: string[];
  advertiserNames: string[];
}

export interface TikTokAuthUrlParams {
  state?: string;
  scope?: string[];
}

// ============================================================
// Generate TikTok OAuth URL
// ============================================================
export function getTikTokAuthUrl(params?: TikTokAuthUrlParams): string {
  const queryParams = new URLSearchParams({
    app_id: TIKTOK_CONFIG.appId,
    redirect_uri: TIKTOK_CONFIG.redirectUri,
    state: params?.state || 'tiktok_auth_state',
    scope: (params?.scope || TIKTOK_CONFIG.scopes).join(','),
  });

  return `${TIKTOK_CONFIG.authUrl}?${queryParams.toString()}`;
}

// ============================================================
// Exchange Authorization Code for Access Token
// ============================================================
export async function handleTikTokCallback(
  authCode: string,
  codeVerifier?: string
): Promise<TikTokTokenResponse> {
  try {
    const response = await axios.post(
      TIKTOK_CONFIG.tokenUrl,
      {
        app_id: TIKTOK_CONFIG.appId,
        secret: TIKTOK_CONFIG.appSecret,
        auth_code: authCode,
        grant_type: 'authorization_code',
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data?.data;
    if (!data) {
      throw new Error(response.data?.message || 'Empty response from TikTok');
    }

    const tokenInfo: TikTokTokenResponse = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      scope: data.scope || '',
      advertiserIds: data.advertiser_ids || [],
      advertiserNames: data.advertiser_names || [],
    };

    // Store tokens - use first advertiser ID as key
    const accountId = tokenInfo.advertiserIds[0] || 'default';
    await tokenManager.setTokens('tiktok', accountId, {
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken,
      expiresAt: Date.now() + tokenInfo.expiresIn * 1000,
      tokenType: tokenInfo.tokenType,
      scopes: tokenInfo.scope.split(','),
      platformUserId: accountId,
      platformUserName: tokenInfo.advertiserNames[0] || '',
    });

    return tokenInfo;
  } catch (error: any) {
    console.error('[TikTok Auth] Error exchanging code:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
      'فشل في الحصول على رمز الوصول من TikTok'
    );
  }
}

// ============================================================
// Refresh Access Token
// ============================================================
export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  try {
    const response = await axios.post(
      TIKTOK_CONFIG.tokenUrl,
      {
        app_id: TIKTOK_CONFIG.appId,
        secret: TIKTOK_CONFIG.appSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data?.data;
    if (!data) {
      throw new Error(response.data?.message || 'Empty refresh response');
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in,
      refreshExpiresIn: data.refresh_expires_in,
      scope: data.scope || '',
      advertiserIds: data.advertiser_ids || [],
      advertiserNames: data.advertiser_names || [],
    };
  } catch (error: any) {
    console.error('[TikTok Auth] Error refreshing token:', error.response?.data || error.message);
    throw new Error('فشل في تحديث رمز الوصول من TikTok');
  }
}

// ============================================================
// Get Advertiser Info
// ============================================================
export async function getTikTokAdvertiserInfo(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${TIKTOK_CONFIG.baseUrl}/advertiser/info/`,
      {
        params: {
          advertiser_ids: '[]', // Will return all advertisers
        },
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data?.data || [];
  } catch (error: any) {
    console.error('[TikTok Auth] Error getting advertisers:', error.response?.data || error.message);
    throw new Error('فشل في الحصول على معلومات المعلنين');
  }
}

// ============================================================
// Verify Token Validity
// ============================================================
export async function verifyTikTokToken(accessToken: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${TIKTOK_CONFIG.baseUrl}/oauth2/advertiser/get/`,
      {
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data?.code === 0;
  } catch {
    return false;
  }
}
