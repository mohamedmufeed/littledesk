import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ userId, email }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId, email }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as { userId: string; email: string };
}
