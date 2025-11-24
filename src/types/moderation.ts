/**
 * Moderation Types
 *
 * Type definitions for content moderation and flagging.
 * Matches backend moderation module DTOs.
 */

/**
 * Bulk approve flags DTO
 */
export interface BulkApproveFlagsDto {
  flagIds: string[];
  reason: string;
}

/**
 * Bulk reject flags DTO
 */
export interface BulkRejectFlagsDto {
  flagIds: string[];
  reason: string;
}

/**
 * Bulk remove flags DTO
 */
export interface BulkRemoveFlagsDto {
  flagIds: string[];
  reason: string;
}

/**
 * Flag reason enum
 */
export enum FlagReason {
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  SPAM = "SPAM",
  HARASSMENT = "HARASSMENT",
  MISLEADING_INFORMATION = "MISLEADING_INFORMATION",
  COPYRIGHT_VIOLATION = "COPYRIGHT_VIOLATION",
  PROHIBITED_ITEM = "PROHIBITED_ITEM",
  OTHER = "OTHER",
}

/**
 * Flag status enum
 */
export enum FlagStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  REMOVED = "REMOVED",
}

/**
 * Content flag entity
 */
export interface ContentFlag {
  id: string;
  contentType: string; // ITEM, COMMENT, USER, MESSAGE
  contentId: string;
  reporterId: string;
  reason: FlagReason;
  description?: string;
  status: FlagStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}
