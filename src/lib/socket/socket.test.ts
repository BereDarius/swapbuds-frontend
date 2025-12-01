/**
 * Socket Helper Tests
 */

import { io } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  disconnectAllSockets,
  disconnectSocket,
  getNotificationsSocket,
  getSocket,
  getSupportSocket,
  isSocketConnected,
} from "./socket";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(),
}));

describe("Socket Helper", () => {
  const mockSocket = {
    id: "socket-1",
    connected: true,
    disconnect: vi.fn(),
    on: vi.fn(),
    emit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(io).mockReturnValue(mockSocket as any);
  });

  afterEach(() => {
    disconnectAllSockets();
  });

  describe("getSocket", () => {
    it("should create main socket instance", () => {
      const socket = getSocket();

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          path: "/socket.io",
          transports: ["websocket", "polling"],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
      );
      expect(socket).toBe(mockSocket);
    });

    it("should include auth token when provided", () => {
      getSocket("test-token");

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: "test-token" },
        })
      );
    });

    it("should return same instance on subsequent calls", () => {
      const socket1 = getSocket();
      const socket2 = getSocket();

      expect(socket1).toBe(socket2);
      expect(io).toHaveBeenCalledTimes(1);
    });
  });

  describe("getNotificationsSocket", () => {
    it("should create notifications socket with namespace", () => {
      const socket = getNotificationsSocket();

      expect(io).toHaveBeenCalledWith(
        expect.stringContaining("/notifications"),
        expect.any(Object)
      );
      expect(socket).toBe(mockSocket);
    });

    it("should include auth token when provided", () => {
      getNotificationsSocket("test-token");

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: "test-token" },
        })
      );
    });
  });

  describe("getSupportSocket", () => {
    it("should create support socket with namespace", () => {
      const socket = getSupportSocket();

      expect(io).toHaveBeenCalledWith(
        expect.stringContaining("/support"),
        expect.any(Object)
      );
      expect(socket).toBe(mockSocket);
    });

    it("should include auth token when provided", () => {
      getSupportSocket("test-token");

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: "test-token" },
        })
      );
    });
  });

  describe("disconnectSocket", () => {
    it("should disconnect main socket", () => {
      getSocket();
      disconnectSocket("main");

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should disconnect notifications socket", () => {
      getNotificationsSocket();
      disconnectSocket("notifications");

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it("should disconnect support socket", () => {
      getSupportSocket();
      disconnectSocket("support");

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe("disconnectAllSockets", () => {
    it("should disconnect all socket instances", () => {
      getSocket();
      getNotificationsSocket();
      getSupportSocket();

      disconnectAllSockets();

      expect(mockSocket.disconnect).toHaveBeenCalledTimes(3);
    });
  });

  describe("isSocketConnected", () => {
    it("should return connection status for main socket", () => {
      getSocket();

      const isConnected = isSocketConnected("main");

      expect(isConnected).toBe(true);
    });

    it("should return false when socket is not created", () => {
      const isConnected = isSocketConnected("main");

      expect(isConnected).toBe(false);
    });

    it("should return false when socket is disconnected", () => {
      const disconnectedSocket = { ...mockSocket, connected: false };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(io).mockReturnValue(disconnectedSocket as any);

      getSocket();
      const isConnected = isSocketConnected("main");

      expect(isConnected).toBe(false);
    });
  });

  describe("socket configuration", () => {
    it.skip("should use NEXT_PUBLIC_WS_URL when available", () => {
      // Environment variables are baked in at build time in Next.js
      // This test requires proper environment setup at build time
      process.env.NEXT_PUBLIC_WS_URL = "ws://example.com";

      getSocket();

      expect(io).toHaveBeenCalledWith(
        expect.stringContaining("ws://example.com"),
        expect.any(Object)
      );

      delete process.env.NEXT_PUBLIC_WS_URL;
    });

    it.skip("should fallback to NEXT_PUBLIC_API_URL", () => {
      // Environment variables are baked in at build time in Next.js
      // This test requires proper environment setup at build time
      process.env.NEXT_PUBLIC_API_URL = "http://example.com/api";

      getSocket();

      expect(io).toHaveBeenCalledWith(
        expect.stringContaining("http://example.com"),
        expect.any(Object)
      );

      delete process.env.NEXT_PUBLIC_API_URL;
    });
  });
});
