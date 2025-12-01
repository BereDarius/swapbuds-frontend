/**
 * Notifications Socket Hook Tests
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationsSocket } from "./notifications";

// Mock the provider
const mockNotificationsSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

let mockGetNotificationsSocket: () =>
  | typeof mockNotificationsSocket
  | null = () => mockNotificationsSocket;
let mockIsNotificationsConnected = true;

vi.mock("./provider", () => ({
  useSocketContext: () => ({
    getNotificationsSocket: () => mockGetNotificationsSocket(),
    isNotificationsConnected: mockIsNotificationsConnected,
  }),
}));

describe("useNotificationsSocket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("onNotification", () => {
    it("should subscribe to notification events", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onNotification(callback);
      });

      expect(mockNotificationsSocket.on).toHaveBeenCalledWith(
        "notification",
        callback,
      );
    });

    it("should unsubscribe when cleanup function is called", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      let cleanup: () => void;
      act(() => {
        cleanup = result.current.onNotification(callback);
      });

      act(() => {
        cleanup();
      });

      expect(mockNotificationsSocket.off).toHaveBeenCalledWith(
        "notification",
        callback,
      );
    });
  });

  describe("onNotificationRead", () => {
    it("should subscribe to notification read events", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onNotificationRead(callback);
      });

      expect(mockNotificationsSocket.on).toHaveBeenCalledWith(
        "notificationRead",
        callback,
      );
    });
  });

  describe("onAllNotificationsRead", () => {
    it("should subscribe to all notifications read events", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onAllNotificationsRead(callback);
      });

      expect(mockNotificationsSocket.on).toHaveBeenCalledWith(
        "allNotificationsRead",
        callback,
      );
    });
  });

  describe("onNotificationDeleted", () => {
    it("should subscribe to notification deleted events", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      act(() => {
        result.current.onNotificationDeleted(callback);
      });

      expect(mockNotificationsSocket.on).toHaveBeenCalledWith(
        "notificationDeleted",
        callback,
      );
    });
  });

  describe("connection status", () => {
    it("should expose connection status", () => {
      const { result } = renderHook(() => useNotificationsSocket());

      expect(result.current.isConnected).toBe(true);
    });
  });

  describe("when socket is null", () => {
    beforeEach(() => {
      mockGetNotificationsSocket = () => null;
      mockIsNotificationsConnected = false;
    });

    afterEach(() => {
      mockGetNotificationsSocket = () => mockNotificationsSocket;
      mockIsNotificationsConnected = true;
    });

    it("should return noop for all event handlers when socket is null", () => {
      const { result } = renderHook(() => useNotificationsSocket());
      const callback = vi.fn();

      // Test all event handlers
      result.current.onNotification(callback)();
      result.current.onNotificationRead(callback)();
      result.current.onAllNotificationsRead(callback)();
      result.current.onNotificationDeleted(callback)();

      expect(mockNotificationsSocket.on).not.toHaveBeenCalled();
      expect(mockNotificationsSocket.off).not.toHaveBeenCalled();
    });
  });
});
