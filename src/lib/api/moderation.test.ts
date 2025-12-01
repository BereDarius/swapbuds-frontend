/**
 * Moderation API Client Tests
 */

import type { ContentFlag } from "@/types/moderation";
import { FlagReason, FlagStatus } from "@/types/moderation";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as moderationApi from "./moderation";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Moderation API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFlag: ContentFlag = {
    id: "flag-1",
    contentType: "ITEM",
    contentId: "item-1",
    reporterId: "user-1",
    reason: FlagReason.INAPPROPRIATE_CONTENT,
    description: "Contains offensive content",
    status: FlagStatus.PENDING,
    createdAt: "2024-01-01T00:00:00Z",
  };

  describe("getFlags", () => {
    it("should fetch flags with filters", async () => {
      const response = {
        flags: [mockFlag],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await moderationApi.getFlags({
        status: "PENDING",
        contentType: "ITEM",
        page: 1,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/moderation/flags"),
      );
      expect(result).toEqual(response);
    });

    it("should fetch flags without parameters", async () => {
      const response = {
        flags: [mockFlag],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await moderationApi.getFlags();

      expect(api.get).toHaveBeenCalledWith("/moderation/flags?");
      expect(result).toEqual(response);
    });

    it("should fetch flags with only status", async () => {
      const response = {
        flags: [mockFlag],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await moderationApi.getFlags({ status: "APPROVED" });

      expect(api.get).toHaveBeenCalledWith("/moderation/flags?status=APPROVED");
    });

    it("should fetch flags with only contentType", async () => {
      const response = {
        flags: [mockFlag],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await moderationApi.getFlags({ contentType: "COMMENT" });

      expect(api.get).toHaveBeenCalledWith(
        "/moderation/flags?contentType=COMMENT",
      );
    });

    it("should fetch flags with page and limit", async () => {
      const response = {
        flags: [mockFlag],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await moderationApi.getFlags({ page: 2, limit: 20 });

      expect(api.get).toHaveBeenCalledWith("/moderation/flags?page=2&limit=20");
    });
  });

  describe("getFlagById", () => {
    it("should fetch a specific flag", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockFlag,
      } as AxiosResponse);

      const result = await moderationApi.getFlagById("flag-1");

      expect(api.get).toHaveBeenCalledWith("/moderation/flags/flag-1");
      expect(result).toEqual(mockFlag);
    });
  });

  describe("flagContent", () => {
    it("should flag content for moderation", async () => {
      const flagData = {
        contentType: "ITEM",
        contentId: "item-1",
        reason: FlagReason.INAPPROPRIATE_CONTENT,
        description: "Contains offensive content",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockFlag,
      } as AxiosResponse);

      const result = await moderationApi.flagContent(flagData);

      expect(api.post).toHaveBeenCalledWith("/moderation/flags", flagData);
      expect(result).toEqual(mockFlag);
    });

    it("should flag content without description", async () => {
      const flagData = {
        contentType: "COMMENT",
        contentId: "comment-1",
        reason: FlagReason.SPAM,
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockFlag,
      } as AxiosResponse);

      const result = await moderationApi.flagContent(flagData);

      expect(api.post).toHaveBeenCalledWith("/moderation/flags", flagData);
      expect(result).toEqual(mockFlag);
    });
  });

  describe("flagItem", () => {
    it("should flag an item", async () => {
      const flagData = {
        reason: FlagReason.SPAM,
        description: "Spam listing",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockFlag,
      } as AxiosResponse);

      const result = await moderationApi.flagItem("item-1", flagData);

      expect(api.post).toHaveBeenCalledWith(
        "/moderation/items/item-1/flag",
        flagData,
      );
      expect(result).toEqual(mockFlag);
    });
  });

  describe("approveFlag", () => {
    it("should approve a flag", async () => {
      const approvedFlag = {
        ...mockFlag,
        status: FlagStatus.APPROVED,
        reviewedAt: "2024-01-02T00:00:00Z",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: approvedFlag,
      } as AxiosResponse);

      const result = await moderationApi.approveFlag(
        "flag-1",
        "No violation found",
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/moderation/flags/flag-1/approve",
        {
          reason: "No violation found",
        },
      );
      expect(result).toEqual(approvedFlag);
    });
  });

  describe("rejectFlag", () => {
    it("should reject a flag", async () => {
      const rejectedFlag = {
        ...mockFlag,
        status: FlagStatus.REJECTED,
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: rejectedFlag,
      } as AxiosResponse);

      const result = await moderationApi.rejectFlag("flag-1", "Not applicable");

      expect(api.patch).toHaveBeenCalledWith(
        "/moderation/flags/flag-1/reject",
        {
          reason: "Not applicable",
        },
      );
      expect(result).toEqual(rejectedFlag);
    });
  });

  describe("removeFlag", () => {
    it("should remove flagged content", async () => {
      const removedFlag = {
        ...mockFlag,
        status: FlagStatus.REMOVED,
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: removedFlag,
      } as AxiosResponse);

      const result = await moderationApi.removeFlag(
        "flag-1",
        "Policy violation",
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/moderation/flags/flag-1/remove",
        {
          reason: "Policy violation",
        },
      );
      expect(result).toEqual(removedFlag);
    });
  });

  describe("getFlaggedComments", () => {
    it("should fetch flagged comments", async () => {
      const response = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await moderationApi.getFlaggedComments({
        page: 1,
        limit: 10,
        status: "PENDING",
      });

      expect(api.get).toHaveBeenCalledWith(
        "/moderation/comments/flagged",
        expect.objectContaining({
          params: { page: 1, limit: 10, status: "PENDING" },
        }),
      );
      expect(result).toEqual(response);
    });
  });

  describe("approveFlaggedComment", () => {
    it("should approve a flagged comment", async () => {
      vi.mocked(api.patch).mockResolvedValue({
        data: { message: "Comment approved" },
      } as AxiosResponse);

      const result = await moderationApi.approveFlaggedComment(
        "flag-1",
        "No issues found",
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/moderation/comments/flagged/flag-1/approve",
        { notes: "No issues found" },
      );
      expect(result).toEqual({ message: "Comment approved" });
    });
  });

  describe("removeFlaggedComment", () => {
    it("should remove a flagged comment", async () => {
      vi.mocked(api.delete).mockResolvedValue({
        data: { message: "Comment removed" },
      } as AxiosResponse);

      const result = await moderationApi.removeFlaggedComment(
        "flag-1",
        "Policy violation",
        true,
      );

      expect(api.delete).toHaveBeenCalledWith(
        "/moderation/comments/flagged/flag-1/remove",
        { data: { reason: "Policy violation", notifyUser: true } },
      );
      expect(result).toEqual({ message: "Comment removed" });
    });
  });
});
