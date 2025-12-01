/**
 * GDPR API Client Tests
 */

import type {
  DataExportRequest,
  DeletionRequest,
  GDPRStatus,
  RequestDeletionDto,
} from "@/types/gdpr";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as gdprApi from "./gdpr";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("GDPR API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGDPRStatus: GDPRStatus = {
    dataExportRequests: [],
    canRequestDeletion: true,
  };

  const mockExportRequest: DataExportRequest = {
    id: "export-1",
    userId: "user-1",
    status: "PENDING",
    requestedAt: "2024-01-01T00:00:00Z",
  };

  const mockDeletionRequest: DeletionRequest = {
    id: "deletion-1",
    userId: "user-1",
    reason: "No longer need account",
    requestedAt: "2024-01-01T00:00:00Z",
    scheduledFor: "2024-01-31T00:00:00Z",
    status: "PENDING",
  };

  describe("getGDPRStatus", () => {
    it("should fetch GDPR compliance status", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockGDPRStatus,
      } as AxiosResponse);

      const result = await gdprApi.getGDPRStatus();

      expect(api.get).toHaveBeenCalledWith("/gdpr/status");
      expect(result).toEqual(mockGDPRStatus);
    });

    it("should show active export request", async () => {
      const statusWithExport: GDPRStatus = {
        ...mockGDPRStatus,
        dataExportRequests: [mockExportRequest],
      };

      vi.mocked(api.get).mockResolvedValue({
        data: statusWithExport,
      } as AxiosResponse);

      const result = await gdprApi.getGDPRStatus();

      expect(result.dataExportRequests).toHaveLength(1);
      expect(result.dataExportRequests[0].status).toBe("PENDING");
    });
  });

  describe("requestDataExport", () => {
    it("should request data export", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: mockExportRequest,
      } as AxiosResponse);

      const result = await gdprApi.requestDataExport();

      expect(api.post).toHaveBeenCalledWith("/gdpr/export");
      expect(result).toEqual(mockExportRequest);
    });
  });

  describe("getDataExportStatus", () => {
    it("should fetch export request status", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockExportRequest,
      } as AxiosResponse);

      const result = await gdprApi.getDataExportStatus("export-1");

      expect(api.get).toHaveBeenCalledWith("/gdpr/export/export-1");
      expect(result).toEqual(mockExportRequest);
    });

    it("should show completed export", async () => {
      const completedExport: DataExportRequest = {
        ...mockExportRequest,
        status: "COMPLETED",
        completedAt: "2024-01-01T12:00:00Z",
        expiresAt: "2024-01-08T12:00:00Z",
      };

      vi.mocked(api.get).mockResolvedValue({
        data: completedExport,
      } as AxiosResponse);

      const result = await gdprApi.getDataExportStatus("export-1");

      expect(result.status).toBe("COMPLETED");
      expect(result.completedAt).toBeDefined();
    });
  });

  describe("downloadExportedData", () => {
    it("should download exported data as blob", async () => {
      const mockBlob = new Blob(["test data"], { type: "application/zip" });

      vi.mocked(api.get).mockResolvedValue({
        data: mockBlob,
      } as AxiosResponse);

      const result = await gdprApi.downloadExportedData("export-1");

      expect(api.get).toHaveBeenCalledWith("/gdpr/export/export-1/download", {
        responseType: "blob",
      });
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe("requestDeletion", () => {
    it("should request account deletion without reason", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: mockDeletionRequest,
      } as AxiosResponse);

      const result = await gdprApi.requestDeletion();

      expect(api.post).toHaveBeenCalledWith("/gdpr/deletion", undefined);
      expect(result).toEqual(mockDeletionRequest);
    });

    it("should request account deletion with reason", async () => {
      const deletionDto: RequestDeletionDto = {
        reason: "Privacy concerns",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockDeletionRequest,
      } as AxiosResponse);

      const result = await gdprApi.requestDeletion(deletionDto);

      expect(api.post).toHaveBeenCalledWith("/gdpr/deletion", deletionDto);
      expect(result).toEqual(mockDeletionRequest);
    });
  });

  describe("cancelDeletion", () => {
    it("should cancel deletion request", async () => {
      vi.mocked(api.delete).mockResolvedValue({} as AxiosResponse);

      await gdprApi.cancelDeletion();

      expect(api.delete).toHaveBeenCalledWith("/gdpr/deletion");
    });
  });

  describe("getDeletionStatus", () => {
    it("should fetch deletion request status", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockDeletionRequest,
      } as AxiosResponse);

      const result = await gdprApi.getDeletionStatus();

      expect(api.get).toHaveBeenCalledWith("/gdpr/deletion");
      expect(result).toEqual(mockDeletionRequest);
    });

    it("should return null when no deletion request exists", async () => {
      vi.mocked(api.get).mockRejectedValue(new Error("Not found"));

      const result = await gdprApi.getDeletionStatus();

      expect(api.get).toHaveBeenCalledWith("/gdpr/deletion");
      expect(result).toBeNull();
    });
  });
});
