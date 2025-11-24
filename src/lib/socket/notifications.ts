/**
 * Notifications Socket Hook
 *
 * Handles WebSocket events for real-time notifications
 */

"use client";

import type { Notification } from "@/types/notification";
import { useCallback } from "react";
import { useSocketContext } from "./provider";

export function useNotificationsSocket() {
  const { getNotificationsSocket, isNotificationsConnected } =
    useSocketContext();
  const notificationsSocket = getNotificationsSocket();

  /**
   * Subscribe to new notification events
   */
  const onNotification = useCallback(
    (callback: (notification: Notification) => void) => {
      if (!notificationsSocket) return () => {};
      notificationsSocket.on("notification", callback);
      return () => {
        notificationsSocket.off("notification", callback);
      };
    },
    [notificationsSocket],
  );

  /**
   * Subscribe to notification read events
   */
  const onNotificationRead = useCallback(
    (callback: (data: { notificationId: string }) => void) => {
      if (!notificationsSocket) return () => {};
      notificationsSocket.on("notificationRead", callback);
      return () => {
        notificationsSocket.off("notificationRead", callback);
      };
    },
    [notificationsSocket],
  );

  /**
   * Subscribe to all notifications read events
   */
  const onAllNotificationsRead = useCallback(
    (callback: (data: { count: number }) => void) => {
      if (!notificationsSocket) return () => {};
      notificationsSocket.on("allNotificationsRead", callback);
      return () => {
        notificationsSocket.off("allNotificationsRead", callback);
      };
    },
    [notificationsSocket],
  );

  /**
   * Subscribe to notification deleted events
   */
  const onNotificationDeleted = useCallback(
    (callback: (data: { notificationId: string }) => void) => {
      if (!notificationsSocket) return () => {};
      notificationsSocket.on("notificationDeleted", callback);
      return () => {
        notificationsSocket.off("notificationDeleted", callback);
      };
    },
    [notificationsSocket],
  );

  return {
    isConnected: isNotificationsConnected,
    onNotification,
    onNotificationRead,
    onAllNotificationsRead,
    onNotificationDeleted,
  };
}
