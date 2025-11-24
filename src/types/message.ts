// Message and conversation types

export interface MessageSender {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sender?: MessageSender;
}

export interface ConversationUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  isActive: boolean;
}

export interface ConversationTrade {
  id: string;
  status: string;
  itemOffered: {
    id: string;
    title: string;
    images: Array<{ url: string }>;
  };
  itemRequested: {
    id: string;
    title: string;
    images: Array<{ url: string }>;
  };
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  tradeId: string | null;
  lastMessageAt: Date | null;
  lastMessageContent: string | null;
  lastMessageSender: string | null;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
  otherUser?: ConversationUser;
  trade?: ConversationTrade;
}

// DTOs
export interface SendMessageDto {
  recipientId: string;
  content: string;
  tradeId?: string;
  type?: string;
}

export interface GetMessagesDto {
  page?: number;
  limit?: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}
