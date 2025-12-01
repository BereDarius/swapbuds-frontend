/**
 * Trades API Client
 *
 * Functions for interacting with the trades API endpoints.
 */

import type {
  CreateMultiItemTradeDto,
  CreateTradeDto,
  PaginatedTradesResponse,
  Trade,
  TradeFilters,
} from "@/types/trade";
import api from "../api";

/**
 * Create a new trade proposal (single-item)
 */
export async function createTrade(data: CreateTradeDto): Promise<Trade> {
  const response = await api.post<Trade>("/trades", data);
  return response.data;
}

/**
 * Create a new multi-item trade proposal
 */
export async function createMultiItemTrade(
  data: CreateMultiItemTradeDto
): Promise<Trade> {
  const response = await api.post<Trade>("/trades", data);
  return response.data;
}

/**
 * Get all trades for the current user
 * Note: Direction filtering is handled client-side in the component since backend doesn't support it
 */
export async function getTrades(
  filters?: TradeFilters
): Promise<PaginatedTradesResponse> {
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  // direction is filtered client-side, not sent to backend
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);
  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const response = await api.get<PaginatedTradesResponse>(
    `/trades/my-trades?${params.toString()}`
  );
  return response.data;
}

/**
 * Get a specific trade by ID
 */
export async function getTradeById(tradeId: string): Promise<Trade> {
  const response = await api.get<Trade>(`/trades/${tradeId}`);
  return response.data;
}

/**
 * Accept a trade proposal
 * Only the responder (person receiving the proposal) can accept
 */
export async function acceptTrade(tradeId: string): Promise<Trade> {
  const response = await api.patch<Trade>(`/trades/${tradeId}/accept`);
  return response.data;
}

/**
 * Reject a trade proposal
 * Only the responder (person receiving the proposal) can reject
 */
export async function rejectTrade(tradeId: string): Promise<Trade> {
  const response = await api.patch<Trade>(`/trades/${tradeId}/reject`);
  return response.data;
}

/**
 * Cancel a trade proposal
 * Only the proposer (person who created the proposal) can cancel
 */
export async function cancelTrade(tradeId: string): Promise<Trade> {
  const response = await api.patch<Trade>(`/trades/${tradeId}/cancel`);
  return response.data;
}

/**
 * Mark a trade as completed
 * Both parties must mark as complete for trade to be fully completed
 */
export async function completeTrade(tradeId: string): Promise<Trade> {
  const response = await api.patch<Trade>(`/trades/${tradeId}/complete`);
  return response.data;
}
