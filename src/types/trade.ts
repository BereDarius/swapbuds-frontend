/**
 * Trade Types and Interfaces
 *
 * Type definitions for trades, trade status, and related DTOs.
 * Matches backend Prisma schema and API contracts.
 */

import type { DeliveryMethod } from "./item";

/**
 * Trade status enum
 */
export enum TradeStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  EXPIRED = "EXPIRED",
}

/**
 * Trade item summary (minimal item data in trade context)
 */
export interface TradeItem {
  id: string;
  title: string;
  images: string[]; // Array of image URLs
}

/**
 * Trade participant summary (minimal user data)
 */
export interface TradeParticipant {
  id: string;
  username: string;
  avatarUrl: string | null;
  reputationScore: number;
  isVerified: boolean;
}

/**
 * Trade entity (supports both single and multi-item trades)
 */
export interface Trade {
  id: string;
  status: TradeStatus;
  proposer: TradeParticipant;
  responder: TradeParticipant;

  // Multi-item trade fields (new format)
  itemsOffered?: TradeItem[];
  itemsRequested?: TradeItem[];

  // Single-item trade fields (legacy format for backward compatibility)
  itemOffered?: TradeItem;
  itemRequested?: TradeItem;

  message: string | null;
  deliveryMethod?: DeliveryMethod;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  expiresAt: string | null;
}

/**
 * Create trade DTO (single-item format)
 */
export interface CreateTradeDto {
  itemOfferedId: string; // Item proposer offers
  itemRequestedId: string; // Item proposer wants
  deliveryMethod: DeliveryMethod;
  message?: string;
}

/**
 * Create multi-item trade DTO
 */
export interface CreateMultiItemTradeDto {
  itemsOfferedIds: string[]; // Items proposer offers
  itemsRequestedIds: string[]; // Items proposer wants
  deliveryMethod: DeliveryMethod;
  message?: string;
}

/**
 * Trade filters for listing/search
 */
export interface TradeFilters {
  status?: TradeStatus;
  direction?: "sent" | "received"; // Sent by user or received by user
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated trades response
 */
export interface PaginatedTradesResponse {
  trades: Trade[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Trade status display info
 */
export const TRADE_STATUS_INFO: Record<
  TradeStatus,
  { label: string; description: string; color: string }
> = {
  [TradeStatus.PENDING]: {
    label: "Pending",
    description: "Awaiting response",
    color: "yellow",
  },
  [TradeStatus.ACCEPTED]: {
    label: "Accepted",
    description: "Trade accepted, ready to exchange",
    color: "green",
  },
  [TradeStatus.REJECTED]: {
    label: "Rejected",
    description: "Trade was declined",
    color: "red",
  },
  [TradeStatus.CANCELLED]: {
    label: "Cancelled",
    description: "Trade was cancelled by proposer",
    color: "gray",
  },
  [TradeStatus.COMPLETED]: {
    label: "Completed",
    description: "Trade successfully completed",
    color: "blue",
  },
  [TradeStatus.EXPIRED]: {
    label: "Expired",
    description: "Trade offer expired",
    color: "gray",
  },
};
