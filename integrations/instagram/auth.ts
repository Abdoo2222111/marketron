// ============================================================
// Instagram Auth - Authentication Flow (via Facebook Graph API)
// ============================================================
// Instagram uses Facebook Login + Graph API for authentication.
// The auth flow is the same as Facebook — we link Instagram
// Business Accounts through Facebook Pages.
// ============================================================

import { FACEBOOK_CONFIG } from '../config';
import { tokenManager } from '../utils/tokenManager';
import {
  getFacebookAuthUrl,
  handleFacebookCallback as fbHandleCallback,
  exchangeForLongLivedToken,
  refreshFacebookToken,
  debugFacebookToken,
  revokeFacebookToken,
  getFacebookUserInfo,
} from '../facebook/auth';

// ============================================================
// Types
// ============================================================
export interface InstagramTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  fbPageId?: string;
  fbPageName?: string;
  igUserId?: string;
  igUsername?: string;
}

export interface InstagramBusinessAccount {
  id: string;
  username: string;
  name: string;
  profilePictureUrl: string;
  followerCount: number;
  followsCount: number;
  mediaCount: number;
}

// ============================================================
// Generate Instagram Auth URL (same as Facebook but with IG scopes)
// ============================================================
export function getInstagramAuthUrl(state?: string): string {
  return getFacebookAuthUrl(state || 'instagram_auth_state');
}

// ============================================================
// Handle Instagram OAuth Callback
// ============================================================
export async function handleInstagramCallback(
  code: string,
  pageId?: string
): Promise<InstagramTokenResponse> {
  try {
    // Use Facebook's callback to get the token
    const fbResponse = await fbHandleCallback(code);

    // Get user info
    const userInfo = await getFacebookUserInfo(fbResponse.longLivedToken || fbResponse.accessToken);

    // If pageId is provided, try to link Instagram Business Account
    let igUserId: string | undefined;
    let igUsername: string | undefined;

    if (pageId) {
      try {
        const axios = (await import('axios')).default;
        const pageResponse = await axios.get(
          `${FACEBOOK_CONFIG.graphUrl}/${pageId}`,
          {
            params: {
              fields: 'instagram_business_account{id,username,name,profile_picture_url,followers_count,media_count}',
              access_token: fbResponse.longLivedToken || fbResponse.accessToken,
            },
          }
        );

        const igAccount = pageResponse.data?.instagram_business_account;
        if (igAccount) {
          igUserId = igAccount.id;
          igUsername = igAccount.username;

          // Store the IG tokens separately
          await tokenManager.setTokens('instagram', igAccount.id, {
            accessToken: fbResponse.longLivedToken || fbResponse.accessToken,
            refreshToken: fbResponse.longLivedToken || fbResponse.accessToken,
            expiresAt: Date.now() + (fbResponse.longLivedExpiresIn || 5184000) * 1000,
            tokenType: fbResponse.tokenType,
            scopes: [],
            platformUserId: igAccount.id,
            platformUserName: igAccount.username,
          });
        }
      } catch (igError) {
        console.warn('[Instagram Auth] Could not fetch Instagram Business Account:', igError);
      }
    }

    return {
      accessToken: fbResponse.accessToken,
      tokenType: fbResponse.tokenType,
      expiresIn: fbResponse.expiresIn,
      fbPageId: pageId,
      igUserId,
      igUsername,
    };
  } catch (error: any) {
    console.error('[Instagram Auth] Error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.error_user_msg ||
      'فشل في الحصول على رمز الوصول من Instagram'
    );
  }
}

// ============================================================
// Get Instagram Business Account from Page
// ============================================================
export async function getInstagramBusinessAccount(
  accessToken: string,
  pageId: string
): Promise<InstagramBusinessAccount | null> {
  try {
    const axios = (await import('axios')).default;
    const response = await axios.get(
      `${FACEBOOK_CONFIG.graphUrl}/${pageId}`,
      {
        params: {
          fields: 'instagram_business_account{id,username,name,profile_picture_url,followers_count,follows_count,media_count}',
          access_token: accessToken,
        },
      }
    );

    const ig = response.data?.instagram_business_account;
    if (!ig) return null;

    return {
      id: ig.id,
      username: ig.username,
      name: ig.name || ig.username,
      profilePictureUrl: ig.profile_picture_url || '',
      followerCount: ig.followers_count || 0,
      followsCount: ig.follows_count || 0,
      mediaCount: ig.media_count || 0,
    };
  } catch {
    return null;
  }
}

// ============================================================
// Refresh Instagram Token
// ============================================================
export async function refreshInstagramToken(
  token: string
): Promise<string> {
  return refreshFacebookToken(token);
}

// ============================================================
// Debug / Check Instagram Token
// ============================================================
export async function debugInstagramToken(token: string) {
  return debugFacebookToken(token);
}

// ============================================================
// Disconnect / Revoke Instagram Access
// ============================================================
export async function revokeInstagramToken(token: string): Promise<boolean> {
  return revokeFacebookToken(token);
}

// ============================================================
// Get Login Status
// ============================================================
export async function getInstagramLoginStatus(
  token: string,
  igUserId?: string
): Promise<{
  isLoggedIn: boolean;
  igUserId?: string;
  expiresAt?: Date;
}> {
  try {
    const debugInfo = await debugFacebookToken(token);
    return {
      isLoggedIn: debugInfo.isValid,
      igUserId,
      expiresAt: new Date(debugInfo.expiresAt),
    };
  } catch {
    return { isLoggedIn: false };
  }
}
