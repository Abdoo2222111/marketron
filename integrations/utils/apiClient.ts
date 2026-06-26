// ============================================================
// API Client - Axios Wrapper with auth, retry, rate limiting
// ============================================================
// Provides a configured Axios instance for each platform with:
// - Automatic token refresh on 401 responses
// - Rate limiting per platform (configurable)
// - Retry with exponential backoff
// - Request/response logging
// - Timeout handling
// - Response normalization
// ============================================================

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { APP_CONFIG } from '../config';

// ============================================================
// Types
// ============================================================
export interface ApiClientOptions {
  baseUrl: string;
  platform: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  getAccessToken?: () => Promise<string | null>;
  onTokenRefresh?: () => Promise<string | null>;
}

export interface ApiError {
  platform: string;
  status: number | null;
  code: string;
  message: string;
  details: any;
  originalError: any;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// ============================================================
// Rate Limiter (per-platform sliding window)
// ============================================================
class PlatformRateLimiter {
  private limits: Map<string, { timestamps: number[]; config: RateLimitConfig }> = new Map();

  constructor() {
    // Default limits per platform - will be overridden by config
    this.limits.set('facebook', { timestamps: [], config: { maxRequests: 200, windowMs: 3600000 } }); // 200/hour
    this.limits.set('instagram', { timestamps: [], config: { maxRequests: 200, windowMs: 3600000 } }); // Same as FB
    this.limits.set('tiktok', { timestamps: [], config: { maxRequests: 100, windowMs: 60000 } }); // 100/minute
    this.limits.set('snapchat', { timestamps: [], config: { maxRequests: 1000, windowMs: 86400000 } }); // 1000/day
    this.limits.set('google', { timestamps: [], config: { maxRequests: 150, windowMs: 60000 } }); // 150/minute
  }

  setLimit(platform: string, maxRequests: number, windowMs: number) {
    this.limits.set(platform.toLowerCase(), {
      timestamps: [],
      config: { maxRequests, windowMs },
    });
  }

  async waitForSlot(platform: string): Promise<void> {
    const limiter = this.limits.get(platform.toLowerCase());
    if (!limiter) return;

    const now = Date.now();
    const { config } = limiter;

    // Remove expired timestamps
    limiter.timestamps = limiter.timestamps.filter((t) => now - t < config.windowMs);

    if (limiter.timestamps.length >= config.maxRequests) {
      // Calculate wait time until oldest timestamp expires
      const oldest = limiter.timestamps[0];
      const waitTime = oldest + config.windowMs - now;

      if (waitTime > 0) {
        console.warn(
          `[RateLimiter] ${platform}: rate limit reached (${limiter.timestamps.length}/${config.maxRequests}). Waiting ${Math.ceil(waitTime / 1000)}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        // Clean up and retry
        return this.waitForSlot(platform);
      }
    }

    limiter.timestamps.push(Date.now());
  }
}

// Global rate limiter instance
export const rateLimiter = new PlatformRateLimiter();

// ============================================================
// Retry with Exponential Backoff
// ============================================================
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = APP_CONFIG.maxRetries,
  baseDelay: number = APP_CONFIG.retryDelay
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit) and 401 (auth)
      if (error.response?.status) {
        const status = error.response.status;
        if (status >= 400 && status < 500 && status !== 429 && status !== 401) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.warn(`[Retry] Attempt ${attempt}/${maxRetries} failed. Retrying in ${Math.ceil(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// ============================================================
// Create API Client
// ============================================================
export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const {
    baseUrl,
    platform,
    timeout = APP_CONFIG.defaultTimeout,
    maxRetries = APP_CONFIG.maxRetries,
    headers = {},
    getAccessToken,
    onTokenRefresh,
  } = options;

  const client: AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
  });

  // ============================================================
  // Request Interceptor
  // ============================================================
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Apply rate limiting
      await rateLimiter.waitForSlot(platform);

      // Add auth token if available
      if (getAccessToken) {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log request
      if (APP_CONFIG.env === 'development') {
        console.log(`[${platform.toUpperCase()}] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ============================================================
  // Response Interceptor
  // ============================================================
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log success
      if (APP_CONFIG.env === 'development') {
        console.log(`[${platform.toUpperCase()}] Response ${response.status} from ${response.config.url}`);
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 - Token expired, try refresh
      if (error.response?.status === 401 && !originalRequest._retry && onTokenRefresh) {
        originalRequest._retry = true;
        try {
          const newToken = await onTokenRefresh();
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          console.error(`[${platform.toUpperCase()}] Token refresh failed:`, refreshError);
          return Promise.reject(normalizeError(error, platform));
        }
      }

      return Promise.reject(normalizeError(error, platform));
    }
  );

  return client;
}

// ============================================================
// Error Normalization
// ============================================================
export function normalizeError(error: any, platform: string): ApiError {
  if (error.isAxiosError) {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status || null;
    const data = axiosError.response?.data || {};

    // Platform-specific error extraction
    let code = 'UNKNOWN_ERROR';
    let message = 'An unknown error occurred';
    let details = data;

    switch (platform) {
      case 'facebook':
      case 'instagram':
        code = data?.error?.code?.toString() || 'FB_ERROR';
        message = data?.error?.message || data?.error?.error_user_msg || 'Facebook API error';
        details = data?.error?.error_data || data?.error;
        break;

      case 'tiktok':
        code = data?.code?.toString() || 'TK_ERROR';
        message = data?.message || 'TikTok API error';
        details = data?.data || data;
        break;

      case 'snapchat':
        code = data?.sub_code || data?.error?.code || 'SC_ERROR';
        message = data?.error?.message || 'Snapchat API error';
        details = data?.error;
        break;

      case 'google':
        code = data?.error?.code?.toString() || 'G_ERROR';
        message = data?.error?.message || 'Google API error';
        details = data?.error?.errors || data?.error;
        break;
    }

    return {
      platform,
      status,
      code,
      message,
      details,
      originalError: axiosError,
    };
  }

  return {
    platform,
    status: null,
    code: 'INTERNAL_ERROR',
    message: error?.message || 'Internal client error',
    details: error,
    originalError: error,
  };
}

// ============================================================
// Helper: Make API Call with Retry
// ============================================================
export async function makeApiCall<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  retries: number = APP_CONFIG.maxRetries
): Promise<AxiosResponse<T>> {
  return retryWithBackoff(() => client.request<T>(config), retries);
}

// ============================================================
// Helper: Paginate Through All Results
// ============================================================
export async function paginateAll<T>(
  client: AxiosInstance,
  baseConfig: AxiosRequestConfig,
  getNextPageUrl: (response: AxiosResponse) => string | null,
  maxPages: number = 50
): Promise<T[]> {
  const allResults: T[] = [];
  let pageCount = 0;
  let currentConfig: AxiosRequestConfig = { ...baseConfig };

  while (pageCount < maxPages) {
    const response = await makeApiCall<T[]>(client, currentConfig);
    const data = response.data;

    if (Array.isArray(data)) {
      allResults.push(...data);
    } else if (data?.data && Array.isArray(data.data)) {
      allResults.push(...data.data);
    }

    pageCount++;
    const nextUrl = getNextPageUrl(response);
    if (!nextUrl) break;

    currentConfig = { ...currentConfig, url: nextUrl };
  }

  return allResults;
}
