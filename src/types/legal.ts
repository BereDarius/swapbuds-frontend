/**
 * Legal Types
 *
 * Type definitions for legal compliance features including legal documents,
 * user consents, and cookie preferences.
 */

/**
 * Type of legal document
 */
export enum LegalDocumentType {
  TOS = "TOS",
  PRIVACY_POLICY = "PRIVACY_POLICY",
  COOKIE_POLICY = "COOKIE_POLICY",
  COMMUNITY_GUIDELINES = "COMMUNITY_GUIDELINES",
}

/**
 * Language codes for legal documents
 */
export enum Language {
  EN = "en",
  RO = "ro",
}

/**
 * Legal document entity
 */
export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  version: string;
  contentEn: string;
  contentRo: string;
  isActive: boolean;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Legal consent record
 */
export interface LegalConsent {
  id: string;
  userId: string;
  documentType: LegalDocumentType;
  version: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Cookie consent preferences
 */
export interface CookieConsent {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * User legal acceptance status
 */
export interface LegalAcceptanceStatus {
  tosRequired: boolean;
  privacyRequired: boolean;
  currentTosVersion: string | null;
  currentPrivacyVersion: string | null;
  userTosVersion: string | null;
  userPrivacyVersion: string | null;
}

/**
 * DTO for accepting a legal document
 */
export interface AcceptLegalDocumentDto {
  documentType: LegalDocumentType;
  version: string;
}

/**
 * DTO for updating cookie consent
 */
export interface UpdateCookieConsentDto {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

/**
 * Response from legal document fetch
 */
export interface LegalDocumentResponse {
  document: LegalDocument;
}

/**
 * Response from consent operations
 */
export interface ConsentResponse {
  consents: LegalConsent[];
}

/**
 * Response from cookie consent fetch
 */
export interface CookieConsentResponse {
  consent: CookieConsent;
}
