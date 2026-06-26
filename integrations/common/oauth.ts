// ============================================================
// Unified OAuth Handler
// ============================================================
// Provides a standardized OAuth 2.0 flow handler that works
// across all platforms: Facebook, Instagram, TikTok, Snapchat.
// Handles state validation, PKCE (where supported), token
// exchange, and automatic token storage.
// ============================================================

import * as crypto from 'crypto';
import { tokenManager } from '../utils/tokenManager';
import { PlatformName, PlatformTokens } from './types';

// ============================================================
// OAuth State Management
// ============================================================
export interface OAuthState {
  platform: PlatformName;
  redirectUri: string;
  state: string;
  codeVerifier?: string;
  createdAt: number;
  userId?: string;
  metadata?: Record<string, any>;
}

class OAuthStateStore {
  private states: Map<string, OAuthState> = new Map();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Create a new OAuth state entry
   */
  createState(
    platform: PlatformName,
    redirectUri: string,
    metadata?: Record<string, any>
  ): { state: string; codeVerifier?: string } {
    const state = crypto.randomBytes(32).toString('hex');
    const usePKCE = platform === 'tiktok';

    const entry: OAuthState = {
      platform,
      redirectUri,
      state,
      createdAt: Date.now(),
      metadata,
    };

    if (usePKCE) {
      // Generate PKCE code verifier and challenge (SHA-256)
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      entry.codeVerifier = codeVerifier;
    }

    this.states.set(state, entry);

    // Auto-cleanup after TTL
    setTimeout(() => this.states.delete(state), this.TTL);

    return {
      state,
      ...(entry.codeVerifier ? { codeVerifier: entry.codeVerifier } : {}),
    };
  }

  /**
   * Validate and consume an OAuth state
   */
  validateState(
    state: string,
    platform: PlatformName
  ): OAuthState | null {
    const entry = this.states.get(state);
    if (!entry) return null;

    // Check expiry
    if (Date.now() - entry.createdAt > this.TTL) {
      this.states.delete(state);
      return null;
    }

    // Verify platform matches
    if (entry.platform !== platform) return null;

    // Consume the state (one-time use)
    this.states.delete(state);
    return entry;
  }

  /**
   * Clean up expired states
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.states.entries()) {
      if (now - entry.createdAt > this.TTL) {
        this.states.delete(key);
      }
    }
  }
}

export const oauthStateStore = new OAuthStateStore();

// ============================================================
// Token Storage Helper
// ============================================================
export async function storePlatformTokens(
  platform: PlatformName,
  accountId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType?: string;
    scopes?: string[];
    platformUserId?: string;
    platformUserName?: string;
  }
): Promise<PlatformTokens> {
  const now = Date.now();

  const platformTokens: PlatformTokens = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: now + tokens.expiresIn * 1000,
    tokenType: tokens.tokenType || 'bearer',
    scopes: tokens.scopes || [],
    platformUserId: tokens.platformUserId || accountId,
    platformUserName: tokens.platformUserName,
    createdAt: now,
    updatedAt: now,
  };

  await tokenManager.setTokens(platform, accountId, platformTokens);
  return platformTokens;
}

// ============================================================
// Token Validation
// ============================================================
export function isTokenExpired(expiresAt: number, bufferMs: number = 5 * 60 * 1000): boolean {
  return Date.now() + bufferMs >= expiresAt;
}

export function getTokenExpiryInfo(platform: PlatformName, accountId: string): {
  valid: boolean;
  expiresAt: Date | null;
  expiresInMs: number;
  needsRefresh: boolean;
} | null {
  const tokens = tokenManager.getTokens(platform, accountId);
  if (!tokens) return null;

  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;

  return {
    valid: now < tokens.expiresAt,
    expiresAt: new Date(tokens.expiresAt),
    expiresInMs: Math.max(0, tokens.expiresAt - now),
    needsRefresh: now + bufferMs >= tokens.expiresAt,
  };
}

// ============================================================
// OAuth Callback URL Builder
// ============================================================
export function buildOAuthCallbackUrl(
  baseUrl: string,
  platform: PlatformName
): string {
  // The platform callback is typically: {baseUrl}/api/v1/platforms/callback/{platform}
  const callbackPath = `/api/v1/platforms/callback/${platform}`;

  try {
    const url = new URL(callbackPath, baseUrl);
    return url.toString();
  } catch {
    // If baseUrl is relative, just concatenate
    return `${baseUrl.replace(/\/$/, '')}${callbackPath}`;
  }
}

// ============================================================
// OAuth Error Messages (Arabic)
// ============================================================
export const OAUTH_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  facebook: {
    INVALID_CODE: 'رمز التفويض غير صالح أو منتهي الصلاحية',
    TOKEN_EXCHANGE_FAILED: 'فشل في الحصول على رمز الوصول من Facebook',
    INVALID_TOKEN: 'رمز الوصول غير صالح',
    TOKEN_REFRESH_FAILED: 'فشل في تحديث رمز الوصول',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    PERMISSION_DENIED: 'لم يتم منح الصلاحيات المطلوبة',
  },
  instagram: {
    INVALID_CODE: 'رمز التفويض غير صالح أو منتهي الصلاحية',
    TOKEN_EXCHANGE_FAILED: 'فشل في الحصول على رمز الوصول من Instagram',
    INVALID_TOKEN: 'رمز الوصول غير صالح',
    TOKEN_REFRESH_FAILED: 'فشل في تحديث رمز الوصول',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    NO_BUSINESS_ACCOUNT: 'لا يوجد حساب أعمال Instagram مرتبط بهذه الصفحة',
  },
  tiktok: {
    INVALID_CODE: 'رمز التفويض غير صالح أو منتهي الصلاحية',
    TOKEN_EXCHANGE_FAILED: 'فشل في الحصول على رمز الوصول من TikTok',
    INVALID_TOKEN: 'رمز الوصول غير صالح',
    TOKEN_REFRESH_FAILED: 'فشل في تحديث رمز الوصول',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    NO_ADVERTISER: 'لا يوجد حساب معلن مرتبط بهذا الحساب',
  },
  snapchat: {
    INVALID_CODE: 'رمز التفويض غير صالح أو منتهي الصلاحية',
    TOKEN_EXCHANGE_FAILED: 'فشل في الحصول على رمز الوصول من Snapchat',
    INVALID_TOKEN: 'رمز الوصول غير صالح',
    TOKEN_REFRESH_FAILED: 'فشل في تحديث رمز الوصول',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
    NO_ORGANIZATION: 'لا يوجد منظمة مرتبطة بهذا الحساب',
  },
};

export function getOAuthErrorMessage(platform: PlatformName, code: string): string {
  return OAUTH_ERROR_MESSAGES[platform]?.[code] || `حدث خطأ في المصادقة مع ${platform}`;
}
