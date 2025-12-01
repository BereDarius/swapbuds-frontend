"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversations, getMessageUnreadCount } from "@/lib/api/messages";
import {
  getNotificationUnreadCountExcludingMessages,
  getNotifications,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import { getNotificationsSocket, getSocket } from "@/lib/socket/socket";
import { useAuthStore } from "@/stores/authStore";
import type { Conversation } from "@/types/message";
import type { Notification, NotificationType } from "@/types/notification";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Heart,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth, _hasHydrated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // Fetch unread counts once on mount, then rely on WebSocket updates
  const { data: unreadMessagesCount = 0, refetch: refetchMessagesCount } =
    useQuery({
      queryKey: ["messages", "unread-count"],
      queryFn: async () => {
        const count = await getMessageUnreadCount();
        return count;
      },
      enabled: !!user,
      staleTime: 0, // Allow refetch when invalidated
      refetchInterval: false, // No automatic refetching
      refetchOnWindowFocus: false, // No refetch on focus
      refetchOnReconnect: true, // Refetch on reconnect to catch missed updates
      retry: 1,
    });

  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getNotificationUnreadCountExcludingMessages,
    enabled: !!user,
    staleTime: Infinity, // Never mark as stale - updates come via WebSocket
    refetchInterval: false, // No automatic refetching
    refetchOnWindowFocus: false, // No refetch on focus
    refetchOnReconnect: true, // Refetch on reconnect to catch missed updates
    retry: 1,
  });

  // Fetch recent conversations for dropdown
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Fetch recent notifications for dropdown (excluding NEW_MESSAGE)
  const { data: allNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications", "recent"],
    queryFn: () => getNotifications(true), // unreadOnly = true
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Filter out NEW_MESSAGE notifications (they appear in messages dropdown)
  const notifications = allNotifications.filter(
    (n) => n.type !== "NEW_MESSAGE"
  );

  // Helper to get notification redirect URL based on type
  const getNotificationUrl = (notification: Notification): string => {
    const type = notification.type as NotificationType;
    const metadata = notification.metadata as
      | Record<string, string>
      | undefined;

    switch (type) {
      case "TRADE_PROPOSAL":
      case "TRADE_ACCEPTED":
      case "TRADE_REJECTED":
      case "TRADE_COMPLETED":
      case "TRADE_CANCELLED":
      case "COUNTER_OFFER":
        return metadata?.tradeId ? `/trades/${metadata.tradeId}` : "/trades";
      case "NEW_MESSAGE":
        return metadata?.conversationId
          ? `/messages/${metadata.conversationId}`
          : "/messages";
      case "ITEM_LIKED":
      case "ITEM_COMMENTED":
        return metadata?.itemId ? `/items/${metadata.itemId}` : "/items";
      case "COMMENT_REPLY":
        return metadata?.itemId ? `/items/${metadata.itemId}` : "/items";
      case "REVIEW_RECEIVED":
        return `/profile/${user?.username}#reviews`;
      case "DISPUTE_OPENED":
      case "DISPUTE_RESOLVED":
        return metadata?.disputeId
          ? `/disputes/${metadata.disputeId}`
          : "/disputes";
      case "VERIFICATION_APPROVED":
      case "VERIFICATION_REJECTED":
        return "/verification";
      case "ACCOUNT_WARNING":
      case "SYSTEM_ANNOUNCEMENT":
        return "/notifications";
      default:
        return "/notifications";
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markNotificationAsRead(notification.id);
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
      router.push(getNotificationUrl(notification));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      router.push(getNotificationUrl(notification));
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!user) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) return;

    // Connect to message socket
    const messageSocket = getSocket(token);
    const notificationSocket = getNotificationsSocket(token);

    // Listen for connection events FIRST (before connecting)
    messageSocket.on("connect", () => {
      // Subscribe to user room to receive messages
      messageSocket.emit("subscribe", user.id);
    });

    // If socket exists but not connected, reconnect with token
    if (!messageSocket.connected) {
      messageSocket.auth = { token };
      messageSocket.connect();
    } else {
      // Already connected, subscribe immediately
      messageSocket.emit("subscribe", user.id);
    }

    if (!notificationSocket.connected) {
      notificationSocket.auth = { token };
      notificationSocket.connect();
    } else {
      // Already connected, subscribe immediately
      notificationSocket.emit("subscribe", user.id);
    }

    messageSocket.on("disconnect", () => {
      // Socket disconnected
    });

    // Notification socket connection events FIRST (before connecting)
    notificationSocket.on("connect", () => {
      // Subscribe to user room to receive notifications
      notificationSocket.emit("subscribe", user.id);
    });

    notificationSocket.on("disconnect", () => {
      // Socket disconnected
    });

    // Listen for message read events
    const handleMessageRead = () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    };

    // Listen for notification read events
    const handleNotificationRead = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    };

    // Listen for new messages - backend emits "message" not "newMessage"
    // Invalidate both unread count and conversations list
    const handleNewMessageWithList = () => {
      // Force refetch immediately
      refetchMessagesCount();

      // Also invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
        refetchType: "active",
      });
    };

    // Listen for new notifications
    // Invalidate both unread count and recent notifications list
    const handleNewNotificationWithList = () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] });
    };

    messageSocket.on("message", handleNewMessageWithList);
    messageSocket.on("messageRead", handleMessageRead);
    notificationSocket.on("notification", handleNewNotificationWithList);
    notificationSocket.on("notificationRead", handleNotificationRead);

    return () => {
      // Remove event listeners only, keep sockets connected
      // Sockets are singleton instances that persist across component lifecycle
      messageSocket.off("message", handleNewMessageWithList);
      messageSocket.off("messageRead", handleMessageRead);
      notificationSocket.off("notification", handleNewNotificationWithList);
      notificationSocket.off("notificationRead", handleNotificationRead);
    };
  }, [user, queryClient, refetchMessagesCount]);

  // Show loading state while hydrating to prevent flash of wrong content
  if (!_hasHydrated) {
    return (
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="relative flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">SwapBuds</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur"
      data-testid="navbar"
    >
      <div className="container mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            data-testid="nav-logo"
          >
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SwapBuds</span>
          </Link>

          {/* Desktop Navigation - Show different content based on auth */}
          {user ? (
            <>
              <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
                <Link
                  href="/items"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  data-testid="nav-browse-items"
                >
                  Browse Items
                </Link>
                <Link
                  href="/trades"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  data-testid="nav-my-trades"
                >
                  My Trades
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    data-testid="nav-admin"
                  >
                    Admin
                  </Link>
                )}
                <Button
                  size="sm"
                  className="gap-2"
                  asChild
                  data-testid="nav-list-item"
                >
                  <Link href="/items/new">
                    <Plus className="h-4 w-4" />
                    List Item
                  </Link>
                </Button>
              </div>

              {/* Desktop User Menu */}
              <div className="hidden items-center gap-4 md:flex">
                {/* Messages Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      data-testid="nav-messages-button"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {unreadMessagesCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                        >
                          {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Messages</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {conversations.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No messages yet
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {conversations.slice(0, 5).map((conversation) => (
                          <DropdownMenuItem
                            key={conversation.id}
                            asChild
                            className="cursor-pointer"
                          >
                            <Link
                              href={`/messages/${conversation.id}`}
                              className="flex items-start gap-3 p-3"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={
                                    conversation.otherUser?.avatarUrl ||
                                    undefined
                                  }
                                  alt={
                                    conversation.otherUser?.username || "User"
                                  }
                                />
                                <AvatarFallback>
                                  {conversation.otherUser?.username
                                    .slice(0, 2)
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    {conversation.otherUser?.username}
                                  </p>
                                  {conversation.lastMessageAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatTimeAgo(
                                        conversation.lastMessageAt.toString()
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {conversation.lastMessageContent ||
                                    "No messages yet"}
                                </p>
                                {(conversation.unreadCount ?? 0) > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="h-5 text-xs"
                                  >
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/messages"
                        className="w-full text-center text-sm font-medium text-primary"
                      >
                        View all messages
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      data-testid="nav-notifications-button"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotificationsCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                        >
                          {unreadNotificationsCount > 9
                            ? "9+"
                            : unreadNotificationsCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className="cursor-pointer"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex w-full flex-col gap-1 p-2">
                              <div className="flex items-start justify-between">
                                <p className="text-sm font-medium">
                                  {notification.title}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              {!notification.read && (
                                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/notifications"
                        className="w-full text-center text-sm font-medium text-primary"
                      >
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  data-testid="nav-support-button"
                >
                  <Link href="/support">
                    <HelpCircle className="h-5 w-5" />
                  </Link>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      data-testid="nav-user-menu-button"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.avatarUrl || undefined}
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/items?userId=me">
                        <Package className="mr-2 h-4 w-4" />
                        My Items
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites">
                        <Heart className="mr-2 h-4 w-4" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/verification">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        ID Verification
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/support">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Support
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "ADMIN" ||
                      user.role === "MODERATOR" ||
                      user.role === "SUPPORT") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            /* Anonymous User - Login/Signup buttons */
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild data-testid="nav-login-button">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild data-testid="nav-signup-button">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button - Only for authenticated users */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Mobile Menu - Only for authenticated users */}
        {user && mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                href="/items"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Items
              </Link>
              <Link
                href="/trades"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Trades
              </Link>
              <Link
                href="/items/new"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                List Item
              </Link>
              <hr className="my-2" />
              <Link
                href={`/profile/${user!.username}`}
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Messages
                {unreadMessagesCount > 0 && ` (${unreadMessagesCount})`}
              </Link>
              <Link
                href="/notifications"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications
                {unreadNotificationsCount > 0 &&
                  ` (${unreadNotificationsCount})`}
              </Link>
              <Link
                href="/favorites"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favorites
              </Link>
              <Link
                href="/verification"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                ID Verification
              </Link>
              <Link
                href="/support"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <hr className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              {(user!.role === "ADMIN" ||
                user!.role === "MODERATOR" ||
                user!.role === "SUPPORT") && (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}
              <hr className="my-2" />
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
