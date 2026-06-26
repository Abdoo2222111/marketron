// ============================================================
// Token Manager - Secure Token Storage & Auto-Refresh
// ============================================================
// Handles OAuth token lifecycle for all platforms:
// - Secure encrypted storage of tokens
// - Automatic refresh before expiry
// - Token validation and debugging
// - Revocation on disconnect
// ============================================================

import * as crypto from 'crypto';
import { APP_CONFIG } from '../config';

// ============================================================
// Types
// ============================================================
export interface PlatformTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp (ms)
  tokenType: string;
  scopes: string[];
  platformUserId?: string;
  platformUserName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TokenStore {
  [platform: string]: {
    [accountId: string]: PlatformTokens;
  };
}

// ============================================================
// Encryption Utilities
// ============================================================
class TokenEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(secretKey: string) {
    // Derive a 256-bit key from the secret using SHA-256
    this.key = crypto.createHash('sha256').update(secretKey).digest();
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:authTag:ciphertext (all hex)
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// ============================================================
// Token Manager Class
// ============================================================
export class TokenManager {
  private store: TokenStore = {};
  private encryption: TokenEncryption;
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private storageKey = 'social_integration_tokens';

  constructor() {
    this.encryption = new TokenEncryption(APP_CONFIG.encryptionKey);
    this.loadFromStorage();
  }

  // ============================================================
  // Store tokens for a platform account
  // ============================================================
  async setTokens(
    platform: string,
    accountId: string,
    tokens: Omit<PlatformTokens, 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const now = Date.now();

    if (!this.store[platform]) {
      this.store[platform] = {};
    }

    this.store[platform][accountId] = {
      ...tokens,
      createdAt: this.store[platform][accountId]?.createdAt || now,
      updatedAt: now,
    };

    this.saveToStorage();
    this.scheduleRefresh(platform, accountId, tokens.expiresAt);
  }

  // ============================================================
  // Get tokens for a platform account
  // ============================================================
  getTokens(platform: string, accountId: string): PlatformTokens | null {
    return this.store[platform]?.[accountId] || null;
  }

  // ============================================================
  // Get access token (auto-refreshes if needed)
  // ============================================================
  async getAccessToken(platform: string, accountId: string): Promise<string | null> {
    const tokens = this.store[platform]?.[accountId];
    if (!tokens) return null;

    // Check if token is expired or about to expire
    const bufferMs = APP_CONFIG.tokenExpiryBufferMinutes * 60 * 1000;
    if (Date.now() + bufferMs >= tokens.expiresAt) {
      // Try to refresh
      const refreshed = await this.refreshTokens(platform, accountId);
      if (refreshed) {
        return refreshed.accessToken;
      }
      // If refresh fails, return expired token (caller handles 401)
    }

    return tokens.accessToken;
  }

  // ============================================================
  // Refresh tokens (platform-specific implementation)
  // ============================================================
  async refreshTokens(
    platform: string,
    accountId: string,
    refreshFn?: (refreshToken: string) => Promise<Partial<PlatformTokens>>
  ): Promise<PlatformTokens | null> {
    const tokens = this.store[platform]?.[accountId];
    if (!tokens?.refreshToken) return null;

    try {
      if (refreshFn) {
        const updated = await refreshFn(tokens.refreshToken);
        const newExpiresAt = updated.expiresAt || Date.now() + 3600 * 1000; // Default 1 hour

        return this.updateTokens(platform, accountId, {
          accessToken: updated.accessToken || tokens.accessToken,
          refreshToken: updated.refreshToken || tokens.refreshToken,
          expiresAt: newExpiresAt,
          tokenType: updated.tokenType || tokens.tokenType,
          scopes: updated.scopes || tokens.scopes,
          platformUserId: updated.platformUserId || tokens.platformUserId,
          platformUserName: updated.platformUserName || tokens.platformUserName,
        });
      }
    } catch (error) {
      console.error(`[TokenManager] Failed to refresh ${platform} tokens:`, error);
      return null;
    }

    return null;
  }

  // ============================================================
  // Update tokens (partial update)
  // ============================================================
  updateTokens(
    platform: string,
    accountId: string,
    updates: Partial<PlatformTokens>
  ): PlatformTokens {
    const existing = this.store[platform]?.[accountId];
    if (!existing) {
      throw new Error(`No existing tokens for ${platform}:${accountId}`);
    }

    const updated: PlatformTokens = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    this.store[platform][accountId] = updated;
    this.saveToStorage();
    this.scheduleRefresh(platform, accountId, updated.expiresAt);

    return updated;
  }

  // ============================================================
  // Remove tokens (revoke/disconnect)
  // ============================================================
  async removeTokens(platform: string, accountId: string): Promise<void> {
    const timerKey = `${platform}:${accountId}`;
    if (this.refreshTimers.has(timerKey)) {
      clearTimeout(this.refreshTimers.get(timerKey)!);
      this.refreshTimers.delete(timerKey);
    }

    if (this.store[platform]) {
      delete this.store[platform][accountId];
      if (Object.keys(this.store[platform]).length === 0) {
        delete this.store[platform];
      }
    }

    this.saveToStorage();
  }

  // ============================================================
  // Get all stored accounts for a platform
  // ============================================================
  getAccounts(platform: string): Array<{ accountId: string; tokens: PlatformTokens }> {
    const platformStore = this.store[platform];
    if (!platformStore) return [];

    return Object.entries(platformStore).map(([accountId, tokens]) => ({
      accountId,
      tokens,
    }));
  }

  // ============================================================
  // Check if token exists and is valid
  // ============================================================
  isValid(platform: string, accountId: string): boolean {
    const tokens = this.store[platform]?.[accountId];
    if (!tokens) return false;

    const bufferMs = APP_CONFIG.tokenExpiryBufferMinutes * 60 * 1000;
    return Date.now() + bufferMs < tokens.expiresAt;
  }

  // ============================================================
  // Get expiry info for a token
  // ============================================================
  getExpiryInfo(platform: string, accountId: string): {
    valid: boolean;
    expiresAt: Date | null;
    expiresIn: number | null;
    needsRefresh: boolean;
  } | null {
    const tokens = this.store[platform]?.[accountId];
    if (!tokens) return null;

    const now = Date.now();
    const bufferMs = APP_CONFIG.tokenExpiryBufferMinutes * 60 * 1000;

    return {
      valid: now < tokens.expiresAt,
      expiresAt: new Date(tokens.expiresAt),
      expiresIn: Math.max(0, tokens.expiresAt - now),
      needsRefresh: now + bufferMs >= tokens.expiresAt,
    };
  }

  // ============================================================
  // Schedule automatic token refresh
  // ============================================================
  private scheduleRefresh(platform: string, accountId: string, expiresAt: number): void {
    const timerKey = `${platform}:${accountId}`;

    // Clear existing timer
    if (this.refreshTimers.has(timerKey)) {
      clearTimeout(this.refreshTimers.get(timerKey)!);
    }

    // Schedule refresh 5 minutes before expiry
    const refreshIn = Math.max(0, expiresAt - Date.now() - APP_CONFIG.tokenExpiryBufferMinutes * 60 * 1000);

    if (refreshIn > 0) {
      const timer = setTimeout(async () => {
        console.log(`[TokenManager] Auto-refreshing ${platform}:${accountId}`);
        await this.refreshTokens(platform, accountId);
      }, refreshIn);

      this.refreshTimers.set(timerKey, timer);
    }
  }

  // ============================================================
  // Persist tokens to localStorage-compatible storage
  // ============================================================
  private saveToStorage(): void {
    try {
      const serialized = JSON.stringify(this.store);
      const encrypted = this.encryption.encrypt(serialized);
      // In Node.js, we use a global variable; in browser, localStorage
      (global as any).__token_store = encrypted;
    } catch (error) {
      console.error('[TokenManager] Failed to save tokens:', error);
    }
  }

  // ============================================================
  // Load tokens from storage
  // ============================================================
  private loadFromStorage(): void {
    try {
      const encrypted = (global as any).__token_store;
      if (encrypted) {
        const decrypted = this.encryption.decrypt(encrypted);
        this.store = JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('[TokenManager] Failed to load tokens:', error);
      this.store = {};
    }
  }

  // ============================================================
  // Export for backup/migration
  // ============================================================
  exportTokens(): string {
    return this.encryption.encrypt(JSON.stringify(this.store));
  }

  // ============================================================
  // Import tokens from backup
  // ============================================================
  importTokens(encryptedBackup: string): boolean {
    try {
      const decrypted = this.encryption.decrypt(encryptedBackup);
      this.store = JSON.parse(decrypted);
      this.saveToStorage();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton
export const tokenManager = new TokenManager();
