import type {
  Notification,
  NotificationPreferences,
} from "@/types/notification";
import api from "../api";

// Get all notifications for the current user
export async function getNotifications(
  unreadOnly?: boolean
): Promise<Notification[]> {
  const response = await api.get("/notifications", {
    params: { unreadOnly },
  });
  return response.data;
}

// Get unread notification count
export async function getNotificationUnreadCount(): Promise<number> {
  const response = await api.get("/notifications/unread-count");
  return response.data.count;
}

// Get unread notification count (excluding NEW_MESSAGE notifications)
// NEW_MESSAGE notifications are shown in the messages badge, not notifications bell
export async function getNotificationUnreadCountExcludingMessages(): Promise<number> {
  const response = await api.get("/notifications", {
    params: { unreadOnly: true },
  });
  const notifications = response.data as Array<{ type: string }>;
  // Filter out NEW_MESSAGE notifications
  const nonMessageNotifications = notifications.filter(
    (n) => n.type !== "NEW_MESSAGE"
  );
  return nonMessageNotifications.length;
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const response = await api.patch("/notifications/read-all");
  return response.data;
}

// Delete a notification
export async function deleteNotification(
  notificationId: string
): Promise<{ message: string }> {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
}

// Get notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await api.get("/notifications/preferences");
  return response.data;
}

// Update notification preferences
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await api.put("/notifications/preferences", preferences);
  return response.data;
}
