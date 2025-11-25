"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getMessageUnreadCount } from "@/lib/api/messages";
import { getNotificationUnreadCount } from "@/lib/api/notifications";
import { useMessagesSocket } from "@/lib/socket/messages";
import { useNotificationsSocket } from "@/lib/socket/notifications";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth, _hasHydrated } = useAuthStore();

  // WebSocket hooks
  const { onMessage } = useMessagesSocket();
  const { onNotification } = useNotificationsSocket();

  const { data: unreadMessagesCount = 0 } = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: getMessageUnreadCount,
    enabled: !!user,
    refetchInterval: 30000, // Fallback: refetch every 30s
  });

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getNotificationUnreadCount,
    enabled: !!user,
    refetchInterval: 30000, // Fallback: refetch every 30s
  });

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

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // Redirect if not authenticated (only after hydration)
  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push("/login");
    }
  }, [_hasHydrated, user, router]);

  // Show nothing while hydrating or redirecting
  if (!_hasHydrated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={handleLogout}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
