/**
 * Notification Types
 *
 * Type definitions for notifications and preferences.
 * Matches backend notifications module DTOs.
 */

/**
 * Notification type enum
 */
export enum NotificationType {
  TRADE_PROPOSAL = "TRADE_PROPOSAL",
  TRADE_ACCEPTED = "TRADE_ACCEPTED",
  TRADE_REJECTED = "TRADE_REJECTED",
  TRADE_COMPLETED = "TRADE_COMPLETED",
  TRADE_CANCELLED = "TRADE_CANCELLED",
  COUNTER_OFFER = "COUNTER_OFFER",
  NEW_MESSAGE = "NEW_MESSAGE",
  ITEM_LIKED = "ITEM_LIKED",
  ITEM_COMMENTED = "ITEM_COMMENTED",
  COMMENT_REPLY = "COMMENT_REPLY",
  REVIEW_RECEIVED = "REVIEW_RECEIVED",
  DISPUTE_OPENED = "DISPUTE_OPENED",
  DISPUTE_RESOLVED = "DISPUTE_RESOLVED",
  VERIFICATION_APPROVED = "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED = "VERIFICATION_REJECTED",
  ACCOUNT_WARNING = "ACCOUNT_WARNING",
  SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT",
}

/**
 * Create notification DTO
 */
export interface CreateNotificationDto {
  type: NotificationType;
  recipientId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>; // e.g., { tradeId, itemId }
}

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  id: string;
  userId: string;
  // Email notifications
  emailTradeUpdates: boolean;
  emailMessages: boolean;
  emailComments: boolean;
  emailReviews: boolean;
  emailMarketing: boolean;
  emailSystemUpdates: boolean;
  // Push notifications
  pushTradeUpdates: boolean;
  pushMessages: boolean;
  pushComments: boolean;
  pushReviews: boolean;
  // Frequency settings
  emailDigestFrequency: string; // REALTIME, DAILY, WEEKLY, NEVER
  pushDigestFrequency: string; // REALTIME, HOURLY, DAILY, NEVER
}

/**
 * Update notification preferences DTO
 */
export interface UpdateNotificationPreferencesDto {
  emailTradeUpdates?: boolean;
  emailMessages?: boolean;
  emailComments?: boolean;
  emailReviews?: boolean;
  emailMarketing?: boolean;
  emailSystemUpdates?: boolean;
  pushTradeUpdates?: boolean;
  pushMessages?: boolean;
  pushComments?: boolean;
  pushReviews?: boolean;
  emailDigestFrequency?: string;
  pushDigestFrequency?: string;
}
