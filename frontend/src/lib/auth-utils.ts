import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
