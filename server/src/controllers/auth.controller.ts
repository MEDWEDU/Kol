import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';

import { UserModel } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getAuthCookieClearOptions,
  getAuthCookieName,
  getAuthCookieOptions,
} from '../utils/cookies';
import { ok } from '../utils/responses';
import { signAccessToken } from '../utils/jwt';

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password, name, organization, position, bio } = req.body as {
    email: string;
    password: string;
    name?: string;
    organization?: string;
    position?: string;
    bio?: string;
  };

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await UserModel.findOne({ email: normalizedEmail });
  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const avatarUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const user = await UserModel.create({
    email: normalizedEmail,
    passwordHash,
    name: name ?? '',
    organization: organization ?? '',
    position: position ?? '',
    bio: bio ?? '',
    avatarUrl,
  });

  const token = signAccessToken(user.id);

  res.cookie(getAuthCookieName(), token, getAuthCookieOptions());

  ok(res, { user }, 201);
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({ email: normalizedEmail }).select(
    '+passwordHash',
  );

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const okPassword = await bcrypt.compare(password, user.passwordHash);
  if (!okPassword) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = signAccessToken(user.id);

  res.cookie(getAuthCookieName(), token, getAuthCookieOptions());

  ok(res, { user });
});

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(getAuthCookieName(), getAuthCookieClearOptions());
  ok(res, { ok: true });
};

export const session: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const user = await UserModel.findById(req.auth.userId);
  if (!user) throw new HttpError(401, 'Not authenticated');

  ok(res, { user });
});

export const refresh: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const user = await UserModel.findById(req.auth.userId);
  if (!user) throw new HttpError(401, 'Not authenticated');

  const token = signAccessToken(user.id);
  res.cookie(getAuthCookieName(), token, getAuthCookieOptions());

  ok(res, { user });
});
