/**
 * Likes API Client Tests
 */

import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as likesApi from "./likes";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Likes API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("likeItem", () => {
    it("should like an item", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: {
          message: "Item liked",
          likesCount: 15,
        },
      } as AxiosResponse);

      const result = await likesApi.likeItem("item-1");

      expect(api.post).toHaveBeenCalledWith("/items/item-1/like");
      expect(result).toEqual({ likesCount: 15 });
    });
  });

  describe("unlikeItem", () => {
    it("should unlike an item", async () => {
      vi.mocked(api.delete).mockResolvedValue({
        data: {
          likesCount: 14,
        },
      } as AxiosResponse);

      const result = await likesApi.unlikeItem("item-1");

      expect(api.delete).toHaveBeenCalledWith("/items/item-1/like");
      expect(result).toEqual({ likesCount: 14 });
    });
  });

  describe("getLikeCount", () => {
    it("should fetch like count for an item", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { count: 20 },
      } as AxiosResponse);

      const result = await likesApi.getLikeCount("item-1");

      expect(api.get).toHaveBeenCalledWith("/items/item-1/likes/count");
      expect(result).toBe(20);
    });
  });

  describe("checkIfLiked", () => {
    it("should check if item is liked", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { liked: true },
      } as AxiosResponse);

      const result = await likesApi.checkIfLiked("item-1");

      expect(api.get).toHaveBeenCalledWith("/items/item-1/likes/me");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

      const result = await likesApi.checkIfLiked("item-1");

      expect(result).toBe(false);
    });
  });

  describe("getUsersWhoLiked", () => {
    it("should fetch users who liked an item", async () => {
      const users = [
        {
          id: "like-1",
          createdAt: "2024-01-01T00:00:00Z",
          user: {
            id: "user-1",
            username: "user1",
            avatarUrl: "avatar1.jpg",
          },
        },
        {
          id: "like-2",
          createdAt: "2024-01-02T00:00:00Z",
          user: {
            id: "user-2",
            username: "user2",
            avatarUrl: undefined,
          },
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        data: users,
      } as AxiosResponse);

      const result = await likesApi.getUsersWhoLiked("item-1");

      expect(api.get).toHaveBeenCalledWith("/items/item-1/likes/users");
      expect(result).toEqual(users);
    });
  });
});
