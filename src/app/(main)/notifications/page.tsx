"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import { useNotificationsSocket } from "@/lib/socket";
import type { Notification } from "@/types/notification";
import { NotificationType } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  MessageSquare,
  Package,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const queryClient = useQueryClient();
  const { onNotification } = useNotificationsSocket();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => getNotifications(filter === "unread"),
  });

  // Listen for real-time notifications
  useEffect(() => {
    const cleanup = onNotification(() => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return cleanup;
  }, [onNotification, queryClient]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["messages", "unread-count"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE":
        return <MessageSquare className="h-5 w-5" />;
      case "TRADE_UPDATE":
        return <TrendingUp className="h-5 w-5" />;
      case "NEW_REVIEW":
        return <Star className="h-5 w-5" />;
      case "ITEM_UPDATE":
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE":
        return "text-blue-500";
      case "TRADE_UPDATE":
        return "text-green-500";
      case "NEW_REVIEW":
        return "text-yellow-500";
      case "ITEM_UPDATE":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Stay updated with your trades, messages, and activity
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "You'll see notifications here when you have new activity"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
  getColor: (type: string) => string;
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  getColor,
}: NotificationCardProps) {
  const getNotificationLink = () => {
    const metadata = notification.metadata as Record<string, unknown>;

    switch (notification.type) {
      case NotificationType.NEW_MESSAGE:
        return `/messages/${metadata?.conversationId}`;
      case NotificationType.TRADE_PROPOSAL:
      case NotificationType.TRADE_ACCEPTED:
      case NotificationType.TRADE_REJECTED:
      case NotificationType.TRADE_COMPLETED:
      case NotificationType.TRADE_CANCELLED:
        return `/trades/${metadata?.tradeId}`;
      case NotificationType.REVIEW_RECEIVED:
        return `/profile/${metadata?.reviewerUsername}`;
      case NotificationType.ITEM_LIKED:
      case NotificationType.ITEM_COMMENTED:
        return `/items/${metadata?.itemId}`;
      default:
        return null;
    }
  };

  const link = getNotificationLink();
  const content = (
    <Card
      className={`transition-colors hover:bg-accent/50 ${
        !notification.read ? "bg-accent/20 border-primary/20" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`shrink-0 ${getColor(notification.type)} mt-1`}>
            {getIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm">
                {notification.title}
                {!notification.read && (
                  <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full" />
                )}
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  onMarkAsRead(notification.id);
                }}
                title="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                onDelete(notification.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
