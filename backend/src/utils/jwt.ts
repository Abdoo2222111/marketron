import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface JwtPayloadWithId extends JwtPayload {
  id: string;
}

export const generateAccessToken = (payload: JwtPayload | JwtPayloadWithId): string => {
  const secret = (config.jwt.accessSecret || 'default-access-secret') as jwt.Secret;
  const expiresIn = (config.jwt.accessExpiresIn || '15m') as any;
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn });
};

export const generateRefreshToken = (payload: JwtPayload | JwtPayloadWithId): string => {
  const secret = (config.jwt.refreshSecret || 'default-refresh-secret') as jwt.Secret;
  const expiresIn = (config.jwt.refreshExpiresIn || '7d') as any;
  return jwt.sign({ ...payload, type: 'refresh', tokenId: crypto.randomUUID() }, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, config.jwt.accessSecret as jwt.Secret) as any;
  if (decoded.type && decoded.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type');
  }
  return decoded as JwtPayload;
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refreshSecret as jwt.Secret);
};

export const generateTokenPair = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};

export const generateEmailVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
};
