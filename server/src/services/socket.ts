import type { Server as HTTPServer } from 'http';
import type { Socket } from 'socket.io';
import { Server } from 'socket.io';

import { verifyAccessToken } from '../utils/jwt';
import { getAuthCookieName } from '../utils/cookies';
import { ConversationModel, MessageModel, UserModel } from '../models';
import { sendMessageNotification, sendPresenceNotification, isWebPushEnabled } from './push.service';

const userPresenceMap = new Map<string, Set<string>>();
let io: Server | null = null;

export function initializeSocketIO(httpServer: HTTPServer) {
  io = new Server(httpServer, {
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

    // Emit presence notification for newly online users
    // Throttle to avoid noise - only notify if this is the first socket connection
    if (userPresenceMap.get(userId)!.size === 1 && isWebPushEnabled() && io) {
      emitPresenceNotification(userId, true).catch(console.warn);
    }

    if (io) {
      io.emit('user:status', { userId, isOnline: true });
    }

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

        if (io) {
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
        }

        // Send push notification if recipient is offline and notifications are enabled
        const recipientOnline = userPresenceMap.has(recipientId);
        if (!recipientOnline && isWebPushEnabled()) {
          try {
            const recipient = await UserModel.findById(recipientId);
            const sender = await UserModel.findById(userId);
            
            if (recipient && sender && recipient.notificationsEnabled) {
              const snippet = text.length > 100 ? `${text.substring(0, 100)}...` : text;
              await sendMessageNotification(
                recipient,
                sender.name || sender.email,
                conversationId,
                snippet,
                false // No attachments for socket messages for now
              );
            }
          } catch (error) {
            console.warn('Failed to send push notification for socket message:', error);
          }
        }
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

          if (io) {
            io.to(`conversation:${conversationId}`).emit('message:read', {
              conversationId,
              messageIds,
              readBy: userId,
            });
          }
        } else {
          await MessageModel.updateMany(
            {
              conversationId,
              recipientId: userId,
              isRead: false,
            },
            { $set: { isRead: true } },
          );

          if (io) {
            io.to(`conversation:${conversationId}`).emit('conversation:allRead', {
              conversationId,
              readBy: userId,
            });
          }
        }
      } catch {
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('user:typing', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user:typing', { userId, conversationId });
    });

    socket.on('user:stoppedTyping', (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user:stoppedTyping', { userId, conversationId });
    });

    socket.on('disconnect', () => {
      const sockets = userPresenceMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userPresenceMap.delete(userId);
          // Emit presence notification for users going offline
          if (isWebPushEnabled()) {
            emitPresenceNotification(userId, false).catch(console.warn);
          }
          if (io) {
            io.emit('user:status', { userId, isOnline: false });
          }
        }
      }
    });
  });

  return io;
}

export function getUserPresenceMap() {
  return userPresenceMap;
}

export function getIO(): Server | null {
  return io;
}

export function isUserOnline(userId: string): boolean {
  return userPresenceMap.has(userId);
}

async function emitPresenceNotification(userId: string, isOnline: boolean) {
  if (!io || !isWebPushEnabled()) return;

  try {
    // Get user's contacts (participants in conversations with this user)
    const conversations = await ConversationModel.find({
      participantIds: userId,
    }).lean();

    const contactsSet = new Set<string>();
    conversations.forEach((conv) => {
      conv.participantIds.forEach((participantId) => {
        if (participantId !== userId) {
          contactsSet.add(participantId);
        }
      });
    });

    // Send presence notifications to all contacts
    for (const contactId of contactsSet) {
      const contact = await UserModel.findById(contactId);
      if (contact && contact.notificationsEnabled && contact.webPushSubscriptions.length > 0) {
        const user = await UserModel.findById(userId);
        if (user) {
          await sendPresenceNotification(contact, user.name || user.email, isOnline);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to send presence notifications:', error);
  }
}
