import { http } from './http';
import type { Conversation, Message, User } from '../types';

export const listConversations = async (): Promise<Conversation[]> => {
  const { data } = await http.get<{ conversations: Conversation[] }>('/conversations');
  return data.conversations;
};

export const startConversation = async (participantId: string): Promise<Conversation> => {
  const { data } = await http.post<{ conversation: Conversation }>('/conversations', {
    participantId,
  });
  return data.conversation;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await http.get<{ messages: Message[] }>(
    `/conversations/${conversationId}/messages`,
  );
  return data.messages;
};

export const markMessagesRead = async (
  conversationId: string,
  messageIds?: string[],
): Promise<void> => {
  await http.patch(`/conversations/${conversationId}/read`, { messageIds });
};

export const searchUsers = async (query: string): Promise<User[]> => {
  const { data } = await http.get<{ users: User[] }>('/users/search', {
    params: { query },
  });
  return data.users;
};
