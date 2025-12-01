/**
 * Messages Socket Hook
 *
 * Handles WebSocket events for real-time messaging
 */

"use client";

import type { Message } from "@/types/message";
import { useCallback } from "react";
import { useSocketContext } from "./provider";

export function useMessagesSocket() {
  const { getSocket, isConnected } = useSocketContext();
  const socket = getSocket();

  /**
   * Subscribe to new message events
   */
  const onMessage = useCallback(
    (callback: (message: Message) => void) => {
      if (!socket) return () => {};
      socket.on("message", callback);
      return () => {
        socket.off("message", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to message read events
   */
  const onMessageRead = useCallback(
    (
      callback: (data: { messageId: string; conversationId: string }) => void
    ) => {
      if (!socket) return () => {};
      socket.on("messageRead", callback);
      return () => {
        socket.off("messageRead", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to conversation read events
   */
  const onConversationRead = useCallback(
    (callback: (data: { conversationId: string; count: number }) => void) => {
      if (!socket) return () => {};
      socket.on("conversationRead", callback);
      return () => {
        socket.off("conversationRead", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to message updated events
   */
  const onMessageUpdated = useCallback(
    (callback: (message: Message) => void) => {
      if (!socket) return () => {};
      socket.on("messageUpdated", callback);
      return () => {
        socket.off("messageUpdated", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to message deleted events
   */
  const onMessageDeleted = useCallback(
    (
      callback: (data: { messageId: string; conversationId: string }) => void
    ) => {
      if (!socket) return () => {};
      socket.on("messageDeleted", callback);
      return () => {
        socket.off("messageDeleted", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to typing indicator events
   */
  const onTyping = useCallback(
    (
      callback: (data: {
        conversationId: string;
        isTyping: boolean;
        typerUsername: string;
      }) => void
    ) => {
      if (!socket) return () => {};
      socket.on("typing", callback);
      return () => {
        socket.off("typing", callback);
      };
    },
    [socket]
  );

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean, username: string) => {
      if (socket) {
        socket.emit("typing", {
          conversationId,
          isTyping,
          username,
        });
      }
    },
    [socket]
  );

  /**
   * Join a conversation room
   */
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (socket) {
        socket.emit("joinConversation", conversationId);
      }
    },
    [socket]
  );

  /**
   * Leave a conversation room
   */
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (socket) {
        socket.emit("leaveConversation", conversationId);
      }
    },
    [socket]
  );

  return {
    isConnected,
    onMessage,
    onMessageRead,
    onConversationRead,
    onMessageUpdated,
    onMessageDeleted,
    onTyping,
    emitTyping,
    joinConversation,
    leaveConversation,
  };
}
