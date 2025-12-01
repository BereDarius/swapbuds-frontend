/**
 * Trades API Client Tests
 */

import { DeliveryMethod } from "@/types/item";
import {
  TradeStatus,
  type CreateMultiItemTradeDto,
  type CreateTradeDto,
  type PaginatedTradesResponse,
  type Trade,
} from "@/types/trade";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import * as tradesApi from "./trades";

// Mock the api module
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Trades API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTrade: Trade = {
    id: "trade-1",
    status: TradeStatus.PENDING,
    proposer: {
      id: "user-1",
      username: "proposer",
      avatarUrl: null,
      reputationScore: 100,
      isVerified: true,
    },
    responder: {
      id: "user-2",
      username: "responder",
      avatarUrl: null,
      reputationScore: 95,
      isVerified: true,
    },
    itemOffered: {
      id: "item-1",
      title: "Laptop",
      images: ["laptop.jpg"],
    },
    itemRequested: {
      id: "item-2",
      title: "Phone",
      images: ["phone.jpg"],
    },
    message: "Trade request",
    deliveryMethod: DeliveryMethod.PHYSICAL,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    completedAt: null,
    expiresAt: "2024-01-08T00:00:00Z",
  };

  describe("createTrade", () => {
    it("should create a new single-item trade", async () => {
      const createDto: CreateTradeDto = {
        itemOfferedId: "item-1",
        itemRequestedId: "item-2",
        deliveryMethod: DeliveryMethod.PHYSICAL,
        message: "Trade request",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockTrade,
      } as AxiosResponse);

      const result = await tradesApi.createTrade(createDto);

      expect(api.post).toHaveBeenCalledWith("/trades", createDto);
      expect(result).toEqual(mockTrade);
    });
  });

  describe("createMultiItemTrade", () => {
    it("should create a new multi-item trade", async () => {
      const createDto: CreateMultiItemTradeDto = {
        itemsOfferedIds: ["item-1", "item-3"],
        itemsRequestedIds: ["item-2", "item-4"],
        deliveryMethod: DeliveryMethod.MAIL,
        message: "Multi-item trade",
      };

      const multiTrade: Trade = {
        ...mockTrade,
        itemsOffered: [
          { id: "item-1", title: "Laptop", images: [] },
          { id: "item-3", title: "Mouse", images: [] },
        ],
        itemsRequested: [
          { id: "item-2", title: "Phone", images: [] },
          { id: "item-4", title: "Tablet", images: [] },
        ],
      };

      vi.mocked(api.post).mockResolvedValue({
        data: multiTrade,
      } as AxiosResponse);

      const result = await tradesApi.createMultiItemTrade(createDto);

      expect(api.post).toHaveBeenCalledWith("/trades", createDto);
      expect(result).toEqual(multiTrade);
    });
  });

  describe("getTrades", () => {
    it("should fetch trades with filters", async () => {
      const mockResponse: PaginatedTradesResponse = {
        trades: [mockTrade],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      const result = await tradesApi.getTrades({
        status: TradeStatus.PENDING,
        page: 1,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/trades/my-trades"),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty filters", async () => {
      const mockResponse: PaginatedTradesResponse = {
        trades: [mockTrade],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      const result = await tradesApi.getTrades();

      expect(api.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getTradeById", () => {
    it("should fetch a specific trade", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockTrade,
      } as AxiosResponse);

      const result = await tradesApi.getTradeById("trade-1");

      expect(api.get).toHaveBeenCalledWith("/trades/trade-1");
      expect(result).toEqual(mockTrade);
    });
  });

  describe("acceptTrade", () => {
    it("should accept a trade proposal", async () => {
      const acceptedTrade = { ...mockTrade, status: TradeStatus.ACCEPTED };

      vi.mocked(api.patch).mockResolvedValue({
        data: acceptedTrade,
      } as AxiosResponse);

      const result = await tradesApi.acceptTrade("trade-1");

      expect(api.patch).toHaveBeenCalledWith("/trades/trade-1/accept");
      expect(result).toEqual(acceptedTrade);
    });
  });

  describe("rejectTrade", () => {
    it("should reject a trade proposal", async () => {
      const rejectedTrade = { ...mockTrade, status: TradeStatus.REJECTED };

      vi.mocked(api.patch).mockResolvedValue({
        data: rejectedTrade,
      } as AxiosResponse);

      const result = await tradesApi.rejectTrade("trade-1");

      expect(api.patch).toHaveBeenCalledWith("/trades/trade-1/reject");
      expect(result).toEqual(rejectedTrade);
    });
  });

  describe("cancelTrade", () => {
    it("should cancel a trade proposal", async () => {
      const cancelledTrade = { ...mockTrade, status: TradeStatus.CANCELLED };

      vi.mocked(api.patch).mockResolvedValue({
        data: cancelledTrade,
      } as AxiosResponse);

      const result = await tradesApi.cancelTrade("trade-1");

      expect(api.patch).toHaveBeenCalledWith("/trades/trade-1/cancel");
      expect(result).toEqual(cancelledTrade);
    });
  });

  describe("completeTrade", () => {
    it("should mark a trade as completed", async () => {
      const completedTrade = {
        ...mockTrade,
        status: TradeStatus.COMPLETED,
        completedAt: "2024-01-05T00:00:00Z",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: completedTrade,
      } as AxiosResponse);

      const result = await tradesApi.completeTrade("trade-1");

      expect(api.patch).toHaveBeenCalledWith("/trades/trade-1/complete");
      expect(result).toEqual(completedTrade);
    });
  });
});
