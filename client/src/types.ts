export type User = {
  id: string;
  email: string;
  name: string;
  organization: string;
  position: string;
  bio: string;
  avatarUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
  participants?: User[];
  unreadCount?: number;
};
