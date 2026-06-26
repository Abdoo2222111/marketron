// ============================================================
// Rate Limiter - Per-Platform Request Throttling
// ============================================================
// Implements sliding-window rate limiting for each platform API.
// Respects documented API limits and provides queue management.
// ============================================================

export interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  /** Optional: concurrent request limit */
  maxConcurrent?: number;
}

export interface RateLimitState {
  timestamps: number[];
  concurrentCount: number;
  queue: Array<{
    resolve: () => void;
    reject: (err: Error) => void;
    timeoutId: NodeJS.Timeout;
  }>;
}

type PlatformName = 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'google';

// ============================================================
// Default Rate Limit Rules (from official docs)
// ============================================================
const DEFAULT_RULES: Record<PlatformName, RateLimitRule> = {
  facebook: {
    maxRequests: 200, // 200 calls per hour per user
    windowMs: 3600000, // 1 hour
    maxConcurrent: 10,
  },
  instagram: {
    maxRequests: 200, // Same as Facebook
    windowMs: 3600000,
    maxConcurrent: 10,
  },
  tiktok: {
    maxRequests: 100, // 100 calls per minute
    windowMs: 60000, // 1 minute
    maxConcurrent: 10,
  },
  snapchat: {
    maxRequests: 1000, // 1000 calls per day
    windowMs: 86400000, // 24 hours
    maxConcurrent: 5,
  },
  google: {
    maxRequests: 150, // 150 calls per minute per project
    windowMs: 60000,
    maxConcurrent: 20,
  },
};

// ============================================================
// Rate Limiter Class
// ============================================================
export class RateLimiter {
  private states: Map<PlatformName, RateLimitState> = new Map();
  private customRules: Map<PlatformName, RateLimitRule> = new Map();
  private totalRequests: Map<PlatformName, number> = new Map();
  private totalThrottled: Map<PlatformName, number> = new Map();

  constructor() {
    // Initialize states for all platforms
    for (const platform of Object.keys(DEFAULT_RULES) as PlatformName[]) {
      this.states.set(platform, {
        timestamps: [],
        concurrentCount: 0,
        queue: [],
      });
      this.totalRequests.set(platform, 0);
      this.totalThrottled.set(platform, 0);
    }
  }

  // ============================================================
  // Configure custom rate limits for a platform
  // ============================================================
  setRule(platform: PlatformName, rule: Partial<RateLimitRule>): void {
    const existing = this.getRule(platform);
    this.customRules.set(platform, { ...existing, ...rule });
  }

  // ============================================================
  // Get effective rule for a platform
  // ============================================================
  getRule(platform: PlatformName): RateLimitRule {
    return this.customRules.get(platform) || DEFAULT_RULES[platform];
  }

  // ============================================================
  // Acquire a rate limit slot (blocking via promise)
  // ============================================================
  async acquire(platform: PlatformName, timeoutMs: number = 60000): Promise<void> {
    const state = this.states.get(platform);
    if (!state) return;

    const rule = this.getRule(platform);
    const now = Date.now();

    // Clean expired timestamps
    state.timestamps = state.timestamps.filter((t) => now - t < rule.windowMs);

    // Check concurrent limit
    if (rule.maxConcurrent && state.concurrentCount >= rule.maxConcurrent) {
      return this.enqueue(platform, state, timeoutMs);
    }

    // Check rate limit
    if (state.timestamps.length >= rule.maxRequests) {
      return this.enqueue(platform, state, timeoutMs);
    }

    // Allow request
    state.timestamps.push(now);
    state.concurrentCount++;
    this.totalRequests.set(platform, (this.totalRequests.get(platform) || 0) + 1);

    return Promise.resolve();
  }

  // ============================================================
  // Release a slot (call after request completes)
  // ============================================================
  release(platform: PlatformName): void {
    const state = this.states.get(platform);
    if (!state) return;

    state.concurrentCount = Math.max(0, state.concurrentCount - 1);

    // Process next in queue
    this.processQueue(platform, state);
  }

  // ============================================================
  // Enqueue request when rate limited
  // ============================================================
  private enqueue(platform: PlatformName, state: RateLimitState, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        // Remove from queue on timeout
        const idx = state.queue.findIndex((q) => q.timeoutId === timeoutId);
        if (idx !== -1) state.queue.splice(idx, 1);
        this.totalThrottled.set(platform, (this.totalThrottled.get(platform) || 0) + 1);
        reject(new Error(`Rate limit wait timeout for ${platform} after ${timeoutMs}ms`));
      }, timeoutMs);

      state.queue.push({ resolve, reject, timeoutId });
    });
  }

  // ============================================================
  // Process queue when slots become available
  // ============================================================
  private processQueue(platform: PlatformName, state: RateLimitState): void {
    const rule = this.getRule(platform);
    const now = Date.now();

    // Clean expired timestamps
    state.timestamps = state.timestamps.filter((t) => now - t < rule.windowMs);

    while (state.queue.length > 0) {
      // Check if we can process more requests
      if (state.timestamps.length >= rule.maxRequests) break;
      if (rule.maxConcurrent && state.concurrentCount >= rule.maxConcurrent) break;

      const next = state.queue.shift();
      if (next) {
        clearTimeout(next.timeoutId);
        state.timestamps.push(Date.now());
        state.concurrentCount++;
        this.totalRequests.set(platform, (this.totalRequests.get(platform) || 0) + 1);
        next.resolve();
      }
    }
  }

  // ============================================================
  // Get current stats for a platform
  // ============================================================
  getStats(platform: PlatformName): {
    currentLoad: number;
    remainingRequests: number;
    queueSize: number;
    totalRequests: number;
    totalThrottled: number;
    resetTime: Date;
  } {
    const state = this.states.get(platform);
    const rule = this.getRule(platform);
    const now = Date.now();

    if (!state) {
      return {
        currentLoad: 0,
        remainingRequests: rule.maxRequests,
        queueSize: 0,
        totalRequests: 0,
        totalThrottled: 0,
        resetTime: new Date(now + rule.windowMs),
      };
    }

    // Clean expired
    state.timestamps = state.timestamps.filter((t) => now - t < rule.windowMs);

    const oldestTimestamp = state.timestamps.length > 0 ? state.timestamps[0] : now;
    return {
      currentLoad: state.concurrentCount,
      remainingRequests: Math.max(0, rule.maxRequests - state.timestamps.length),
      queueSize: state.queue.length,
      totalRequests: this.totalRequests.get(platform) || 0,
      totalThrottled: this.totalThrottled.get(platform) || 0,
      resetTime: new Date(oldestTimestamp + rule.windowMs),
    };
  }

  // ============================================================
  // Get stats for all platforms
  // ============================================================
  getAllStats(): Record<PlatformName, any> {
    const stats: any = {};
    for (const platform of Object.keys(DEFAULT_RULES) as PlatformName[]) {
      stats[platform] = this.getStats(platform);
    }
    return stats;
  }

  // ============================================================
  // Reset rate limiter for a platform
  // ============================================================
  reset(platform: PlatformName): void {
    const state = this.states.get(platform);
    if (state) {
      // Reject all queued requests
      for (const item of state.queue) {
        clearTimeout(item.timeoutId);
        item.reject(new Error(`Rate limiter reset for ${platform}`));
      }
      state.timestamps = [];
      state.concurrentCount = 0;
      state.queue = [];
      this.totalRequests.set(platform, 0);
      this.totalThrottled.set(platform, 0);
    }
  }

  // ============================================================
  // Reset all platforms
  // ============================================================
  resetAll(): void {
    for (const platform of Object.keys(DEFAULT_RULES) as PlatformName[]) {
      this.reset(platform);
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
