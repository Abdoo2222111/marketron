import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter (applies to all routes)
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'طلبات كثيرة جداً. حاول لاحقاً',
  },
});

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة',
  },
});

/**
 * Rate limiter for AI endpoints
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'طلبات الذكاء الاصطناعي كثيرة. حاول لاحقاً',
  },
});

// Alias for backward compatibility
export const apiRateLimiter = globalRateLimiter;
