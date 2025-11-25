"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getMessageUnreadCount } from "@/lib/api/messages";
import { getNotificationUnreadCount } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, clearAuth, _hasHydrated } = useAuthStore();

  const { data: unreadMessagesCount = 0 } = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: getMessageUnreadCount,
    enabled: !!user,
  });

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getNotificationUnreadCount,
    enabled: !!user,
  });

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
