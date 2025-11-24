/**
 * Dispute Types
 *
 * Type definitions for trade disputes and resolution.
 * Matches backend disputes module DTOs.
 */

/**
 * Dispute reason enum
 */
export enum DisputeReason {
  ITEM_NOT_AS_DESCRIBED = "ITEM_NOT_AS_DESCRIBED",
  ITEM_NOT_RECEIVED = "ITEM_NOT_RECEIVED",
  ITEM_DAMAGED = "ITEM_DAMAGED",
  WRONG_ITEM_SENT = "WRONG_ITEM_SENT",
  COMMUNICATION_ISSUES = "COMMUNICATION_ISSUES",
  SAFETY_CONCERNS = "SAFETY_CONCERNS",
  OTHER = "OTHER",
}

/**
 * Dispute status enum
 */
export enum DisputeStatus {
  OPEN = "OPEN",
  UNDER_REVIEW = "UNDER_REVIEW",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

/**
 * Create dispute DTO
 */
export interface CreateDisputeDto {
  tradeId: string;
  respondentId: string;
  reason: DisputeReason;
  description: string; // max 2000 chars
}

/**
 * Resolve dispute DTO
 */
export interface ResolveDisputeDto {
  resolution: string; // 10-2000 chars
  internalNotes: string; // 10-2000 chars
}

/**
 * Dispute participant (minimal user data)
 */
export interface DisputeParticipant {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Dispute entity
 */
export interface Dispute {
  id: string;
  tradeId: string;
  claimantId: string;
  respondentId: string;
  claimant: DisputeParticipant;
  respondent: DisputeParticipant;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  internalNotes?: string;
  resolvedBy?: string;
  resolvedById?: string;
  openedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
