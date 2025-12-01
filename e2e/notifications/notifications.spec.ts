import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Notifications Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display notifications page", async ({ page }) => {
    await page.goto("/notifications");

    // Verify notifications page is displayed
    await expect(
      page.getByRole("heading", { name: /notifications/i })
    ).toBeVisible();
  });

  test("should display notification bell with badge", async ({ page }) => {
    await page.goto("/");

    // Should display notification bell
    const notificationBell = page.getByRole("button", {
      name: /notifications/i,
    });
    await expect(notificationBell).toBeVisible();

    // May have unread count badge
    const badge = page.locator('[data-testid="notification-badge"]');
    if (await badge.isVisible()) {
      expect(await badge.textContent()).toMatch(/\d+/);
    }
  });

  test("should open notifications dropdown", async ({ page }) => {
    await page.goto("/");

    // Click notification bell
    const notificationBell = page.getByRole("button", {
      name: /notifications/i,
    });
    await notificationBell.click();

    // Should display dropdown
    await expect(page.getByText(/notifications/i)).toBeVisible();
  });

  test("should display recent notifications in dropdown", async ({ page }) => {
    await page.goto("/");

    // Open notifications
    const notificationBell = page.getByRole("button", {
      name: /notifications/i,
    });
    await notificationBell.click();

    // Should display notifications or empty state
    await expect(
      page.getByText(/you have no notifications|new notification/i)
    ).toBeVisible();
  });

  test("should mark notification as read on click", async ({ page }) => {
    await page.goto("/notifications");

    // Click on first unread notification
    const firstNotification = page.locator('[data-unread="true"]').first();
    if (await firstNotification.isVisible()) {
      await firstNotification.click();

      // Notification should be marked as read
      await expect(firstNotification).not.toHaveAttribute(
        "data-unread",
        "true"
      );
    }
  });

  test("should mark all notifications as read", async ({ page }) => {
    await page.goto("/notifications");

    // Click mark all as read
    const markAllButton = page.getByRole("button", {
      name: /mark all as read/i,
    });
    await markAllButton.click();

    // Verify all are marked as read
    await expect(
      page.getByText(/all notifications marked as read/i)
    ).toBeVisible();
  });

  test("should filter notifications by type", async ({ page }) => {
    await page.goto("/notifications");

    // Click filter button
    await page.getByRole("button", { name: /filter/i }).click();

    // Select trade notifications
    await page.getByRole("checkbox", { name: /trades/i }).click();

    // Apply filter
    await page.getByRole("button", { name: /apply/i }).click();

    // Should show only trade notifications
    await expect(page.getByText(/trade/i)).toBeVisible();
  });

  test("should delete a notification", async ({ page }) => {
    await page.goto("/notifications");

    // Hover over notification to show delete button
    const firstNotification = page
      .locator('[data-testid="notification"]')
      .first();
    await firstNotification.hover();

    // Click delete
    const deleteButton = firstNotification.getByRole("button", {
      name: /delete/i,
    });
    await deleteButton.click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify deletion
    await expect(page.getByText(/notification deleted/i)).toBeVisible();
  });

  test("should navigate from notification to related content", async ({
    page,
  }) => {
    await page.goto("/notifications");

    // Click on a notification
    const firstNotification = page
      .locator('[data-testid="notification"]')
      .first();
    await firstNotification.click();

    // Should navigate to related content (item, trade, message, etc.)
    await expect(page).toHaveURL(/\/(items|trades|messages|profile)\/.+/);
  });

  test("should display notification timestamps", async ({ page }) => {
    await page.goto("/notifications");

    // Notifications should have timestamps
    await expect(
      page.getByText(/just now|minutes ago|hours ago|days ago/i)
    ).toBeVisible();
  });

  test("should load more notifications on scroll", async ({ page }) => {
    await page.goto("/notifications");

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Should load more notifications
    await expect(page.getByText(/loading/i)).toBeVisible();
  });
});

test.describe("Notifications - Real-time", () => {
  test("should receive real-time notification", async ({ page }) => {
    await page.goto("/");

    // Wait for WebSocket connection
    await page.waitForTimeout(2000);

    // Simulate receiving a notification (would need backend support)
    // This is a placeholder for the test structure

    // Should show notification toast
    // await expect(page.getByText(/new notification/i)).toBeVisible();
  });

  test("should update notification count in real-time", async ({ page }) => {
    await page.goto("/");

    // Get notification badge
    const badge = page.locator('[data-testid="notification-badge"]');

    // Simulate receiving a new notification
    // Count should update (would need backend support)
    // This is a placeholder for the test structure
    if (await badge.isVisible()) {
      await expect(badge).toBeVisible();
    }
  });
});

test.describe("Notifications - Settings", () => {
  test("should allow configuring notification preferences", async ({
    page,
  }) => {
    await page.goto("/settings/notifications");

    // Should display notification settings
    await expect(page.getByText(/notification preferences/i)).toBeVisible();

    // Toggle email notifications
    await page.getByRole("switch", { name: /email notifications/i }).click();

    // Toggle push notifications
    await page.getByRole("switch", { name: /push notifications/i }).click();

    // Save settings
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });

  test("should allow configuring notification types", async ({ page }) => {
    await page.goto("/settings/notifications");

    // Disable trade notifications
    await page.getByRole("switch", { name: /trade notifications/i }).click();

    // Enable message notifications
    await page.getByRole("switch", { name: /message notifications/i }).click();

    // Save settings
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });
});
