// ============================================================
// Facebook OAuth - Authentication Flow
// ============================================================
// Handles Facebook/Instagram OAuth 2.0:
// - Generate login URL
// - Exchange authorization code for access token
// - Exchange short-lived token for long-lived token
// - Token debugging and validation
// ============================================================

import axios from 'axios';
import { FACEBOOK_CONFIG } from '../config';
import { tokenManager } from '../utils/tokenManager';

// ============================================================
// Types
// ============================================================
export interface FacebookTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  longLivedToken?: string;
  longLivedExpiresIn?: number;
}

export interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: { data: { url: string } };
}

export interface FacebookDebugToken {
  appId: string;
  application: string;
  expiresAt: number;
  isValid: boolean;
  scopes: string[];
  userId: string;
  userName?: string;
}

// ============================================================
// Generate Facebook Login URL
// ============================================================
export function getFacebookAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: FACEBOOK_CONFIG.appId,
    redirect_uri: FACEBOOK_CONFIG.redirectUri,
    scope: FACEBOOK_CONFIG.scopes.join(','),
    response_type: 'code',
    auth_type: 'rerequest',
    ...(state ? { state } : {}),
  });

  return `${FACEBOOK_CONFIG.authUrl}?${params.toString()}`;
}

// ============================================================
// Exchange Authorization Code for Access Token
// ============================================================
export async function handleFacebookCallback(code: string): Promise<FacebookTokenResponse> {
  try {
    // Exchange code for short-lived token
    const tokenResponse = await axios.get(FACEBOOK_CONFIG.tokenUrl, {
      params: {
        client_id: FACEBOOK_CONFIG.appId,
        client_secret: FACEBOOK_CONFIG.appSecret,
        redirect_uri: FACEBOOK_CONFIG.redirectUri,
        code,
      },
    });

    const { access_token, token_type, expires_in } = tokenResponse.data;

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await axios.get(
      `${FACEBOOK_CONFIG.graphUrl}/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: FACEBOOK_CONFIG.appId,
          client_secret: FACEBOOK_CONFIG.appSecret,
          fb_exchange_token: access_token,
        },
      }
    );

    const { access_token: longLivedToken, expires_in: longLivedExpiresIn } = longLivedResponse.data;

    // Get debug info to identify user
    const debugInfo = await debugFacebookToken(longLivedToken);

    // Store tokens in manager
    if (debugInfo.userId) {
      await tokenManager.setTokens('facebook', debugInfo.userId, {
        accessToken: longLivedToken,
        refreshToken: longLivedToken, // Facebook tokens are self-refreshable
        expiresAt: Date.now() + (longLivedExpiresIn || 5184000) * 1000,
        tokenType: token_type || 'bearer',
        scopes: debugInfo.scopes || [],
        platformUserId: debugInfo.userId,
        platformUserName: debugInfo.userName,
      });
    }

    return {
      accessToken: access_token,
      tokenType: token_type || 'bearer',
      expiresIn: expires_in,
      longLivedToken,
      longLivedExpiresIn: longLivedExpiresIn || 5184000,
    };
  } catch (error: any) {
    console.error('[Facebook Auth] Error exchanging code:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.error_user_msg ||
      'فشل في الحصول على رمز الوصول من Facebook'
    );
  }
}

// ============================================================
// Exchange Short-Lived Token for Long-Lived Token
// ============================================================
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
  try {
    const response = await axios.get(
      `${FACEBOOK_CONFIG.graphUrl}/oauth/access_token`,
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: FACEBOOK_CONFIG.appId,
          client_secret: FACEBOOK_CONFIG.appSecret,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('[Facebook Auth] Error getting long-lived token:', error.response?.data || error.message);
    throw new Error('فشل في تمديد صلاحية رمز الوصول');
  }
}

// ============================================================
// Refresh Token (same as long-lived exchange)
// ============================================================
export async function refreshFacebookToken(token: string): Promise<string> {
  // Facebook doesn't have a separate refresh; we re-exchange
  try {
    const newToken = await exchangeForLongLivedToken(token);
    return newToken;
  } catch (error) {
    throw new Error('فشل في تحديث رمز الوصول');
  }
}

// ============================================================
// Debug / Inspect Token
// ============================================================
export async function debugFacebookToken(token: string): Promise<FacebookDebugToken> {
  try {
    const response = await axios.get(
      `${FACEBOOK_CONFIG.graphUrl}/debug_token`,
      {
        params: {
          input_token: token,
          access_token: `${FACEBOOK_CONFIG.appId}|${FACEBOOK_CONFIG.appSecret}`,
        },
      }
    );

    const data = response.data.data;
    return {
      appId: data.app_id,
      application: data.application || '',
      expiresAt: data.expires_at * 1000,
      isValid: data.is_valid,
      scopes: data.scopes || [],
      userId: data.user_id,
      userName: data.name,
    };
  } catch (error: any) {
    console.error('[Facebook Auth] Error debugging token:', error.response?.data || error.message);
    throw new Error('فشل في التحقق من رمز الوصول');
  }
}

// ============================================================
// Get User Info
// ============================================================
export async function getFacebookUserInfo(token: string): Promise<FacebookUserInfo> {
  try {
    const response = await axios.get(
      `${FACEBOOK_CONFIG.graphUrl}/me`,
      {
        params: {
          fields: 'id,name,email,picture',
          access_token: token,
        },
      }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      picture: response.data.picture,
    };
  } catch (error: any) {
    console.error('[Facebook Auth] Error getting user info:', error.response?.data || error.message);
    throw new Error('فشل في الحصول على معلومات المستخدم');
  }
}

// ============================================================
// Revoke Token (disconnect)
// ============================================================
export async function revokeFacebookToken(token: string): Promise<boolean> {
  try {
    await axios.delete(
      `${FACEBOOK_CONFIG.graphUrl}/me/permissions`,
      { params: { access_token: token } }
    );
    return true;
  } catch (error: any) {
    console.error('[Facebook Auth] Error revoking token:', error.response?.data || error.message);
    throw new Error('فشل في إلغاء صلاحية رمز الوصول');
  }
}

// ============================================================
// Get Login Status - check if token is still valid
// ============================================================
export async function getFacebookLoginStatus(token: string): Promise<{
  isLoggedIn: boolean;
  userId?: string;
  scopes?: string[];
  expiresAt?: Date;
}> {
  try {
    const debugInfo = await debugFacebookToken(token);
    return {
      isLoggedIn: debugInfo.isValid,
      userId: debugInfo.userId,
      scopes: debugInfo.scopes,
      expiresAt: new Date(debugInfo.expiresAt),
    };
  } catch {
    return { isLoggedIn: false };
  }
}
