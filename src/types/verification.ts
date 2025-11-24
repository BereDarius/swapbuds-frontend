/**
 * Verification Types
 *
 * Type definitions for identity verification.
 * Matches backend verification module DTOs.
 */

/**
 * Document type enum
 */
export enum DocumentType {
  ID_CARD = "ID_CARD",
  PASSPORT = "PASSPORT",
  DRIVER_LICENSE = "DRIVER_LICENSE",
}

/**
 * Verification status enum
 */
export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

/**
 * Submit verification DTO
 */
export interface SubmitVerificationDto {
  documentType: DocumentType;
  documentImageUrl: string; // Cloudinary URL
}

/**
 * Review verification DTO (admin use)
 */
export interface ReviewVerificationDto {
  expiryDate: string; // Date string
  rejectionReason?: string;
}

/**
 * Verification request entity
 */
export interface VerificationRequest {
  id: string;
  userId: string;
  status: VerificationStatus;
  documentType: DocumentType;
  documentImageUrl: string;
  expiryDate?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}
