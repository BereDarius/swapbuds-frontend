"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api/notifications";
import { useNotificationsSocket } from "@/lib/socket/notifications";
import type { Notification } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Bell, Check, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // WebSocket hooks
  const {
    isConnected,
    onNotification,
    onNotificationRead,
    onNotificationDeleted,
  } = useNotificationsSocket();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Listen for new notifications via WebSocket
  useEffect(() => {
    const unsubscribe = onNotification((newNotification) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
        if (!old) return [newNotification];
        // Avoid duplicates
        const exists = old.some((n) => n.id === newNotification.id);
        if (exists) return old;
        return [newNotification, ...old];
      });
    });
    return unsubscribe;
  }, [onNotification, queryClient]);

  // Listen for notification read events
  useEffect(() => {
    const unsubscribe = onNotificationRead((data) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
        if (!old) return [];
        return old.map((n) =>
          n.id === data.notificationId ? { ...n, read: true } : n,
        );
      });
    });
    return unsubscribe;
  }, [onNotificationRead, queryClient]);

  // Listen for notification deleted events
  useEffect(() => {
    const unsubscribe = onNotificationDeleted((data) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
        if (!old) return [];
        return old.filter((n) => n.id !== data.notificationId);
      });
    });
    return unsubscribe;
  }, [onNotificationDeleted, queryClient]);

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              {unreadNotifications.length > 0
                ? `${unreadNotifications.length} unread notification${
                    unreadNotifications.length > 1 ? "s" : ""
                  }`
                : "You're all caught up!"}
            </p>
            {isConnected && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            )}
          </div>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            We&apos;ll notify you when something happens
          </p>
        </div>
      )}

      {/* Notifications List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isUnread = !notification.read;

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isUnread ? "border-primary" : ""
                }`}
                onClick={() => {
                  if (isUnread) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        isUnread ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`mb-1 ${isUnread ? "font-semibold" : ""}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(notification.createdAt),
                          "MMM d, h:mm a",
                        )}
                      </p>
                      {notification.type && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Type: {notification.type}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
