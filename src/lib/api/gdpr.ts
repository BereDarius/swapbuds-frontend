/**
 * GDPR API Client
 *
 * API functions for GDPR compliance (data export, deletion).
 * Handles user data export and account deletion requests.
 */

import type {
  DataExportRequest,
  DeletionRequest,
  GDPRStatus,
  RequestDeletionDto,
} from "@/types/gdpr";
import { api } from "../api";

/**
 * Get GDPR compliance status for current user
 */
export async function getGDPRStatus(): Promise<GDPRStatus> {
  const response = await api.get<GDPRStatus>("/gdpr/status");
  return response.data;
}

/**
 * Request data export
 */
export async function requestDataExport(): Promise<DataExportRequest> {
  const response = await api.post<DataExportRequest>("/gdpr/export");
  return response.data;
}

/**
 * Get data export request status
 */
export async function getDataExportStatus(
  exportId: string
): Promise<DataExportRequest> {
  const response = await api.get<DataExportRequest>(`/gdpr/export/${exportId}`);
  return response.data;
}

/**
 * Download exported data
 */
export async function downloadExportedData(exportId: string): Promise<Blob> {
  const response = await api.get(`/gdpr/export/${exportId}/download`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Request account deletion
 */
export async function requestDeletion(
  data?: RequestDeletionDto
): Promise<DeletionRequest> {
  const response = await api.post<DeletionRequest>("/gdpr/deletion", data);
  return response.data;
}

/**
 * Cancel account deletion request
 */
export async function cancelDeletion(): Promise<void> {
  await api.delete("/gdpr/deletion");
}

/**
 * Get deletion request status
 */
export async function getDeletionStatus(): Promise<DeletionRequest | null> {
  try {
    const response = await api.get<DeletionRequest>("/gdpr/deletion");
    return response.data;
  } catch {
    // Return null if no deletion request exists
    return null;
  }
}
