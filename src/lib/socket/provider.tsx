/**
 * Socket Provider - Main Connection Manager
 *
 * Manages WebSocket connections and provides context for all socket namespaces
 * Uses the socket helper for consistent socket instance management
 */

"use client";

import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/authStore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import {
  disconnectAllSockets,
  getNotificationsSocket,
  getSocket,
  getSupportSocket,
} from "./socket";

interface SocketContextType {
  // Socket getter functions (use helper singleton instances)
  getSocket: () => Socket | null;
  getNotificationsSocket: () => Socket | null;
  getSupportSocket: () => Socket | null;
  // Connection states
  isConnected: boolean;
  isNotificationsConnected: boolean;
  isSupportConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected] = useState(false);
  const [isNotificationsConnected, setIsNotificationsConnected] =
    useState(false);
  const [isSupportConnected] = useState(false);

  const { user, accessToken: storeToken } = useAuthStore();

  useEffect(() => {
    // Get token from store or fallback to localStorage/sessionStorage
    const token =
      storeToken ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    // Only connect if user is authenticated and we have a token
    if (!user || !token) {
      // Cleanup existing connections if any (silently)
      try {
        disconnectAllSockets();
      } catch {
        // Ignore errors during cleanup when not authenticated
      }
      return;
    }

    // ONLY auto-connect notifications socket (needed on all authenticated pages for navbar badge)
    // Other sockets (messages, support) are lazy-loaded when their pages are accessed
    const notifSocket = getNotificationsSocket(token);

    notifSocket.on("connect", () => {
      logger.debug("Notifications WebSocket connected", {
        socketId: notifSocket.id,
      });
      setIsNotificationsConnected(true);

      // Subscribe to user's notification room
      if (user?.id) {
        notifSocket.emit("subscribe", user.id);
      }
    });

    notifSocket.on("disconnect", () => {
      logger.debug("Notifications WebSocket disconnected");
      setIsNotificationsConnected(false);
    });

    notifSocket.on("connect_error", (error: Error) => {
      logger.error("Notifications WebSocket connection error", error);
      setIsNotificationsConnected(false);
    });

    // Cleanup on unmount or user change (state updates via disconnect events)
    return () => {
      disconnectAllSockets();
    };
  }, [user, storeToken]);

  // Context value - use getter functions to access singleton instances
  const value: SocketContextType = {
    getSocket: () => getSocket(),
    getNotificationsSocket: () => getNotificationsSocket(),
    getSupportSocket: () => getSupportSocket(),
    isConnected,
    isNotificationsConnected,
    isSupportConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
