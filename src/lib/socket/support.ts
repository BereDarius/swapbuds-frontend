/**
 * Support Socket Hook
 *
 * Handles WebSocket events for real-time support chat
 * Auto-connects socket on first use (lazy loading)
 */

"use client";

import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/authStore";
import type { SupportMessage } from "@/types/support";
import { useCallback, useEffect } from "react";
import { useSocketContext } from "./provider";

export function useSupportSocket() {
  const { getSupportSocket, isSupportConnected } = useSocketContext();
  const { user } = useAuthStore();

  // Auto-connect socket when hook is used (lazy loading)
  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) return;

    const socket = getSupportSocket();
    if (!socket) return;

    // Connect if not already connected
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
      logger.debug("Support socket connecting (lazy load)");
    }

    // Join support system
    socket.on("connect", () => {
      if (user?.id) {
        socket.emit("support:join", { userId: user.id });
      }
    });

    // If already connected, join immediately
    if (socket.connected && user?.id) {
      socket.emit("support:join", { userId: user.id });
    }
  }, [getSupportSocket, user]);

  const supportSocket = getSupportSocket();

  /**
   * Join a specific support chat
   */
  const joinChat = useCallback(
    (chatId: string) => {
      if (supportSocket) {
        supportSocket.emit("support:joinChat", { chatId });
      }
    },
    [supportSocket]
  );

  /**
   * Leave a specific support chat
   */
  const leaveChat = useCallback(
    (chatId: string) => {
      if (supportSocket) {
        supportSocket.emit("support:leaveChat", { chatId });
      }
    },
    [supportSocket]
  );

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback(
    (chatId: string, username: string) => {
      if (supportSocket) {
        supportSocket.emit("support:typing", { chatId, username });
      }
    },
    [supportSocket]
  );

  /**
   * Subscribe to new message events
   */
  const onNewMessage = useCallback(
    (callback: (data: { chatId: string; message: SupportMessage }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:newMessage", callback);
      return () => {
        supportSocket.off("support:newMessage", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to typing indicator events
   */
  const onUserTyping = useCallback(
    (callback: (data: { chatId: string; username: string }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:userTyping", callback);
      return () => {
        supportSocket.off("support:userTyping", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to chat assigned events (for users)
   */
  const onChatAssigned = useCallback(
    (callback: (data: { chatId: string; agentId: string }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:chatAssigned", callback);
      return () => {
        supportSocket.off("support:chatAssigned", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to new chat assigned events (for agents)
   */
  const onNewChatAssigned = useCallback(
    (callback: (data: { chatId: string; userId: string }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:newChatAssigned", callback);
      return () => {
        supportSocket.off("support:newChatAssigned", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to queue position updates
   */
  const onQueueUpdate = useCallback(
    (callback: (data: { chatId: string; position: number }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:queueUpdate", callback);
      return () => {
        supportSocket.off("support:queueUpdate", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to chat resolved events
   */
  const onChatResolved = useCallback(
    (callback: (data: { chatId: string }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:chatResolved", callback);
      return () => {
        supportSocket.off("support:chatResolved", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to chat closed events
   */
  const onChatClosed = useCallback(
    (callback: (data: { chatId: string }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:chatClosed", callback);
      return () => {
        supportSocket.off("support:chatClosed", callback);
      };
    },
    [supportSocket]
  );

  /**
   * Subscribe to agent availability changes
   */
  const onAgentAvailability = useCallback(
    (callback: (data: { agentId: string; isAvailable: boolean }) => void) => {
      if (!supportSocket) return () => {};
      supportSocket.on("support:agentAvailability", callback);
      return () => {
        supportSocket.off("support:agentAvailability", callback);
      };
    },
    [supportSocket]
  );

  return {
    isConnected: isSupportConnected,
    joinChat,
    leaveChat,
    emitTyping,
    onNewMessage,
    onUserTyping,
    onChatAssigned,
    onNewChatAssigned,
    onQueueUpdate,
    onChatResolved,
    onChatClosed,
    onAgentAvailability,
  };
}
