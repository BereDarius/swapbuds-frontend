/**
 * GDPR Types
 *
 * Type definitions for GDPR compliance (data export, deletion).
 * Matches backend GDPR module DTOs.
 */

/**
 * Request deletion DTO
 */
export interface RequestDeletionDto {
  reason?: string; // max 500 chars
}

/**
 * Data export request entity
 */
export interface DataExportRequest {
  id: string;
  userId: string;
  status: string; // PENDING, PROCESSING, COMPLETED, FAILED
  downloadUrl?: string;
  expiresAt?: string;
  requestedAt: string;
  completedAt?: string;
}

/**
 * Deletion request entity
 */
export interface DeletionRequest {
  id: string;
  userId: string;
  status: string; // PENDING, SCHEDULED, COMPLETED, CANCELLED
  reason?: string;
  scheduledFor: string;
  requestedAt: string;
  completedAt?: string;
}

/**
 * GDPR compliance status
 */
export interface GDPRStatus {
  dataExportRequests: DataExportRequest[];
  deletionRequest?: DeletionRequest;
  canRequestDeletion: boolean;
  deletionScheduledFor?: string;
}
