// Message and conversation types

export interface MessageSender {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface MessageVersion {
  id: string;
  content: string;
  editedBy: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  readAt: Date | null;

  // Edit tracking
  isEdited: boolean;
  editedAt: Date | null;

  // Soft delete tracking
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  deleteReason: string | null;

  createdAt: Date;
  updatedAt: Date;
  sender?: MessageSender;

  // Version history (for admins)
  versions?: MessageVersion[];
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

export interface UpdateMessageDto {
  content: string;
}

export interface GetMessagesDto {
  page?: number;
  limit?: number;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}
