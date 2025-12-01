/**
 * Verification API Client Tests
 */

import type {
  ReviewVerificationDto,
  SubmitVerificationDto,
  VerificationRequest,
} from "@/types/verification";
import { DocumentType, VerificationStatus } from "@/types/verification";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as verificationApi from "./verification";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Verification API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVerification: VerificationRequest = {
    id: "verify-1",
    userId: "user-1",
    documentType: DocumentType.PASSPORT,
    documentUrlFront: "https://example.com/front.jpg",
    documentUrlBack: "https://example.com/back.jpg",
    selfieUrl: "https://example.com/selfie.jpg",
    status: VerificationStatus.PENDING,
    rejectionReason: undefined,
    notes: undefined,
    reviewedAt: undefined,
    submittedAt: "2024-01-01T00:00:00Z",
  };

  describe("getMyVerification", () => {
    it("should fetch current user's verification status", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockVerification,
      } as AxiosResponse);

      const result = await verificationApi.getMyVerification();

      expect(api.get).toHaveBeenCalledWith("/verification/me");
      expect(result).toEqual(mockVerification);
    });

    it("should return null if no verification exists", async () => {
      vi.mocked(api.get).mockRejectedValue(new Error("Not found"));

      const result = await verificationApi.getMyVerification();

      expect(result).toBeNull();
    });
  });

  describe("submitVerification", () => {
    it("should submit a verification request", async () => {
      const submitDto: SubmitVerificationDto = {
        documentType: DocumentType.PASSPORT,
        documentUrlFront: "https://cloudinary.com/front.jpg",
        documentUrlBack: "https://cloudinary.com/back.jpg",
        selfieUrl: "https://cloudinary.com/selfie.jpg",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockVerification,
      } as AxiosResponse);

      const result = await verificationApi.submitVerification(submitDto);

      expect(api.post).toHaveBeenCalledWith("/verification", submitDto);
      expect(result).toEqual(mockVerification);
    });
  });

  describe("cancelVerification", () => {
    it("should cancel a pending verification request", async () => {
      vi.mocked(api.delete).mockResolvedValue({} as AxiosResponse);

      await verificationApi.cancelVerification();

      expect(api.delete).toHaveBeenCalledWith("/verification/me");
    });
  });

  describe("getAllVerifications", () => {
    it("should fetch all verification requests with filters", async () => {
      const response = {
        verifications: [mockVerification],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await verificationApi.getAllVerifications({
        status: "PENDING",
        page: 1,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/verification/all"),
      );
      expect(result).toEqual(response);
    });

    it("should fetch verifications without parameters", async () => {
      const response = {
        verifications: [mockVerification],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await verificationApi.getAllVerifications();

      expect(api.get).toHaveBeenCalledWith("/verification/all?");
      expect(result).toEqual(response);
    });

    it("should fetch verifications with only status filter", async () => {
      const response = {
        verifications: [mockVerification],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await verificationApi.getAllVerifications({ status: "APPROVED" });

      expect(api.get).toHaveBeenCalledWith("/verification/all?status=APPROVED");
    });

    it("should fetch verifications with page and limit", async () => {
      const response = {
        verifications: [mockVerification],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await verificationApi.getAllVerifications({ page: 2, limit: 20 });

      expect(api.get).toHaveBeenCalledWith("/verification/all?page=2&limit=20");
    });
  });

  describe("getVerificationById", () => {
    it("should fetch a specific verification request", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockVerification,
      } as AxiosResponse);

      const result = await verificationApi.getVerificationById("verify-1");

      expect(api.get).toHaveBeenCalledWith("/verification/verify-1");
      expect(result).toEqual(mockVerification);
    });
  });

  describe("approveVerification", () => {
    it("should approve a verification request", async () => {
      const reviewDto: ReviewVerificationDto = {
        notes: "All documents verified",
      };
      const approvedVerification = {
        ...mockVerification,
        status: VerificationStatus.APPROVED,
        reviewedAt: "2024-01-02T00:00:00Z",
        adminNotes: "All documents verified",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: approvedVerification,
      } as AxiosResponse);

      const result = await verificationApi.approveVerification(
        "verify-1",
        reviewDto,
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/verification/admin/verify-1/approve",
        reviewDto,
      );
      expect(result).toEqual(approvedVerification);
    });
  });

  describe("rejectVerification", () => {
    it("should reject a verification request", async () => {
      const reviewDto: ReviewVerificationDto = {
        notes: "Documents not clear",
      };
      const rejectedVerification = {
        ...mockVerification,
        status: VerificationStatus.REJECTED,
        reviewedAt: "2024-01-02T00:00:00Z",
        rejectionReason: "Documents not clear",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: rejectedVerification,
      } as AxiosResponse);

      const result = await verificationApi.rejectVerification(
        "verify-1",
        reviewDto,
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/verification/admin/verify-1/reject",
        reviewDto,
      );
      expect(result).toEqual(rejectedVerification);
    });
  });

  describe("updateVerificationNotes", () => {
    it("should update verification internal notes", async () => {
      const updatedVerification = {
        ...mockVerification,
        adminNotes: "Additional notes added",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: updatedVerification,
      } as AxiosResponse);

      const result = await verificationApi.updateVerificationNotes(
        "verify-1",
        "Additional notes added",
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/verification/admin/verify-1/notes",
        { notes: "Additional notes added" },
      );
      expect(result).toEqual(updatedVerification);
    });
  });
});
