import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'marketron-access-secret-dev';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'marketron-refresh-secret-dev';
const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens(payload: { userId: string; email: string; role: string }) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies.get('accessToken')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 }), user: null };
  }
  return { error: null, user: payload };
}

const FB_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';

export function facebookUrl(path: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams({ access_token: FB_TOKEN, ...params });
  return `https://graph.facebook.com/v22.0/${path}?${search}`;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}
