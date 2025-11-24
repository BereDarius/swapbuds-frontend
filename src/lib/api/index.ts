/**
 * API Client Index
 *
 * Central export point for all API client functions.
 * Import API functions from this file for cleaner imports:
 *
 * @example
 * import { getItems, createTrade, sendMessage } from '@/lib/api';
 */

// Auth API
export * from "./auth";

// User API
export * from "./users";

// Item API
export * from "./items";

// Trade API
export * from "./trades";

// Message API
export * from "./messages";

// Notification API
export * from "./notifications";

// Review API
export * from "./reviews";

// Comment API
export * from "./comments";

// Like API
export * from "./likes";

// Dispute API
export * from "./disputes";

// Admin API
export * from "./admin";

// Moderation API
export * from "./moderation";

// Support API
export * from "./support";

// Verification API
export * from "./verification";

// GDPR API - explicit exports to avoid conflicts
export {
  cancelDeletion,
  downloadExportedData,
  getDataExportStatus,
  getDeletionStatus,
  getGDPRStatus,
  requestDataExport,
  requestDeletion,
} from "./gdpr";

// Legal API
export * from "./legal";
