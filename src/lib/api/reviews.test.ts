/**
 * Reviews API Client Tests
 */

import type { CreateReviewDto, Review, UpdateReviewDto } from "@/types/review";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import * as reviewsApi from "./reviews";

// Mock the api module
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Reviews API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReview: Review = {
    id: "review-1",
    rating: 5,
    comment: "Great trade!",
    reviewerId: "user-1",
    revieweeId: "user-2",
    tradeId: "trade-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    reviewer: {
      id: "user-1",
      username: "reviewer",
      avatarUrl: null,
    },
    reviewee: {
      id: "user-2",
      username: "reviewee",
      avatarUrl: null,
    },
  };

  describe("createReview", () => {
    it("should create a review for a trade", async () => {
      const createDto: CreateReviewDto = {
        rating: 5,
        comment: "Great trade!",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockReview,
      } as AxiosResponse);

      const result = await reviewsApi.createReview("trade-1", createDto);

      expect(api.post).toHaveBeenCalledWith(
        "/reviews/trades/trade-1",
        createDto,
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe("getUserReviews", () => {
    it("should fetch reviews for a user", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockReview],
      } as AxiosResponse);

      const result = await reviewsApi.getUserReviews("user-2");

      expect(api.get).toHaveBeenCalledWith("/reviews/users/user-2");
      expect(result).toEqual([mockReview]);
    });
  });

  describe("getMyReviewsGiven", () => {
    it("should fetch reviews given by current user", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockReview],
      } as AxiosResponse);

      const result = await reviewsApi.getMyReviewsGiven();

      expect(api.get).toHaveBeenCalledWith("/reviews/me/given");
      expect(result).toEqual([mockReview]);
    });
  });

  describe("getMyReviews", () => {
    it("should fetch reviews received by current user", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockReview],
      } as AxiosResponse);

      const result = await reviewsApi.getMyReviews();

      expect(api.get).toHaveBeenCalledWith("/reviews/me");
      expect(result).toEqual([mockReview]);
    });
  });

  describe("getReviewById", () => {
    it("should fetch a specific review", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockReview,
      } as AxiosResponse);

      const result = await reviewsApi.getReviewById("review-1");

      expect(api.get).toHaveBeenCalledWith("/reviews/review-1");
      expect(result).toEqual(mockReview);
    });
  });

  describe("updateReview", () => {
    it("should update a review", async () => {
      const updateDto: UpdateReviewDto = {
        rating: 4,
        comment: "Updated comment",
      };
      const updatedReview = {
        ...mockReview,
        rating: 4,
        comment: "Updated comment",
      };

      vi.mocked(api.put).mockResolvedValue({
        data: updatedReview,
      } as AxiosResponse);

      const result = await reviewsApi.updateReview("review-1", updateDto);

      expect(api.put).toHaveBeenCalledWith("/reviews/review-1", updateDto);
      expect(result).toEqual(updatedReview);
    });
  });

  describe("deleteReview", () => {
    it("should delete a review", async () => {
      vi.mocked(api.delete).mockResolvedValue({} as AxiosResponse);

      await reviewsApi.deleteReview("review-1");

      expect(api.delete).toHaveBeenCalledWith("/reviews/review-1");
    });
  });

  describe("getTradeReviews", () => {
    it("should fetch all reviews for a trade", async () => {
      const tradeReviews = [mockReview, { ...mockReview, id: "review-2" }];

      vi.mocked(api.get).mockResolvedValue({
        data: tradeReviews,
      } as AxiosResponse);

      const result = await reviewsApi.getTradeReviews("trade-1");

      expect(api.get).toHaveBeenCalledWith("/reviews/trades/trade-1/all");
      expect(result).toEqual(tradeReviews);
    });
  });
});
