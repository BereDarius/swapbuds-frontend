/**
 * Type Definitions Index
 *
 * Central export point for all TypeScript type definitions.
 * Import types from this file for cleaner imports:
 *
 * @example
 * import { User, Item, Trade } from '@/types';
 */

// Auth types
export * from "./auth";

// User types
export * from "./user";

// Item types
export * from "./item";

// Trade types
export * from "./trade";

// Message types
export * from "./message";

// Notification types
export * from "./notification";

// Review types
export * from "./review";

// Comment types
export * from "./comment";

// Dispute types
export * from "./dispute";

// Admin types
export * from "./admin";

// Moderation types
export * from "./moderation";

// Support types - explicit exports to avoid conflicts
export type {
  CreateChatDto,
  ResolveChatDto,
  SendSupportMessageDto,
  SupportChat,
  SupportChatStatus,
  SupportMessage,
  SupportMessageAuthor,
  SupportPriority,
} from "./support";

// Verification types
export * from "./verification";

// GDPR types
export * from "./gdpr";

// Legal types
export * from "./legal";
