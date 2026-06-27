import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ApiError } from '../utils/apiError';

const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const csrfProtection = (req: Request, _res: Response, next: NextFunction): void => {
  if (SAFE_METHODS.includes(req.method)) return next();

  const hasCustomHeader = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const csrfCookie = req.cookies?.[CSRF_COOKIE];
  const csrfHeader = req.headers[CSRF_HEADER];

  if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) return next();

  // Allow if custom header is present (common for SPA APIs)
  if (hasCustomHeader) return next();

  next(ApiError.forbidden('CSRF validation failed'));
};

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const setCsrfCookie = (res: any): string => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
};
