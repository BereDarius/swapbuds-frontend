/**
 * Messages Socket Hook Tests
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMessagesSocket } from "./messages";

// Mock the provider
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

let mockGetSocket: () => typeof mockSocket | null = () => mockSocket;
let mockIsConnected = true;

vi.mock("./provider", () => ({
  useSocketContext: () => ({
    getSocket: () => mockGetSocket(),
    isConnected: mockIsConnected,
  }),
}));

describe("useMessagesSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("onMessage", () => {
    it("should subscribe to message events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onMessage(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("message", callback);
    });

    it("should unsubscribe when cleanup function is called", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      let cleanup: () => void;
      act(() => {
        cleanup = result.current.onMessage(callback);
      });

      act(() => {
        cleanup();
      });

      expect(mockSocket.off).toHaveBeenCalledWith("message", callback);
    });
  });

  describe("onMessageRead", () => {
    it("should subscribe to message read events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onMessageRead(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("messageRead", callback);
    });
  });

  describe("onConversationRead", () => {
    it("should subscribe to conversation read events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onConversationRead(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("conversationRead", callback);
    });
  });

  describe("onMessageUpdated", () => {
    it("should subscribe to message updated events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onMessageUpdated(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("messageUpdated", callback);
    });
  });

  describe("onMessageDeleted", () => {
    it("should subscribe to message deleted events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onMessageDeleted(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("messageDeleted", callback);
    });
  });

  describe("onTyping", () => {
    it("should subscribe to typing events", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onTyping(callback);
      });

      expect(mockSocket.on).toHaveBeenCalledWith("typing", callback);
    });
  });

  describe("emitTyping", () => {
    it("should emit typing indicator", () => {
      const { result } = renderHook(() => useMessagesSocket());

      act(() => {
        result.current.emitTyping("conv-1", true, "testuser");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("typing", {
        conversationId: "conv-1",
        isTyping: true,
        username: "testuser",
      });
    });

    it("should emit stop typing indicator", () => {
      const { result } = renderHook(() => useMessagesSocket());

      act(() => {
        result.current.emitTyping("conv-1", false, "testuser");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("typing", {
        conversationId: "conv-1",
        isTyping: false,
        username: "testuser",
      });
    });
  });

  describe("joinConversation", () => {
    it("should emit join conversation event", () => {
      const { result } = renderHook(() => useMessagesSocket());

      act(() => {
        result.current.joinConversation("conv-1");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "joinConversation",
        "conv-1",
      );
    });
  });

  describe("leaveConversation", () => {
    it("should emit leave conversation event", () => {
      const { result } = renderHook(() => useMessagesSocket());

      act(() => {
        result.current.leaveConversation("conv-1");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "leaveConversation",
        "conv-1",
      );
    });
  });

  describe("connection status", () => {
    it("should expose connection status", () => {
      const { result } = renderHook(() => useMessagesSocket());

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe("when socket is null", () => {
    beforeEach(() => {
      mockGetSocket = () => null;
      mockIsConnected = false;
    });

    afterEach(() => {
      mockGetSocket = () => mockSocket;
      mockIsConnected = true;
    });

    it("should return noop for all event handlers when socket is null", () => {
      const { result } = renderHook(() => useMessagesSocket());
      const callback = vi.fn();

      // Test all event handlers
      result.current.onMessage(callback)();
      result.current.onMessageRead(callback)();
      result.current.onConversationRead(callback)();
      result.current.onMessageUpdated(callback)();
      result.current.onMessageDeleted(callback)();
      result.current.onTyping(callback)();

      // Socket methods should not be called when socket is null
      expect(mockSocket.on).not.toHaveBeenCalled();
      expect(mockSocket.off).not.toHaveBeenCalled();
    });

    it("should not emit events when socket is null", () => {
      const { result } = renderHook(() => useMessagesSocket());

      act(() => {
        result.current.emitTyping("conv-1", true, "user");
        result.current.joinConversation("conv-1");
        result.current.leaveConversation("conv-1");
      });

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });
});
