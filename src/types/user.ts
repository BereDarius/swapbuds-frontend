/**
 * User Types and Interfaces
 *
 * Type definitions for user profiles, statistics, and settings.
 * Matches backend API contracts.
 */

/**
 * User profile (public information)
 */
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  reputationScore: number;
  isVerified: boolean;
  isBanned: boolean;
  role: string;
  createdAt: string;
  itemsCount: number;
  tradesCount: number;
}

/**
 * User statistics
 */
export interface UserStatistics {
  totalTrades: number;
  completedTrades: number;
  cancelledTrades: number;
  averageResponseTime: number;
  successRate: number;
  totalCounterOffers: number;
  pendingAsProposer: number;
  pendingAsResponder: number;
}

/**
 * Update profile DTO
 */
export interface UpdateProfileDto {
  username?: string;
  bio?: string;
  location?: string;
}

/**
 * User settings
 */
export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradeNotifications: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  showEmail: boolean;
  showLocation: boolean;
  language: string;
  timezone: string;
}

/**
 * Update settings DTO
 */
export interface UpdateSettingsDto {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  tradeNotifications?: boolean;
  messageNotifications?: boolean;
  marketingEmails?: boolean;
  profileVisibility?: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  showEmail?: boolean;
  showLocation?: boolean;
  language?: string;
  timezone?: string;
}
