import jwt from 'jsonwebtoken';
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
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload: JwtPayload | JwtPayloadWithId): string => {
  const secret = (config.jwt.refreshSecret || 'default-refresh-secret') as jwt.Secret;
  const expiresIn = (config.jwt.refreshExpiresIn || '7d') as any;
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret as jwt.Secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret as jwt.Secret) as JwtPayload;
};

export const generateTokenPair = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const generateResetToken = (payload: JwtPayload) => {
  return {
    resetToken: generateAccessToken(payload),
  };
};
