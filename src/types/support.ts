/**
 * Support Types
 *
 * Type definitions for support tickets and live chat.
 * Matches backend support module DTOs.
 */

/**
 * Support priority enum
 */
export enum SupportPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

/**
 * Support chat status enum
 */
export enum SupportChatStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  WAITING = "WAITING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

/**
 * Create support chat DTO
 */
export interface CreateChatDto {
  subject: string;
  priority?: SupportPriority; // default MEDIUM
  initialMessage: string;
}

/**
 * Send support message DTO
 */
export interface SendSupportMessageDto {
  message: string;
}

/**
 * Resolve support chat DTO
 */
export interface ResolveChatDto {
  resolution: string;
}

/**
 * Support message author
 */
export interface SupportMessageAuthor {
  id: string;
  username?: string;
  role: string; // USER, SUPPORT, ADMIN
}

/**
 * Support message entity
 */
export interface SupportMessage {
  id: string;
  chatId: string;
  authorId: string;
  author: SupportMessageAuthor;
  message: string;
  isInternal: boolean; // Internal notes visible only to support staff
  createdAt: string;
}

/**
 * Support chat entity
 */
export interface SupportChat {
  id: string;
  userId: string;
  subject: string;
  priority: SupportPriority;
  status: SupportChatStatus;
  assignedTo?: string;
  resolution?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}
