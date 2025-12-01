/**
 * Disputes API Client Tests
 */

import type {
  CreateDisputeDto,
  Dispute,
  ResolveDisputeDto,
} from "@/types/dispute";
import { DisputeReason, DisputeStatus } from "@/types/dispute";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as disputesApi from "./disputes";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("Disputes API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDispute: Dispute = {
    id: "dispute-1",
    tradeId: "trade-1",
    claimantId: "user-1",
    respondentId: "user-2",
    claimant: {
      id: "user-1",
      username: "user1",
      avatarUrl: null,
    },
    respondent: {
      id: "user-2",
      username: "user2",
      avatarUrl: null,
    },
    reason: DisputeReason.ITEM_NOT_AS_DESCRIBED,
    description: "The item condition was misrepresented",
    status: DisputeStatus.OPEN,
    openedAt: "2024-01-01T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  describe("createDispute", () => {
    it("should create a new dispute", async () => {
      const createDto: CreateDisputeDto = {
        tradeId: "trade-1",
        respondentId: "user-2",
        reason: DisputeReason.ITEM_NOT_AS_DESCRIBED,
        description: "The item condition was misrepresented",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockDispute,
      } as AxiosResponse);

      const result = await disputesApi.createDispute(createDto);

      expect(api.post).toHaveBeenCalledWith("/disputes", createDto);
      expect(result).toEqual(mockDispute);
    });
  });

  describe("getDisputeById", () => {
    it("should fetch a specific dispute", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockDispute,
      } as AxiosResponse);

      const result = await disputesApi.getDisputeById("dispute-1");

      expect(api.get).toHaveBeenCalledWith("/disputes/dispute-1");
      expect(result).toEqual(mockDispute);
    });
  });

  describe("getMyDisputes", () => {
    it("should fetch all disputes for current user", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockDispute],
      } as AxiosResponse);

      const result = await disputesApi.getMyDisputes();

      expect(api.get).toHaveBeenCalledWith("/disputes/me");
      expect(result).toEqual([mockDispute]);
    });
  });

  describe("getTradeDisputes", () => {
    it("should fetch disputes for a specific trade", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockDispute],
      } as AxiosResponse);

      const result = await disputesApi.getTradeDisputes("trade-1");

      expect(api.get).toHaveBeenCalledWith("/disputes/trade/trade-1");
      expect(result).toEqual([mockDispute]);
    });
  });

  describe("resolveDispute", () => {
    it("should resolve a dispute", async () => {
      const resolveDto: ResolveDisputeDto = {
        resolution: "Refund granted",
        internalNotes: "Admin notes",
      };
      const resolvedDispute = {
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        resolution: "Refund granted",
        resolvedAt: "2024-01-02T00:00:00Z",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: resolvedDispute,
      } as AxiosResponse);

      const result = await disputesApi.resolveDispute("dispute-1", resolveDto);

      expect(api.patch).toHaveBeenCalledWith(
        "/disputes/dispute-1/resolve",
        resolveDto
      );
      expect(result).toEqual(resolvedDispute);
    });
  });

  describe("closeDispute", () => {
    it("should close a dispute", async () => {
      const closedDispute = {
        ...mockDispute,
        status: DisputeStatus.CLOSED,
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: closedDispute,
      } as AxiosResponse);

      const result = await disputesApi.closeDispute("dispute-1");

      expect(api.patch).toHaveBeenCalledWith("/disputes/dispute-1/close");
      expect(result).toEqual(closedDispute);
    });
  });
});
