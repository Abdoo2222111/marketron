import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const isTest = process.env.NODE_ENV === 'test';

const skip = (_req: Request, _res: Response, next: NextFunction) => next();

export const globalRateLimiter = isTest ? skip : rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'طلبات كثيرة جداً. حاول لاحقاً' },
});

export const authRateLimiter = isTest ? skip : rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة' },
});

export const registerRateLimiter = isTest ? skip : rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'محاولات تسجيل كثيرة. حاول بعد ساعة' },
});

export const aiRateLimiter = isTest ? skip : rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'طلبات الذكاء الاصطناعي كثيرة. حاول لاحقاً' },
});

export const apiRateLimiter = globalRateLimiter;
