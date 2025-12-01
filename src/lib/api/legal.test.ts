/**
 * Legal API Client Tests
 */

import type {
  AcceptLegalDocumentDto,
  CookieConsent,
  LegalAcceptanceStatus,
  LegalConsent,
  LegalDocument,
  UpdateCookieConsentDto,
} from "@/types/legal";
import { Language, LegalDocumentType } from "@/types/legal";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as legalApi from "./legal";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("Legal API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLegalDocument: LegalDocument = {
    id: "doc-1",
    type: LegalDocumentType.TERMS_OF_SERVICE,
    version: "1.0.0",
    content: "Terms of Service content",
    title: "Terms of Service",
    summary: "Terms summary",
    effectiveAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockConsent: LegalConsent = {
    id: "consent-1",
    userId: "user-1",
    documentType: LegalDocumentType.TERMS_OF_SERVICE,
    version: "1.0.0",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    acceptedAt: "2024-01-01T00:00:00Z",
  };

  const mockCookieConsent: CookieConsent = {
    essential: true,
    functional: true,
    analytics: false,
    marketing: false,
  };

  describe("getActiveLegalDocument", () => {
    it("should fetch active legal document in English by default", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockLegalDocument,
      } as AxiosResponse);

      const result = await legalApi.getActiveLegalDocument(
        LegalDocumentType.TERMS_OF_SERVICE,
      );

      expect(api.get).toHaveBeenCalledWith(
        "/legal/documents/TERMS_OF_SERVICE?lang=en",
      );
      expect(result).toEqual(mockLegalDocument);
    });

    it("should fetch active legal document in specified language", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockLegalDocument,
      } as AxiosResponse);

      const result = await legalApi.getActiveLegalDocument(
        LegalDocumentType.PRIVACY_POLICY,
        Language.RO,
      );

      expect(api.get).toHaveBeenCalledWith(
        "/legal/documents/PRIVACY_POLICY?lang=ro",
      );
      expect(result).toEqual(mockLegalDocument);
    });
  });

  describe("getLegalDocumentByVersion", () => {
    it("should fetch specific version of legal document", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockLegalDocument,
      } as AxiosResponse);

      const result = await legalApi.getLegalDocumentByVersion(
        LegalDocumentType.TERMS_OF_SERVICE,
        "1.0.0",
        Language.EN,
      );

      expect(api.get).toHaveBeenCalledWith(
        "/legal/documents/TERMS_OF_SERVICE/version/1.0.0?lang=en",
      );
      expect(result).toEqual(mockLegalDocument);
    });
  });

  describe("listLegalDocumentVersions", () => {
    it("should fetch all versions of a document type", async () => {
      const versions = [mockLegalDocument];

      vi.mocked(api.get).mockResolvedValue({
        data: versions,
      } as AxiosResponse);

      const result = await legalApi.listLegalDocumentVersions(
        LegalDocumentType.TERMS_OF_SERVICE,
      );

      expect(api.get).toHaveBeenCalledWith(
        "/legal/documents/TERMS_OF_SERVICE/versions",
      );
      expect(result).toEqual(versions);
    });
  });

  describe("acceptLegalDocument", () => {
    it("should accept a legal document", async () => {
      const acceptDto: AcceptLegalDocumentDto = {
        documentType: LegalDocumentType.TERMS_OF_SERVICE,
        version: "1.0.0",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockConsent,
      } as AxiosResponse);

      const result = await legalApi.acceptLegalDocument(acceptDto);

      expect(api.post).toHaveBeenCalledWith("/legal/accept", acceptDto);
      expect(result).toEqual(mockConsent);
    });
  });

  describe("getUserConsents", () => {
    it("should fetch all user consents", async () => {
      const consents = [mockConsent];

      vi.mocked(api.get).mockResolvedValue({
        data: consents,
      } as AxiosResponse);

      const result = await legalApi.getUserConsents();

      expect(api.get).toHaveBeenCalledWith("/legal/consents");
      expect(result).toEqual(consents);
    });
  });

  describe("checkLegalAcceptanceRequired", () => {
    it("should check if legal acceptance is required", async () => {
      const status: LegalAcceptanceStatus = {
        tosRequired: false,
        privacyRequired: false,
        currentTosVersion: "1.0.0",
        currentPrivacyVersion: "1.0.0",
        userTosVersion: "1.0.0",
        userPrivacyVersion: "1.0.0",
      };

      vi.mocked(api.get).mockResolvedValue({
        data: status,
      } as AxiosResponse);

      const result = await legalApi.checkLegalAcceptanceRequired();

      expect(api.get).toHaveBeenCalledWith("/legal/acceptance-required");
      expect(result).toEqual(status);
    });

    it("should indicate when acceptance is required", async () => {
      const status: LegalAcceptanceStatus = {
        tosRequired: true,
        privacyRequired: true,
        currentTosVersion: "2.0.0",
        currentPrivacyVersion: "2.0.0",
        userTosVersion: "1.0.0",
        userPrivacyVersion: "1.0.0",
      };

      vi.mocked(api.get).mockResolvedValue({
        data: status,
      } as AxiosResponse);

      const result = await legalApi.checkLegalAcceptanceRequired();

      expect(result.tosRequired).toBe(true);
      expect(result.privacyRequired).toBe(true);
    });
  });

  describe("updateCookieConsent", () => {
    it("should update cookie consent preferences", async () => {
      const consentDto: UpdateCookieConsentDto = {
        essential: true,
        functional: true,
        analytics: true,
        marketing: false,
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockCookieConsent,
      } as AxiosResponse);

      const result = await legalApi.updateCookieConsent(consentDto);

      expect(api.post).toHaveBeenCalledWith(
        "/legal/cookie-consent",
        consentDto,
      );
      expect(result).toEqual(mockCookieConsent);
    });
  });

  describe("getCookieConsent", () => {
    it("should fetch current cookie consent", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockCookieConsent,
      } as AxiosResponse);

      const result = await legalApi.getCookieConsent();

      expect(api.get).toHaveBeenCalledWith("/legal/cookie-consent");
      expect(result).toEqual(mockCookieConsent);
    });
  });

  describe("Admin functions", () => {
    it("should create a new legal document", async () => {
      const docData = {
        type: LegalDocumentType.TERMS_OF_SERVICE,
        version: "2.0.0",
        contentEn: "Updated terms",
        contentRo: "Termeni actualizați",
        effectiveFrom: "2024-02-01T00:00:00Z",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockLegalDocument,
      } as AxiosResponse);

      const result = await legalApi.createLegalDocument(docData);

      expect(api.post).toHaveBeenCalledWith("/legal/documents", docData);
      expect(result).toEqual(mockLegalDocument);
    });

    it("should set active document version", async () => {
      vi.mocked(api.put).mockResolvedValue({
        data: mockLegalDocument,
      } as AxiosResponse);

      const result = await legalApi.setActiveLegalDocumentVersion(
        LegalDocumentType.TERMS_OF_SERVICE,
        "2.0.0",
      );

      expect(api.put).toHaveBeenCalledWith(
        "/legal/documents/TERMS_OF_SERVICE/version/2.0.0/activate",
      );
      expect(result).toEqual(mockLegalDocument);
    });
  });
});
