import type { RequestHandler } from 'express';

import { HttpError } from '../utils/HttpError';
import { getAuthCookieName } from '../utils/cookies';
import { verifyAccessToken } from '../utils/jwt';

export const authGuard: RequestHandler = (req, _res, next) => {
  const cookieName = getAuthCookieName();
  const token = req.cookies?.[cookieName];

  if (!token) {
    return next(new HttpError(401, 'Not authenticated'));
  }

  const payload = verifyAccessToken(token);
  req.auth = { userId: payload.sub };

  next();
};
