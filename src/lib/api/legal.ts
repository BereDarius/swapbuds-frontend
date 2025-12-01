/**
 * Legal API Client
 *
 * API functions for legal compliance features including:
 * - Fetching legal documents (TOS, Privacy Policy, Cookie Policy, Guidelines)
 * - Managing user consents
 * - Cookie consent preferences
 * - Legal acceptance status checking
 */

import {
  AcceptLegalDocumentDto,
  CookieConsent,
  Language,
  LegalAcceptanceStatus,
  LegalConsent,
  LegalDocument,
  LegalDocumentType,
  UpdateCookieConsentDto,
} from "@/types/legal";
import { api } from "../api";

/**
 * Fetch the active version of a legal document
 *
 * @param type - Type of legal document (TOS, PRIVACY_POLICY, etc.)
 * @param language - Language code (en or ro)
 * @returns Promise with the legal document
 *
 * @example
 * ```typescript
 * const tos = await getActiveLegalDocument(LegalDocumentType.TERMS_OF_SERVICE, Language.EN);
 * ```
 */
export const getActiveLegalDocument = async (
  type: LegalDocumentType,
  language: Language = Language.EN
): Promise<LegalDocument> => {
  const url = `/legal/documents/${type}?lang=${language}`;
  const response = await api.get<LegalDocument>(url);
  return response.data;
};

/**
 * Fetch a specific version of a legal document
 *
 * @param type - Type of legal document
 * @param version - Version string (e.g., "1.0.0")
 * @param language - Language code
 * @returns Promise with the legal document
 *
 * @example
 * ```typescript
 * const oldTos = await getLegalDocumentByVersion(
 *   LegalDocumentType.TERMS_OF_SERVICE,
 *   "1.0.0",
 *   Language.EN
 * );
 * ```
 */
export const getLegalDocumentByVersion = async (
  type: LegalDocumentType,
  version: string,
  language: Language = Language.EN
): Promise<LegalDocument> => {
  const response = await api.get<LegalDocument>(
    `/legal/documents/${type}/version/${version}?lang=${language}`
  );
  return response.data;
};

/**
 * Get all versions of a legal document type
 *
 * @param type - Type of legal document
 * @returns Promise with array of all document versions
 *
 * @example
 * ```typescript
 * const allVersions = await listLegalDocumentVersions(LegalDocumentType.TERMS_OF_SERVICE);
 * ```
 */
export const listLegalDocumentVersions = async (
  type: LegalDocumentType
): Promise<LegalDocument[]> => {
  const response = await api.get<LegalDocument[]>(
    `/legal/documents/${type}/versions`
  );
  return response.data;
};

/**
 * Accept a legal document (requires authentication)
 *
 * Records the user's acceptance of a legal document with IP address and user agent.
 *
 * @param data - Document type and version to accept
 * @returns Promise with the consent record
 *
 * @example
 * ```typescript
 * await acceptLegalDocument({
 *   documentType: LegalDocumentType.TERMS_OF_SERVICE,
 *   version: "1.0.0"
 * });
 * ```
 */
export const acceptLegalDocument = async (
  data: AcceptLegalDocumentDto
): Promise<LegalConsent> => {
  const response = await api.post<LegalConsent>("/legal/accept", data);
  return response.data;
};

/**
 * Get all user's legal consents (requires authentication)
 *
 * @returns Promise with array of all user's consent records
 *
 * @example
 * ```typescript
 * const consents = await getUserConsents();
 * ```
 */
export const getUserConsents = async (): Promise<LegalConsent[]> => {
  const response = await api.get<LegalConsent[]>("/legal/consents");
  return response.data;
};

/**
 * Check if user needs to accept any legal documents (requires authentication)
 *
 * Checks if the user has accepted the latest versions of TOS and Privacy Policy.
 *
 * @returns Promise with acceptance status
 *
 * @example
 * ```typescript
 * const status = await checkLegalAcceptanceRequired();
 * if (status.tosRequired || status.privacyRequired) {
 *   // Show acceptance modal
 * }
 * ```
 */
export const checkLegalAcceptanceRequired =
  async (): Promise<LegalAcceptanceStatus> => {
    const response = await api.get<LegalAcceptanceStatus>(
      "/legal/acceptance-required"
    );
    return response.data;
  };

/**
 * Update user's cookie consent preferences (requires authentication)
 *
 * @param consent - Cookie consent preferences
 * @returns Promise with updated cookie consent
 *
 * @example
 * ```typescript
 * await updateCookieConsent({
 *   essential: true,
 *   functional: true,
 *   analytics: true,
 *   marketing: false
 * });
 * ```
 */
export const updateCookieConsent = async (
  consent: UpdateCookieConsentDto
): Promise<CookieConsent> => {
  const response = await api.post<CookieConsent>(
    "/legal/cookie-consent",
    consent
  );
  return response.data;
};

/**
 * Get user's current cookie consent preferences (requires authentication)
 *
 * @returns Promise with current cookie consent settings
 *
 * @example
 * ```typescript
 * const consent = await getCookieConsent();
 * console.log(consent.analytics); // true or false
 * ```
 */
export const getCookieConsent = async (): Promise<CookieConsent> => {
  const response = await api.get<CookieConsent>("/legal/cookie-consent");
  return response.data;
};

/**
 * Admin: Create a new legal document (requires admin authentication)
 *
 * @param data - Legal document data
 * @returns Promise with created document
 */
export const createLegalDocument = async (data: {
  type: LegalDocumentType;
  version: string;
  contentEn: string;
  contentRo: string;
  effectiveFrom: string;
}): Promise<LegalDocument> => {
  const response = await api.post<LegalDocument>("/legal/documents", data);
  return response.data;
};

/**
 * Admin: Set a document version as active (requires admin authentication)
 *
 * @param type - Document type
 * @param version - Version to activate
 * @returns Promise with updated document
 */
export const setActiveLegalDocumentVersion = async (
  type: LegalDocumentType,
  version: string
): Promise<LegalDocument> => {
  const response = await api.put<LegalDocument>(
    `/legal/documents/${type}/version/${version}/activate`
  );
  return response.data;
};
