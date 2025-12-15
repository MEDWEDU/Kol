import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { listConversations, getMessages, markMessagesRead } from '../api/chat';
import type { Conversation, Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ChatState {
  socket: Socket | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  onlineUsers: Set<string>;
  typingUsers: Record<string, Set<string>>;
  
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  userId: string | null;

  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  
  fetchConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  deselectConversation: () => void;
  
  sendMessage: (conversationId: string, recipientId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;

  addNewConversation: (conversation: Conversation) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  messages: {},
  activeConversationId: null,
  onlineUsers: new Set(),
  typingUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,
  userId: null,

  connectSocket: (userId: string) => {
    const { socket } = get();
    set({ userId });
    if (socket?.connected) return;

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('user:status', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      set((state) => {
        const newOnlineUsers = new Set(state.onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        return { onlineUsers: newOnlineUsers };
      });
    });

    newSocket.on('message:new', (message: Message) => {
      set((state) => {
        const conversationId = message.conversationId;
        const currentMessages = state.messages[conversationId] || [];
        
        // Check if message already exists (optimistic update)
        if (currentMessages.some((m) => m.id === message.id)) {
          return {
            messages: {
              ...state.messages,
              [conversationId]: currentMessages.map((m) => 
                m.id === message.id ? message : m
              ),
            }
          };
        }

        // Update last message in conversation list
        const updatedConversations = state.conversations.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: {
                text: message.text,
                senderId: message.senderId,
                createdAt: message.createdAt,
              },
              unreadCount: (c.unreadCount || 0) + (message.senderId !== state.userId ? 1 : 0),
            };
          }
          return c;
        });

        // Move conversation to top
        const conversationIndex = updatedConversations.findIndex(c => c.id === conversationId);
        if (conversationIndex > -1) {
          const [conversation] = updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(conversation);
        }

        return {
          messages: {
            ...state.messages,
            [conversationId]: [...currentMessages, message],
          },
          conversations: updatedConversations,
        };
      });
    });

    newSocket.on('message:read', ({ conversationId, messageIds, readBy }: { conversationId: string, messageIds: string[], readBy: string }) => {
      set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        const updatedMessages = currentMessages.map((m) => {
          if (messageIds.includes(m.id)) {
            return { ...m, isRead: true };
          }
          return m;
        });
        return {
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages,
          }
        };
      });
    });

    newSocket.on('conversation:allRead', ({ conversationId, readBy }: { conversationId: string, readBy: string }) => {
       set((state) => {
        const currentMessages = state.messages[conversationId] || [];
        const updatedMessages = currentMessages.map((m) => {
          if (!m.isRead && m.senderId !== readBy) { 
             return { ...m, isRead: true };
          }
           return m;
        });

        const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversationId && readBy === state.userId) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        });
        
        return {
          messages: {
            ...state.messages,
            [conversationId]: updatedMessages,
          },
          conversations: updatedConversations,
        };
      });
    });
    
    newSocket.on('user:typing', ({ userId, conversationId }: { userId: string, conversationId: string }) => {
      set((state) => {
        const currentTyping = state.typingUsers[conversationId] || new Set();
        const newTyping = new Set(currentTyping);
        newTyping.add(userId);
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: newTyping,
          }
        };
      });
    });

    newSocket.on('user:stoppedTyping', ({ userId, conversationId }: { userId: string, conversationId: string }) => {
      set((state) => {
        const currentTyping = state.typingUsers[conversationId];
        if (!currentTyping) return {};
        
        const newTyping = new Set(currentTyping);
        newTyping.delete(userId);
        return {
           typingUsers: {
            ...state.typingUsers,
            [conversationId]: newTyping,
          }
        };
      });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const conversations = await listConversations();
      set({ conversations });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to fetch conversations' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (conversationId: string) => {
    const { socket, activeConversationId } = get();
    
    if (activeConversationId === conversationId) return;

    if (activeConversationId && socket) {
      socket.emit('leave:conversation', activeConversationId);
    }

    set({ activeConversationId: conversationId });
    if (socket) {
      socket.emit('join:conversation', conversationId);
    }

    // Fetch messages
    set({ isLoadingMessages: true });
    try {
      const messages = await getMessages(conversationId);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        }
      }));
      
      // Mark as read immediately? Or wait for user interaction?
      // Usually we mark as read when opening.
      // But we need to know which messages are unread.
      get().markRead(conversationId);
      
    } catch (err) {
       console.error(err);
    } finally {
       set({ isLoadingMessages: false });
    }
  },

  deselectConversation: () => {
    const { socket, activeConversationId } = get();
    if (activeConversationId && socket) {
      socket.emit('leave:conversation', activeConversationId);
    }
    set({ activeConversationId: null });
  },

  sendMessage: (conversationId: string, recipientId: string, text: string) => {
    const { socket } = get();
    if (!socket) return;
    
    // Optimistic update
    // We need a temp ID.
    const tempId = Date.now().toString();
    // We need current user ID... store doesn't have it explicitly, but we can get it from authStore or pass it.
    // Assuming authStore has it. But here we just need to send it.
    
    socket.emit('message:send', { conversationId, recipientId, text });
    
    // We can add optimistic message here if we had the current user ID.
    // For now rely on server echo (latency might be visible).
  },

  markRead: (conversationId: string) => {
    const { socket } = get();
     if (!socket) return;
     socket.emit('message:markRead', { conversationId });
  },
  
  setTyping: (conversationId: string, isTyping: boolean) => {
    const { socket } = get();
    if (!socket) return;
    if (isTyping) {
        socket.emit('user:typing', { conversationId });
    } else {
        socket.emit('user:stoppedTyping', { conversationId });
    }
  },

  addNewConversation: (conversation: Conversation) => {
    set(state => ({
        conversations: [conversation, ...state.conversations]
    }));
  }
}));
