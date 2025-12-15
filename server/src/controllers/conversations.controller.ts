import type { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { ConversationModel, MessageModel } from '../models';
import { HttpError } from '../utils/HttpError';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/responses';

export const listConversations: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const conversations = await ConversationModel.find({
    participantIds: req.auth.userId,
  })
    .sort({ updatedAt: -1 })
    .lean();

  ok(res, { conversations });
});

export const startConversation: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const { participantId } = req.body as { participantId: string };

  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw new HttpError(400, 'Invalid participant ID');
  }

  if (participantId === req.auth.userId) {
    throw new HttpError(400, 'Cannot start conversation with yourself');
  }

  const sortedIds = [req.auth.userId, participantId].sort();

  let conversation = await ConversationModel.findOne({
    participantIds: { $all: sortedIds },
  });

  if (!conversation) {
    conversation = await ConversationModel.create({
      participantIds: sortedIds,
    });
  }

  ok(res, { conversation }, conversation ? 200 : 201);
});

export const getConversationMessages: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const { conversationId } = req.params;
  const { page = '0', limit = '50' } = req.query;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new HttpError(400, 'Invalid conversation ID');
  }

  const pageNum = Math.max(0, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = pageNum * limitNum;

  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    throw new HttpError(404, 'Conversation not found');
  }

  if (!conversation.participantIds.includes(req.auth.userId)) {
    throw new HttpError(403, 'Not a participant in this conversation');
  }

  const messages = await MessageModel.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await MessageModel.countDocuments({ conversationId });

  ok(res, {
    messages: messages.reverse(),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

export const markMessagesAsRead: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.auth?.userId) throw new HttpError(401, 'Not authenticated');

  const { conversationId } = req.body as { conversationId: string };

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new HttpError(400, 'Invalid conversation ID');
  }

  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    throw new HttpError(404, 'Conversation not found');
  }

  if (!conversation.participantIds.includes(req.auth.userId)) {
    throw new HttpError(403, 'Not a participant in this conversation');
  }

  const result = await MessageModel.updateMany(
    {
      conversationId,
      recipientId: req.auth.userId,
      isRead: false,
    },
    { $set: { isRead: true } },
  );

  ok(res, { modifiedCount: result.modifiedCount });
});
