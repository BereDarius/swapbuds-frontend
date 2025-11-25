"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getMessageUnreadCount } from "@/lib/api/messages";
import { getNotificationUnreadCount } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Legal Layout Component
 *
 * Layout for legal pages (Terms, Privacy Policy, Guidelines, Cookies).
 * Includes navbar and footer for consistent navigation.
 * Does not require authentication - legal pages are public.
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  // Only fetch unread counts if user is authenticated
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

  return (
    <div className="flex min-h-screen flex-col">
      {user && (
        <Navbar
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onLogout={handleLogout}
        />
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
