/**
 * Comments API Client Tests
 */

import type {
  Comment,
  CreateCommentDto,
  CreateCommentResponse,
  UpdateCommentDto,
} from "@/types/comment";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as commentsApi from "./comments";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Comments API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComment: Comment = {
    id: "comment-1",
    content: "Great item!",
    userId: "user-1",
    username: "commenter",
    avatarUrl: null,
    itemId: "item-1",
    parentId: null,
    isEdited: false,
    editedAt: null,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    deleteReason: null,
    likesCount: 5,
    hasLiked: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  describe("createComment", () => {
    it("should create a comment on an item", async () => {
      const createDto: CreateCommentDto = {
        content: "Great item!",
      };
      const response: CreateCommentResponse = {
        ...mockComment,
        commentsCount: 10,
      };

      vi.mocked(api.post).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await commentsApi.createComment("item-1", createDto);

      expect(api.post).toHaveBeenCalledWith(
        "/items/item-1/comments",
        createDto
      );
      expect(result).toEqual(response);
    });
  });

  describe("getItemComments", () => {
    it("should fetch comments for an item", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockComment],
      } as AxiosResponse);

      const result = await commentsApi.getItemComments("item-1");

      expect(api.get).toHaveBeenCalledWith("/items/item-1/comments");
      expect(result).toEqual([mockComment]);
    });
  });

  describe("getCommentsCount", () => {
    it("should fetch comment count for an item", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { count: 42 },
      } as AxiosResponse);

      const result = await commentsApi.getCommentsCount("item-1");

      expect(api.get).toHaveBeenCalledWith("/items/item-1/comments/count");
      expect(result).toBe(42);
    });
  });

  describe("updateComment", () => {
    it("should update a comment", async () => {
      const updateDto: UpdateCommentDto = {
        content: "Updated comment",
      };
      const updatedComment = {
        ...mockComment,
        content: "Updated comment",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: updatedComment,
      } as AxiosResponse);

      const result = await commentsApi.updateComment("comment-1", updateDto);

      expect(api.patch).toHaveBeenCalledWith(
        "/items/comments/comment-1",
        updateDto
      );
      expect(result).toEqual(updatedComment);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      vi.mocked(api.delete).mockResolvedValue({} as AxiosResponse);

      await commentsApi.deleteComment("comment-1");

      expect(api.delete).toHaveBeenCalledWith("/items/comments/comment-1");
    });
  });

  describe("likeComment", () => {
    it("should like a comment", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: {
          message: "Comment liked",
          likesCount: 6,
          hasLiked: true,
        },
      } as AxiosResponse);

      const result = await commentsApi.likeComment("comment-1");

      expect(api.post).toHaveBeenCalledWith("/items/comments/comment-1/like");
      expect(result).toEqual({ likesCount: 6, hasLiked: true });
    });
  });

  describe("unlikeComment", () => {
    it("should unlike a comment", async () => {
      vi.mocked(api.delete).mockResolvedValue({
        data: {
          likesCount: 4,
          hasLiked: false,
        },
      } as AxiosResponse);

      const result = await commentsApi.unlikeComment("comment-1");

      expect(api.delete).toHaveBeenCalledWith("/items/comments/comment-1/like");
      expect(result).toEqual({ likesCount: 4, hasLiked: false });
    });
  });

  describe("checkCommentLiked", () => {
    it("should check if comment is liked", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { liked: true },
      } as AxiosResponse);

      const result = await commentsApi.checkCommentLiked("comment-1");

      expect(api.get).toHaveBeenCalledWith("/items/comments/comment-1/liked");
      expect(result).toBe(true);
    });

    it("should return false on error", async () => {
      vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

      const result = await commentsApi.checkCommentLiked("comment-1");

      expect(result).toBe(false);
    });
  });

  describe("flagComment", () => {
    it("should flag a comment for moderation", async () => {
      const flagData = {
        reason: "SPAM",
        description: "This is spam",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: { message: "Comment flagged for review" },
      } as AxiosResponse);

      const result = await commentsApi.flagComment("comment-1", flagData);

      expect(api.post).toHaveBeenCalledWith(
        "/moderation/comments/comment-1/flag",
        flagData
      );
      expect(result).toEqual({ message: "Comment flagged for review" });
    });
  });

  describe("getCommentVersions", () => {
    it("should fetch comment version history", async () => {
      const versions = [
        {
          id: "v1",
          content: "Original content",
          editedBy: "user-1",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        data: versions,
      } as AxiosResponse);

      const result = await commentsApi.getCommentVersions("comment-1");

      expect(api.get).toHaveBeenCalledWith(
        "/items/comments/comment-1/versions"
      );
      expect(result).toEqual(versions);
    });
  });
});
