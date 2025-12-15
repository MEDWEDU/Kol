import type { Server as HTTPServer } from 'http';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { verifyAccessToken } from '../utils/jwt';
import { getAuthCookieName } from '../utils/cookies';
import { ConversationModel, MessageModel } from '../models';

const userPresenceMap = new Map<string, Set<string>>();

export function initializeSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
        : true,
      credentials: true,
      optionsSuccessStatus: 204,
    },
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error('Authentication error'));
    }

    const cookieMap: Record<string, string> = {};
    cookies.split('; ').forEach((cookie) => {
      const [key, value] = cookie.split('=');
      if (key && value) {
        cookieMap[key] = decodeURIComponent(value);
      }
    });

    const cookieName = getAuthCookieName();
    const token = cookieMap[cookieName];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;

    if (!userPresenceMap.has(userId)) {
      userPresenceMap.set(userId, new Set());
    }
    userPresenceMap.get(userId)!.add(socket.id);

    io.emit('user:status', { userId, isOnline: true });

    socket.on('join:conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: string; recipientId: string; text: string }) => {
      try {
        const { conversationId, recipientId, text } = data;

        if (!conversationId || !recipientId || !text) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participantIds.includes(userId)) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        const message = await MessageModel.create({
          conversationId,
          senderId: userId,
          recipientId,
          text,
          attachments: [],
          isRead: false,
        });

        conversation.lastMessage = {
          text,
          senderId: userId,
          createdAt: new Date(),
        };
        await conversation.save();

        io.to(`conversation:${conversationId}`).emit('message:new', {
          id: message.id,
          conversationId,
          senderId: userId,
          recipientId,
          text,
          attachments: [],
          isRead: false,
          createdAt: message.createdAt,
        });
      } catch {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:markRead', async (data: { conversationId: string; messageIds?: string[] }) => {
      try {
        const { conversationId, messageIds } = data;

        if (!conversationId) {
          socket.emit('error', { message: 'Invalid conversation ID' });
          return;
        }

        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participantIds.includes(userId)) {
          socket.emit('error', { message: 'Not a participant in this conversation' });
          return;
        }

        if (messageIds && messageIds.length > 0) {
          await MessageModel.updateMany(
            {
              _id: { $in: messageIds },
              conversationId,
              recipientId: userId,
            },
            { $set: { isRead: true } },
          );

          io.to(`conversation:${conversationId}`).emit('message:read', {
            conversationId,
            messageIds,
            readBy: userId,
          });
        } else {
          await MessageModel.updateMany(
            {
              conversationId,
              recipientId: userId,
              isRead: false,
            },
            { $set: { isRead: true } },
          );

          io.to(`conversation:${conversationId}`).emit('conversation:allRead', {
            conversationId,
            readBy: userId,
          });
        }
      } catch {
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('user:typing', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user:typing', { userId });
    });

    socket.on('user:stoppedTyping', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user:stoppedTyping', { userId });
    });

    socket.on('disconnect', () => {
      const sockets = userPresenceMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userPresenceMap.delete(userId);
          io.emit('user:status', { userId, isOnline: false });
        }
      }
    });
  });

  return io;
}

export function getUserPresenceMap() {
  return userPresenceMap;
}
