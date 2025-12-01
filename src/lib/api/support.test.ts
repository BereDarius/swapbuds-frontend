/**
 * Support API Client Tests
 */

import type {
  CreateChatDto,
  ResolveChatDto,
  SendSupportMessageDto,
  SupportChat,
  SupportMessage,
} from "@/types/support";
import { SupportChatStatus, SupportPriority } from "@/types/support";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as supportApi from "./support";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("Support API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockChat: SupportChat = {
    id: "chat-1",
    userId: "user-1",
    subject: "Need help",
    priority: SupportPriority.MEDIUM,
    status: SupportChatStatus.OPEN,
    assignedTo: undefined,
    resolution: undefined,
    messages: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    resolvedAt: undefined,
    closedAt: undefined,
  };

  const mockMessage: SupportMessage = {
    id: "msg-1",
    chatId: "chat-1",
    senderId: "user-1",
    sender: {
      id: "user-1",
      username: "testuser",
      role: "USER",
    },
    message: "I need help with my account",
    isSystem: false,
    createdAt: "2024-01-01T00:00:00Z",
  };

  describe("getMySupportChats", () => {
    it("should fetch user's support chats", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockChat],
      } as AxiosResponse);

      const result = await supportApi.getMySupportChats();

      expect(api.get).toHaveBeenCalledWith("/support/chats");
      expect(result).toEqual([mockChat]);
    });
  });

  describe("getSupportChatById", () => {
    it("should fetch a specific support chat", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockChat,
      } as AxiosResponse);

      const result = await supportApi.getSupportChatById("chat-1");

      expect(api.get).toHaveBeenCalledWith("/support/chats/chat-1");
      expect(result).toEqual(mockChat);
    });
  });

  describe("createSupportChat", () => {
    it("should create a new support chat", async () => {
      const createDto: CreateChatDto = {
        subject: "Need help",
        priority: SupportPriority.MEDIUM,
        initialMessage: "I need help with my account",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockChat,
      } as AxiosResponse);

      const result = await supportApi.createSupportChat(createDto);

      expect(api.post).toHaveBeenCalledWith("/support/chat", createDto);
      expect(result).toEqual(mockChat);
    });
  });

  describe("sendSupportMessage", () => {
    it("should send a message in a support chat", async () => {
      const messageDto: SendSupportMessageDto = {
        message: "Thank you for your help",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: mockMessage,
      } as AxiosResponse);

      const result = await supportApi.sendSupportMessage("chat-1", messageDto);

      expect(api.post).toHaveBeenCalledWith(
        "/support/chats/chat-1/messages",
        messageDto,
      );
      expect(result).toEqual(mockMessage);
    });
  });

  describe("resolveSupportChat", () => {
    it("should resolve a support chat", async () => {
      const resolveDto: ResolveChatDto = {
        resolution: "Issue resolved successfully",
      };
      const resolvedChat = {
        ...mockChat,
        status: SupportChatStatus.RESOLVED,
        resolvedAt: "2024-01-02T00:00:00Z",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: resolvedChat,
      } as AxiosResponse);

      const result = await supportApi.resolveSupportChat("chat-1", resolveDto);

      expect(api.patch).toHaveBeenCalledWith(
        "/support/chats/chat-1/resolve",
        resolveDto,
      );
      expect(result).toEqual(resolvedChat);
    });
  });

  describe("closeSupportChat", () => {
    it("should close a support chat", async () => {
      const closedChat = {
        ...mockChat,
        status: SupportChatStatus.CLOSED,
        closedAt: "2024-01-02T00:00:00Z",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: closedChat,
      } as AxiosResponse);

      const result = await supportApi.closeSupportChat("chat-1");

      expect(api.patch).toHaveBeenCalledWith("/support/chats/chat-1/close");
      expect(result).toEqual(closedChat);
    });
  });

  describe("reopenSupportChat", () => {
    it("should reopen a closed support chat", async () => {
      const reopenedChat = {
        ...mockChat,
        status: SupportChatStatus.OPEN,
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: reopenedChat,
      } as AxiosResponse);

      const result = await supportApi.reopenSupportChat("chat-1");

      expect(api.patch).toHaveBeenCalledWith("/support/chats/chat-1/reopen");
      expect(result).toEqual(reopenedChat);
    });
  });

  describe("getAllSupportChats", () => {
    it("should fetch all support chats with filters", async () => {
      const response = {
        chats: [mockChat],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await supportApi.getAllSupportChats({
        status: "OPEN",
        priority: "HIGH",
        page: 1,
        limit: 10,
      });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/support/chats"),
      );
      expect(result).toEqual(response);
    });

    it("should fetch chats without parameters", async () => {
      const response = {
        chats: [mockChat],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await supportApi.getAllSupportChats();

      expect(api.get).toHaveBeenCalledWith("/support/chats?");
      expect(result).toEqual(response);
    });

    it("should fetch chats with only status filter", async () => {
      const response = {
        chats: [mockChat],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await supportApi.getAllSupportChats({ status: "CLOSED" });

      expect(api.get).toHaveBeenCalledWith("/support/chats?status=CLOSED");
    });

    it("should fetch chats with only priority filter", async () => {
      const response = {
        chats: [mockChat],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await supportApi.getAllSupportChats({ priority: "LOW" });

      expect(api.get).toHaveBeenCalledWith("/support/chats?priority=LOW");
    });

    it("should fetch chats with assignedTo filter", async () => {
      const response = {
        chats: [mockChat],
        total: 1,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      await supportApi.getAllSupportChats({ assignedTo: "staff-2" });

      expect(api.get).toHaveBeenCalledWith("/support/chats?assignedTo=staff-2");
    });
  });

  describe("assignSupportChat", () => {
    it("should assign a chat to a staff member", async () => {
      const assignedChat = {
        ...mockChat,
        assignedTo: "staff-1",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: assignedChat,
      } as AxiosResponse);

      const result = await supportApi.assignSupportChat("chat-1", "staff-1");

      expect(api.patch).toHaveBeenCalledWith("/support/chats/chat-1/assign", {
        staffId: "staff-1",
      });
      expect(result).toEqual(assignedChat);
    });
  });
});
