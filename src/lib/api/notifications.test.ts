/**
 * Notifications API Client Tests
 */

import {
  NotificationType,
  type Notification,
  type NotificationPreferences,
} from "@/types/notification";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import * as notificationsApi from "./notifications";

// Mock the api module
vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

describe("Notifications API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNotification: Notification = {
    id: "notif-1",
    type: NotificationType.TRADE_ACCEPTED,
    title: "Trade Accepted",
    message: "Your trade was accepted",
    read: false,
    metadata: { tradeId: "trade-1" },
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockPreferences: NotificationPreferences = {
    id: "pref-1",
    userId: "user-1",
    emailTradeUpdates: true,
    emailMessages: true,
    emailComments: true,
    emailReviews: true,
    emailMarketing: false,
    emailSystemUpdates: true,
    pushTradeUpdates: true,
    pushMessages: true,
    pushComments: true,
    pushReviews: true,
    emailDigestFrequency: "REALTIME",
    pushDigestFrequency: "REALTIME",
  };

  describe("getNotifications", () => {
    it("should fetch all notifications", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockNotification],
      } as AxiosResponse);

      const result = await notificationsApi.getNotifications();

      expect(api.get).toHaveBeenCalledWith("/notifications", {
        params: { unreadOnly: undefined },
      });
      expect(result).toEqual([mockNotification]);
    });

    it("should fetch only unread notifications", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: [mockNotification],
      } as AxiosResponse);

      const result = await notificationsApi.getNotifications(true);

      expect(api.get).toHaveBeenCalledWith("/notifications", {
        params: { unreadOnly: true },
      });
      expect(result).toEqual([mockNotification]);
    });
  });

  describe("getNotificationUnreadCount", () => {
    it("should fetch unread notification count", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { count: 5 },
      } as AxiosResponse);

      const result = await notificationsApi.getNotificationUnreadCount();

      expect(api.get).toHaveBeenCalledWith("/notifications/unread-count");
      expect(result).toBe(5);
    });
  });

  describe("getNotificationUnreadCountExcludingMessages", () => {
    it("should fetch unread count excluding message notifications", async () => {
      const notifications = [
        { ...mockNotification, type: NotificationType.TRADE_ACCEPTED },
        {
          ...mockNotification,
          id: "notif-2",
          type: NotificationType.NEW_MESSAGE,
        },
        {
          ...mockNotification,
          id: "notif-3",
          type: NotificationType.REVIEW_RECEIVED,
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        data: notifications,
      } as AxiosResponse);

      const result =
        await notificationsApi.getNotificationUnreadCountExcludingMessages();

      expect(api.get).toHaveBeenCalledWith("/notifications", {
        params: { unreadOnly: true },
      });
      expect(result).toBe(2); // Should exclude NEW_MESSAGE notification
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark a notification as read", async () => {
      const readNotification = { ...mockNotification, read: true };

      vi.mocked(api.patch).mockResolvedValue({
        data: readNotification,
      } as AxiosResponse);

      const result = await notificationsApi.markNotificationAsRead("notif-1");

      expect(api.patch).toHaveBeenCalledWith("/notifications/notif-1/read");
      expect(result).toEqual(readNotification);
    });
  });

  describe("markAllNotificationsAsRead", () => {
    it("should mark all notifications as read", async () => {
      vi.mocked(api.patch).mockResolvedValue({
        data: { count: 5 },
      } as AxiosResponse);

      const result = await notificationsApi.markAllNotificationsAsRead();

      expect(api.patch).toHaveBeenCalledWith("/notifications/read-all");
      expect(result).toEqual({ count: 5 });
    });
  });

  describe("deleteNotification", () => {
    it("should delete a notification", async () => {
      vi.mocked(api.delete).mockResolvedValue({
        data: { message: "Notification deleted successfully" },
      } as AxiosResponse);

      const result = await notificationsApi.deleteNotification("notif-1");

      expect(api.delete).toHaveBeenCalledWith("/notifications/notif-1");
      expect(result).toEqual({ message: "Notification deleted successfully" });
    });
  });

  describe("getNotificationPreferences", () => {
    it("should fetch notification preferences", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockPreferences,
      } as AxiosResponse);

      const result = await notificationsApi.getNotificationPreferences();

      expect(api.get).toHaveBeenCalledWith("/notifications/preferences");
      expect(result).toEqual(mockPreferences);
    });
  });

  describe("updateNotificationPreferences", () => {
    it("should update notification preferences", async () => {
      const updates = { emailTradeUpdates: false, pushTradeUpdates: false };
      const updatedPreferences = { ...mockPreferences, ...updates };

      vi.mocked(api.put).mockResolvedValue({
        data: updatedPreferences,
      } as AxiosResponse);

      const result =
        await notificationsApi.updateNotificationPreferences(updates);

      expect(api.put).toHaveBeenCalledWith(
        "/notifications/preferences",
        updates
      );
      expect(result).toEqual(updatedPreferences);
    });
  });
});
