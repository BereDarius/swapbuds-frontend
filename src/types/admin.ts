/**
 * Admin Types
 *
 * Type definitions for admin operations (user management, moderation).
 * Matches backend admin module DTOs.
 */

/**
 * User role enum
 */
export enum UserRole {
  USER = "USER",
  MODERATOR = "MODERATOR",
  SUPPORT = "SUPPORT",
  ADMIN = "ADMIN",
}

/**
 * Ban user DTO
 */
export interface BanUserDto {
  reason: string;
}

/**
 * Unban user DTO
 */
export interface UnbanUserDto {
  reason: string;
}

/**
 * Change user role DTO
 */
export interface ChangeUserRoleDto {
  role: UserRole;
  reason: string;
}

/**
 * Get users query DTO (for admin user list)
 */
export interface GetUsersQueryDto {
  role?: UserRole;
  isVerified?: boolean;
  isBanned?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Bulk ban users DTO
 */
export interface BulkBanUsersDto {
  userIds: string[];
  reason: string;
}

/**
 * Bulk unban users DTO
 */
export interface BulkUnbanUsersDto {
  userIds: string[];
  reason: string;
}

/**
 * Bulk change role DTO
 */
export interface BulkChangeRoleDto {
  userIds: string[];
  role: UserRole;
  reason: string;
}

/**
 * Admin action log entry
 */
export interface AdminActionLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  targetType: string; // USER, ITEM, TRADE, etc.
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
