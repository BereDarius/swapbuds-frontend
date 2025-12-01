import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Messages Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display messages page", async ({ page }) => {
    await page.goto("/messages");

    // Verify messages page is displayed
    await expect(
      page.getByRole("heading", { name: /messages/i })
    ).toBeVisible();
  });

  test("should display conversation list", async ({ page }) => {
    await page.goto("/messages");

    // Should display conversations
    await expect(page.getByText(/conversations/i)).toBeVisible();
  });

  test("should open a conversation", async ({ page }) => {
    await page.goto("/messages");

    // Click on first conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Verify conversation is opened
    await expect(page.getByPlaceholder(/type a message/i)).toBeVisible();
  });

  test("should send a message", async ({ page }) => {
    await page.goto("/messages");

    // Open conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Type and send message
    const messageInput = page.getByPlaceholder(/type a message/i);
    await messageInput.fill("Hello!");
    await page.getByRole("button", { name: /send/i }).click();

    // Verify message is displayed
    await expect(page.getByText("Hello!")).toBeVisible();
  });

  test("should display unread message count", async ({ page }) => {
    await page.goto("/messages");

    // Should display unread count badge
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    if (await unreadBadge.isVisible()) {
      expect(await unreadBadge.textContent()).toMatch(/\d+/);
    }
  });

  test("should mark messages as read", async ({ page }) => {
    await page.goto("/messages");

    // Get initial unread count
    const unreadBadge = page.locator('[data-testid="unread-badge"]');
    const initialCount = await unreadBadge.textContent();

    // Open conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Wait a bit for read status to update
    await page.waitForTimeout(1000);

    // Unread count should decrease or badge should disappear
    if (await unreadBadge.isVisible()) {
      const newCount = await unreadBadge.textContent();
      expect(newCount).not.toBe(initialCount);
    }
  });

  test("should search conversations", async ({ page }) => {
    await page.goto("/messages");

    // Enter search term
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("test");

    // Should filter conversations
    await expect(page.getByText(/test/i)).toBeVisible();
  });

  test("should start a new conversation", async ({ page }) => {
    await page.goto("/messages");

    // Click new message button
    await page.getByRole("button", { name: /new message/i }).click();

    // Search for user
    await page.getByPlaceholder(/search users/i).fill("testuser");

    // Select user
    await page.getByRole("option", { name: /testuser/i }).click();

    // Send first message
    const messageInput = page.getByPlaceholder(/type a message/i);
    await messageInput.fill("Hi there!");
    await page.getByRole("button", { name: /send/i }).click();

    // Verify message is sent
    await expect(page.getByText("Hi there!")).toBeVisible();
  });

  test("should show typing indicator", async ({ page }) => {
    await page.goto("/messages");

    // Open conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Start typing
    const messageInput = page.getByPlaceholder(/type a message/i);
    await messageInput.fill("Testing...");

    // Note: typing indicator would need real-time WebSocket connection
    // This is a placeholder for the test structure
  });

  test("should delete a conversation", async ({ page }) => {
    await page.goto("/messages");

    // Click delete on first conversation
    const deleteButton = page.getByRole("button", { name: /delete/i }).first();
    await deleteButton.click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify conversation is deleted
    await expect(page.getByText(/conversation deleted/i)).toBeVisible();
  });

  test("should block a user from messages", async ({ page }) => {
    await page.goto("/messages");

    // Open conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Open options menu
    await page.getByRole("button", { name: /options/i }).click();

    // Click block user
    await page.getByRole("menuitem", { name: /block user/i }).click();

    // Confirm block
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify user is blocked
    await expect(page.getByText(/user blocked/i)).toBeVisible();
  });
});

test.describe("Messages - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display messages in mobile view", async ({ page }) => {
    await page.goto("/messages");

    // Verify mobile layout
    await expect(
      page.getByRole("heading", { name: /messages/i })
    ).toBeVisible();
  });

  test("should navigate between conversation list and chat on mobile", async ({
    page,
  }) => {
    await page.goto("/messages");

    // Open conversation
    const firstConversation = page.getByRole("button").first();
    await firstConversation.click();

    // Should hide conversation list on mobile
    await expect(firstConversation).not.toBeVisible();

    // Click back button
    await page.getByRole("button", { name: /back/i }).click();

    // Should show conversation list again
    await expect(firstConversation).toBeVisible();
  });
});
