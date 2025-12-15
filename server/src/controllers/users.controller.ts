import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { UserModel, type UserDocument } from '../models/User';
import { HttpError } from '../utils/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/responses';

export const getMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const user = await UserModel.findById(req.auth.userId);
  if (!user) throw new HttpError(404, 'User not found');

  ok(res, { user });
});

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const userId = req.auth.userId;

  const updates: mongoose.UpdateQuery<UserDocument> = { $set: {} };
  const $set = updates.$set as Partial<UserDocument>;

  const { email, name, organization, position, bio } = req.body as {
    email?: string;
    name?: string;
    organization?: string;
    position?: string;
    bio?: string;
  };

  if (typeof email === 'string') {
    const normalizedEmail = email.trim().toLowerCase();

    const emailOwner = await UserModel.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (emailOwner) {
      throw new HttpError(409, 'Email already in use');
    }

    $set.email = normalizedEmail;
  }

  if (typeof name === 'string') $set.name = name;
  if (typeof organization === 'string') $set.organization = organization;
  if (typeof position === 'string') $set.position = position;
  if (typeof bio === 'string') $set.bio = bio;

  if (req.file) {
    $set.avatarUrl = `/uploads/${req.file.filename}`;
  }

  if (Object.keys($set).length === 0) {
    throw new HttpError(400, 'No updates provided');
  }

  const user = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new HttpError(404, 'User not found');

  ok(res, { user });
});

export const getUserById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid user id');
  }

  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(404, 'User not found');

  ok(res, {
    user: {
      id: user.id,
      name: user.name,
      organization: user.organization,
      position: user.position,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  });
});

export const searchUsers: RequestHandler = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (typeof query !== 'string' || !query) {
    ok(res, { users: [] });
    return;
  }

  // Case-insensitive search by name or email
  const users = await UserModel.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
  })
    .limit(20)
    .lean();

  ok(res, {
    users: users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      organization: u.organization,
      position: u.position,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
    })),
  });
});
