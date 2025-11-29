"use client";

import { useMessagesSocket } from "@/lib/socket/messages";
import { useNotificationsSocket } from "@/lib/socket/notifications";
import { useAuthStore } from "@/stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * LayoutContent Component
 *
 * Client-side wrapper that handles WebSocket connections and invalidates
 * query cache when new messages or notifications arrive.
 * This ensures badge counts stay up-to-date across the app.
 */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // WebSocket hooks
  const { onMessage } = useMessagesSocket();
  const { onNotification } = useNotificationsSocket();

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onMessage(() => {
      // Invalidate unread message count when new message arrives
      queryClient.invalidateQueries({
        queryKey: ["messages", "unread-count"],
      });
    });

    return unsubscribe;
  }, [user, onMessage, queryClient]);

  // Listen for new notifications via WebSocket
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onNotification(() => {
      // Invalidate unread notification count when new notification arrives
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    });

    return unsubscribe;
  }, [user, onNotification, queryClient]);

  // Render children even before hydration - the individual components
  // that need auth state will handle their own hydration checks
  return <>{children}</>;
}
