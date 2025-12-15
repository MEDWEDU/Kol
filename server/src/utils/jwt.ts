import jwt from 'jsonwebtoken';

import { HttpError } from './HttpError';

export type AccessTokenPayload = {
  sub: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid or expired session');
  }
}
