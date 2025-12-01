/**
 * Messages API Client Tests
 */

import type { Conversation, Message, MessagesResponse } from "@/types/message";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import * as messagesApi from "./messages";

// Mock the api module
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Messages API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConversation: Conversation = {
    id: "conv-1",
    user1Id: "user-1",
    user2Id: "user-2",
    tradeId: null,
    lastMessageAt: new Date("2024-01-01T00:00:00Z"),
    lastMessageContent: "Hello",
    lastMessageSender: "user-2",
    unreadCount: 1,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    otherUser: {
      id: "user-2",
      username: "otheruser",
      avatarUrl: null,
      isActive: true,
    },
  };

  const mockMessage: Message = {
    id: "msg-1",
    content: "Hello",
    type: "text",
    senderId: "user-1",
    conversationId: "conv-1",
    isRead: false,
    readAt: null,
    isEdited: false,
    editedAt: null,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    deleteReason: null,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  describe("getConversations", () => {
    it("should fetch all conversations", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockConversation],
      } as AxiosResponse);

      const result = await messagesApi.getConversations();

      expect(api.get).toHaveBeenCalledWith("/messages/conversations");
      expect(result).toEqual([mockConversation]);
    });
  });

  describe("getConversation", () => {
    it("should fetch a single conversation", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockConversation],
      } as AxiosResponse);

      const result = await messagesApi.getConversation("conv-1");

      expect(result).toEqual(mockConversation);
    });

    it("should throw error if conversation not found", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [],
      } as AxiosResponse);

      await expect(messagesApi.getConversation("invalid-id")).rejects.toThrow(
        "Conversation not found",
      );
    });
  });

  describe("getMessages", () => {
    it("should fetch messages in a conversation", async () => {
      const mockResponse: MessagesResponse = {
        messages: [mockMessage],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      const result = await messagesApi.getMessages("conv-1", {
        page: 1,
        limit: 50,
      });

      expect(api.get).toHaveBeenCalledWith(
        "/messages/conversations/conv-1",
        expect.objectContaining({
          params: { page: 1, limit: 50 },
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("sendMessage", () => {
    it("should send a new message", async () => {
      const sendDto = {
        recipientId: "user-2",
        content: "Hello there",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockMessage,
      } as AxiosResponse);

      const result = await messagesApi.sendMessage(sendDto);

      expect(api.post).toHaveBeenCalledWith("/messages", sendDto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe("markMessageAsRead", () => {
    it("should mark a message as read", async () => {
      const readMessage = { ...mockMessage, isRead: true };

      vi.mocked(api.patch).mockResolvedValue({
        data: readMessage,
      } as AxiosResponse);

      const result = await messagesApi.markMessageAsRead("msg-1");

      expect(api.patch).toHaveBeenCalledWith("/messages/msg-1/read");
      expect(result).toEqual(readMessage);
    });
  });

  describe("markConversationAsRead", () => {
    it("should mark all messages in a conversation as read", async () => {
      vi.mocked(api.patch).mockResolvedValue({
        data: { count: 5 },
      } as AxiosResponse);

      const result = await messagesApi.markConversationAsRead("conv-1");

      expect(api.patch).toHaveBeenCalledWith(
        "/messages/conversations/conv-1/read",
      );
      expect(result).toEqual({ count: 5 });
    });
  });

  describe("getMessageUnreadCount", () => {
    it("should fetch unread message count", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { count: 3 },
      } as AxiosResponse);

      const result = await messagesApi.getMessageUnreadCount();

      expect(api.get).toHaveBeenCalledWith("/messages/unread/count");
      expect(result).toBe(3);
    });
  });

  describe("updateMessage", () => {
    it("should update a message", async () => {
      const updatedMessage = {
        ...mockMessage,
        content: "Updated content",
        isEdited: true,
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: updatedMessage,
      } as AxiosResponse);

      const result = await messagesApi.updateMessage("msg-1", {
        content: "Updated content",
      });

      expect(api.patch).toHaveBeenCalledWith("/messages/msg-1", {
        content: "Updated content",
      });
      expect(result).toEqual(updatedMessage);
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message", async () => {
      vi.mocked(api.delete).mockResolvedValue({
        data: { message: "Message deleted successfully" },
      } as AxiosResponse);

      const result = await messagesApi.deleteMessage("msg-1");

      expect(api.delete).toHaveBeenCalledWith("/messages/msg-1");
      expect(result).toEqual({ message: "Message deleted successfully" });
    });
  });

  describe("getMessageVersions", () => {
    it("should fetch message version history", async () => {
      const versions = [
        {
          id: "v1",
          content: "Original content",
          editedBy: "user-1",
          createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "v2",
          content: "Updated content",
          editedBy: "user-1",
          createdAt: "2024-01-01T01:00:00Z",
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        data: versions,
      } as AxiosResponse);

      const result = await messagesApi.getMessageVersions("msg-1");

      expect(api.get).toHaveBeenCalledWith("/messages/msg-1/versions");
      expect(result).toEqual(versions);
    });
  });
});
