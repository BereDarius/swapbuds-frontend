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
  const [isConnected, setIsConnected] = useState(false);
  const [isNotificationsConnected, setIsNotificationsConnected] =
    useState(false);
  const [isSupportConnected, setIsSupportConnected] = useState(false);

  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !accessToken) {
      // Cleanup existing connections (state will update via disconnect events)
      disconnectAllSockets();
      return;
    }

    // Create main socket connection using helper (default namespace - messages)
    const mainSocket = getSocket(accessToken);

    mainSocket.on("connect", () => {
      logger.debug("Messages WebSocket connected", { socketId: mainSocket.id });
      setIsConnected(true);

      // Subscribe to user's message room
      if (user?.id) {
        mainSocket.emit("subscribe", user.id);
      }
    });

    mainSocket.on("disconnect", () => {
      logger.debug("Messages WebSocket disconnected");
      setIsConnected(false);
    });

    mainSocket.on("connect_error", (error: Error) => {
      logger.error("Messages WebSocket connection error", error);
      setIsConnected(false);
    });

    // Create notifications socket connection using helper
    const notifSocket = getNotificationsSocket(accessToken);

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

    // Create support socket connection using helper
    const suppSocket = getSupportSocket(accessToken);

    suppSocket.on("connect", () => {
      logger.debug("Support WebSocket connected", { socketId: suppSocket.id });
      setIsSupportConnected(true);

      // Join support system
      if (user?.id) {
        suppSocket.emit("support:join", { userId: user.id });
      }
    });

    suppSocket.on("disconnect", () => {
      logger.debug("Support WebSocket disconnected");
      setIsSupportConnected(false);
    });

    suppSocket.on("connect_error", (error: Error) => {
      logger.error("Support WebSocket connection error", error);
      setIsSupportConnected(false);
    });

    // Cleanup on unmount or user change (state updates via disconnect events)
    return () => {
      disconnectAllSockets();
    };
  }, [user, accessToken]);

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
