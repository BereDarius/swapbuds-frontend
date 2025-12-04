/**
 * Support Socket Hook Tests
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSupportSocket } from "./support";

// Mock auth store
const mockAuthStore = {
  user: { id: "user123", username: "testuser" } as {
    id: string;
    username: string;
  } | null,
};
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({ user: mockAuthStore.user }),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock the provider
const mockSupportSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  connected: false,
  auth: {},
};

let mockGetSupportSocket: () => typeof mockSupportSocket | null = () =>
  mockSupportSocket;
let mockIsSupportConnected = true;

vi.mock("./provider", () => ({
  useSocketContext: () => ({
    getSupportSocket: () => mockGetSupportSocket(),
    isSupportConnected: mockIsSupportConnected,
  }),
}));

describe("useSupportSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupportSocket.connected = false;
    mockLocalStorage.getItem.mockReturnValue("mock-token");
    mockAuthStore.user = { id: "user123", username: "testuser" };
  });

  describe("lazy loading connection", () => {
    it("should connect socket when hook is mounted with valid user and token", () => {
      renderHook(() => useSupportSocket());

      expect(mockSupportSocket.connect).toHaveBeenCalled();
      expect(mockSupportSocket.auth).toEqual({ token: "mock-token" });
    });

    it("should not connect if user is not present", () => {
      mockAuthStore.user = null;
      renderHook(() => useSupportSocket());

      expect(mockSupportSocket.connect).not.toHaveBeenCalled();
    });

    it("should not connect if token is not present", () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      renderHook(() => useSupportSocket());

      expect(mockSupportSocket.connect).not.toHaveBeenCalled();
    });

    it("should subscribe to user room after connection", () => {
      mockSupportSocket.connected = false;
      renderHook(() => useSupportSocket());

      // Simulate connection event
      const connectHandler = mockSupportSocket.on.mock.calls.find(
        (call) => call[0] === "connect"
      )?.[1];

      if (connectHandler) {
        act(() => {
          mockSupportSocket.connected = true;
          connectHandler();
        });
      }

      expect(mockSupportSocket.emit).toHaveBeenCalledWith("support:join", {
        userId: "user123",
      });
    });

    it("should join support system immediately if already connected", () => {
      mockSupportSocket.connected = true;
      renderHook(() => useSupportSocket());

      expect(mockSupportSocket.emit).toHaveBeenCalledWith("support:join", {
        userId: "user123",
      });
    });
  });

  describe("joinChat", () => {
    it("should emit join chat event", () => {
      const { result } = renderHook(() => useSupportSocket());

      act(() => {
        result.current.joinChat("chat-1");
      });

      expect(mockSupportSocket.emit).toHaveBeenCalledWith("support:joinChat", {
        chatId: "chat-1",
      });
    });
  });

  describe("leaveChat", () => {
    it("should emit leave chat event", () => {
      const { result } = renderHook(() => useSupportSocket());

      act(() => {
        result.current.leaveChat("chat-1");
      });

      expect(mockSupportSocket.emit).toHaveBeenCalledWith("support:leaveChat", {
        chatId: "chat-1",
      });
    });
  });

  describe("emitTyping", () => {
    it("should emit typing indicator", () => {
      const { result } = renderHook(() => useSupportSocket());

      act(() => {
        result.current.emitTyping("chat-1", "testuser");
      });

      expect(mockSupportSocket.emit).toHaveBeenCalledWith("support:typing", {
        chatId: "chat-1",
        username: "testuser",
      });
    });
  });

  describe("onNewMessage", () => {
    it("should subscribe to new message events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onNewMessage(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:newMessage",
        callback
      );
    });

    it("should unsubscribe when cleanup function is called", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      let cleanup: () => void;
      act(() => {
        cleanup = result.current.onNewMessage(callback);
      });

      act(() => {
        cleanup();
      });

      expect(mockSupportSocket.off).toHaveBeenCalledWith(
        "support:newMessage",
        callback
      );
    });
  });

  describe("onUserTyping", () => {
    it("should subscribe to typing indicator events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onUserTyping(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:userTyping",
        callback
      );
    });
  });

  describe("onChatAssigned", () => {
    it("should subscribe to chat assigned events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onChatAssigned(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:chatAssigned",
        callback
      );
    });
  });

  describe("onNewChatAssigned", () => {
    it("should subscribe to new chat assigned events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onNewChatAssigned(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:newChatAssigned",
        callback
      );
    });
  });

  describe("onQueueUpdate", () => {
    it("should subscribe to queue update events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onQueueUpdate(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:queueUpdate",
        callback
      );
    });
  });

  describe("onChatResolved", () => {
    it("should subscribe to chat resolved events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onChatResolved(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:chatResolved",
        callback
      );
    });
  });

  describe("onChatClosed", () => {
    it("should subscribe to chat closed events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onChatClosed(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:chatClosed",
        callback
      );
    });
  });

  describe("onAgentAvailability", () => {
    it("should subscribe to agent availability events", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onAgentAvailability(callback);
      });

      expect(mockSupportSocket.on).toHaveBeenCalledWith(
        "support:agentAvailability",
        callback
      );
    });
  });

  describe("connection status", () => {
    it("should expose connection status", () => {
      const { result } = renderHook(() => useSupportSocket());

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe("when socket is null", () => {
    beforeEach(() => {
      mockGetSupportSocket = () => null;
      mockIsSupportConnected = false;
    });

    afterEach(() => {
      mockGetSupportSocket = () => mockSupportSocket;
      mockIsSupportConnected = true;
    });

    it("should return noop for all event handlers when socket is null", () => {
      const { result } = renderHook(() => useSupportSocket());
      const callback = vi.fn();

      // Test all event handlers
      result.current.onNewMessage(callback)();
      result.current.onUserTyping(callback)();
      result.current.onChatAssigned(callback)();
      result.current.onNewChatAssigned(callback)();
      result.current.onQueueUpdate(callback)();
      result.current.onChatResolved(callback)();
      result.current.onChatClosed(callback)();
      result.current.onAgentAvailability(callback)();

      expect(mockSupportSocket.on).not.toHaveBeenCalled();
      expect(mockSupportSocket.off).not.toHaveBeenCalled();
    });

    it("should not emit events when socket is null", () => {
      const { result } = renderHook(() => useSupportSocket());

      act(() => {
        result.current.joinChat("chat-1");
        result.current.leaveChat("chat-1");
        result.current.emitTyping("chat-1", "user");
      });

      expect(mockSupportSocket.emit).not.toHaveBeenCalled();
    });
  });
});
