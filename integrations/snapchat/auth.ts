// ============================================================
// Snapchat OAuth - Authentication Flow
// ============================================================
// Handles Snapchat Marketing API OAuth 2.0:
// - Generate authorization URL
// - Exchange code for access token
// - Refresh tokens
// - Get organization info
// ============================================================

import axios from 'axios';
import { SNAPCHAT_CONFIG } from '../config';
import { tokenManager } from '../utils/tokenManager';

// ============================================================
// Types
// ============================================================
export interface SnapchatTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
}

export interface SnapchatOrganization {
  id: string;
  name: string;
  type: string;
  status: string;
  roles: string[];
}

// ============================================================
// Generate Snapchat OAuth URL
// ============================================================
export function getSnapchatAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: SNAPCHAT_CONFIG.clientId,
    redirect_uri: SNAPCHAT_CONFIG.redirectUri,
    scope: SNAPCHAT_CONFIG.scopes.join(' '),
    response_type: 'code',
    state: state || 'snapchat_auth_state',
  });

  return `${SNAPCHAT_CONFIG.authUrl}?${params.toString()}`;
}

// ============================================================
// Exchange Authorization Code for Access Token
// ============================================================
export async function handleSnapchatCallback(
  code: string
): Promise<SnapchatTokenResponse> {
  try {
    const credentials = Buffer.from(
      `${SNAPCHAT_CONFIG.clientId}:${SNAPCHAT_CONFIG.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
      SNAPCHAT_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SNAPCHAT_CONFIG.redirectUri,
        client_id: SNAPCHAT_CONFIG.clientId,
        client_secret: SNAPCHAT_CONFIG.clientSecret,
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;
    const tokenInfo: SnapchatTokenResponse = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in,
      scope: data.scope || '',
    };

    // Store tokens with organization scope
    const accountId = 'default';
    await tokenManager.setTokens('snapchat', accountId, {
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken,
      expiresAt: Date.now() + tokenInfo.expiresIn * 1000,
      tokenType: tokenInfo.tokenType,
      scopes: tokenInfo.scope.split(' '),
      platformUserId: accountId,
    });

    return tokenInfo;
  } catch (error: any) {
    console.error('[Snapchat Auth] Error exchanging code:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
      'فشل في الحصول على رمز الوصول من Snapchat'
    );
  }
}

// ============================================================
// Refresh Access Token
// ============================================================
export async function refreshSnapchatToken(
  refreshToken: string
): Promise<SnapchatTokenResponse> {
  try {
    const credentials = Buffer.from(
      `${SNAPCHAT_CONFIG.clientId}:${SNAPCHAT_CONFIG.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
      SNAPCHAT_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SNAPCHAT_CONFIG.clientId,
        client_secret: SNAPCHAT_CONFIG.clientSecret,
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const data = response.data;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in,
      scope: data.scope || '',
    };
  } catch (error: any) {
    console.error('[Snapchat Auth] Error refreshing token:', error.response?.data || error.message);
    throw new Error('فشل في تحديث رمز الوصول من Snapchat');
  }
}

// ============================================================
// Get Organizations
// ============================================================
export async function getSnapchatOrganizations(
  accessToken: string
): Promise<SnapchatOrganization[]> {
  try {
    const response = await axios.get(
      `${SNAPCHAT_CONFIG.baseUrl}/me/organizations`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    return (response.data?.organizations || []).map((org: any) => ({
      id: org.id,
      name: org.name || '',
      type: org.type || '',
      status: org.status || '',
      roles: org.roles || [],
    }));
  } catch (error: any) {
    console.error('[Snapchat Auth] Error getting organizations:', error.response?.data || error.message);
    throw new Error('فشل في الحصول على معلومات المنظمات');
  }
}

// ============================================================
// Get Current User Info
// ============================================================
export async function getSnapchatMe(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      `${SNAPCHAT_CONFIG.baseUrl}/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('[Snapchat Auth] Error getting user info:', error.response?.data || error.message);
    throw new Error('فشل في الحصول على معلومات المستخدم');
  }
}
