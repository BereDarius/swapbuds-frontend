/**
 * Disputes API Client
 *
 * API functions for trade dispute management.
 * Handles creating, retrieving, and resolving disputes.
 */

import type {
  CreateDisputeDto,
  Dispute,
  ResolveDisputeDto,
} from "@/types/dispute";
import { api } from "../api";

/**
 * Create a dispute for a trade
 */
export async function createDispute(data: CreateDisputeDto): Promise<Dispute> {
  const response = await api.post<Dispute>("/disputes", data);
  return response.data;
}

/**
 * Get a dispute by ID
 */
export async function getDisputeById(disputeId: string): Promise<Dispute> {
  const response = await api.get<Dispute>(`/disputes/${disputeId}`);
  return response.data;
}

/**
 * Get all disputes for the current user
 */
export async function getMyDisputes(): Promise<Dispute[]> {
  const response = await api.get<Dispute[]>("/disputes/me");
  return response.data;
}

/**
 * Get disputes for a specific trade
 */
export async function getTradeDisputes(tradeId: string): Promise<Dispute[]> {
  const response = await api.get<Dispute[]>(`/disputes/trade/${tradeId}`);
  return response.data;
}

/**
 * Resolve a dispute (admin/moderator only)
 */
export async function resolveDispute(
  disputeId: string,
  data: ResolveDisputeDto,
): Promise<Dispute> {
  const response = await api.patch<Dispute>(
    `/disputes/${disputeId}/resolve`,
    data,
  );
  return response.data;
}

/**
 * Close a dispute (admin/moderator only)
 */
export async function closeDispute(disputeId: string): Promise<Dispute> {
  const response = await api.patch<Dispute>(`/disputes/${disputeId}/close`);
  return response.data;
}
