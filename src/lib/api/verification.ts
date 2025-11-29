/**
 * Verification API Client
 *
 * API functions for identity verification.
 * Handles document submission and verification status.
 */

import type {
  ReviewVerificationDto,
  SubmitVerificationDto,
  VerificationRequest,
} from "@/types/verification";
import { api } from "../api";

/**
 * Get current user's verification status
 */
export async function getMyVerification(): Promise<VerificationRequest | null> {
  try {
    const response = await api.get<VerificationRequest>("/verification/me");
    return response.data;
  } catch {
    // Return null if no verification request exists
    return null;
  }
}

/**
 * Submit a verification request
 */
export async function submitVerification(
  data: SubmitVerificationDto,
): Promise<VerificationRequest> {
  const response = await api.post<VerificationRequest>("/verification", data);
  return response.data;
}

/**
 * Cancel a pending verification request
 */
export async function cancelVerification(): Promise<void> {
  await api.delete("/verification/me");
}

/**
 * Get all verification requests (admin/moderator only)
 */
export async function getAllVerifications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ verifications: VerificationRequest[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/verification/all?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get a specific verification request by ID (admin/moderator only)
 */
export async function getVerificationById(
  verificationId: string,
): Promise<VerificationRequest> {
  const response = await api.get<VerificationRequest>(
    `/verification/${verificationId}`,
  );
  return response.data;
}

/**
 * Review/approve a verification request (admin/moderator only)
 */
export async function approveVerification(
  verificationId: string,
  data: ReviewVerificationDto,
): Promise<VerificationRequest> {
  const response = await api.patch<VerificationRequest>(
    `/verification/admin/${verificationId}/approve`,
    data,
  );
  return response.data;
}

/**
 * Reject a verification request (admin/moderator only)
 */
export async function rejectVerification(
  verificationId: string,
  data: ReviewVerificationDto,
): Promise<VerificationRequest> {
  const response = await api.patch<VerificationRequest>(
    `/verification/admin/${verificationId}/reject`,
    data,
  );
  return response.data;
}

/**
 * Update internal notes for a verification (admin only)
 */
export async function updateVerificationNotes(
  verificationId: string,
  notes: string,
): Promise<VerificationRequest> {
  const response = await api.patch<VerificationRequest>(
    `/verification/admin/${verificationId}/notes`,
    { notes },
  );
  return response.data;
}
