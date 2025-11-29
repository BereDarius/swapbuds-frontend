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
  documentUrlFront: string; // Cloudinary URL (front of document)
  documentUrlBack?: string; // Cloudinary URL (back of document, optional)
  selfieUrl: string; // Cloudinary URL (live selfie)
}

/**
 * Review verification DTO (admin use)
 */
export interface ReviewVerificationDto {
  dateOfBirth?: string; // Date string
  rejectionReason?: string;
  notes?: string;
}

/**
 * Verification request entity
 */
export interface VerificationRequest {
  id: string;
  userId: string;
  status: VerificationStatus;
  documentType: DocumentType;
  documentUrlFront: string;
  documentUrlBack?: string;
  selfieUrl: string;
  rejectionReason?: string;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
}
