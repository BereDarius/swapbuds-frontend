/**
 * Moderation API Client
 *
 * API functions for content moderation and flag management.
 * Requires MODERATOR or ADMIN role.
 */

import type {
  BulkApproveFlagsDto,
  BulkRejectFlagsDto,
  BulkRemoveFlagsDto,
  ContentFlag,
  FlagReason,
} from "@/types/moderation";
import { api } from "../api";

/**
 * Get all content flags (pending review)
 */
export async function getFlags(params?: {
  status?: string;
  contentType?: string;
  page?: number;
  limit?: number;
}): Promise<{ flags: ContentFlag[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.contentType)
    queryParams.append("contentType", params.contentType);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/moderation/flags?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get a specific flag by ID
 */
export async function getFlagById(flagId: string): Promise<ContentFlag> {
  const response = await api.get<ContentFlag>(`/moderation/flags/${flagId}`);
  return response.data;
}

/**
 * Flag content for moderation
 */
export async function flagContent(data: {
  contentType: string;
  contentId: string;
  reason: FlagReason;
  description?: string;
}): Promise<ContentFlag> {
  const response = await api.post<ContentFlag>("/moderation/flags", data);
  return response.data;
}

/**
 * Approve a flag (take action on flagged content)
 */
export async function approveFlag(
  flagId: string,
  reason: string,
): Promise<ContentFlag> {
  const response = await api.patch<ContentFlag>(
    `/moderation/flags/${flagId}/approve`,
    { reason },
  );
  return response.data;
}

/**
 * Reject a flag (no action needed)
 */
export async function rejectFlag(
  flagId: string,
  reason: string,
): Promise<ContentFlag> {
  const response = await api.patch<ContentFlag>(
    `/moderation/flags/${flagId}/reject`,
    { reason },
  );
  return response.data;
}

/**
 * Remove flagged content
 */
export async function removeFlag(
  flagId: string,
  reason: string,
): Promise<ContentFlag> {
  const response = await api.patch<ContentFlag>(
    `/moderation/flags/${flagId}/remove`,
    { reason },
  );
  return response.data;
}

/**
 * Bulk approve flags
 */
export async function bulkApproveFlags(
  data: BulkApproveFlagsDto,
): Promise<void> {
  await api.post("/moderation/flags/bulk-approve", data);
}

/**
 * Bulk reject flags
 */
export async function bulkRejectFlags(data: BulkRejectFlagsDto): Promise<void> {
  await api.post("/moderation/flags/bulk-reject", data);
}

/**
 * Bulk remove flags
 */
export async function bulkRemoveFlags(data: BulkRemoveFlagsDto): Promise<void> {
  await api.post("/moderation/flags/bulk-remove", data);
}
