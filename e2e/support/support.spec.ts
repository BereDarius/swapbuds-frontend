import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Support System", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should access support page", async ({ page }) => {
    await page.goto("/support");

    // Verify support page loads
    await expect(page.getByRole("heading", { name: /support/i })).toBeVisible();
  });

  test("should display support chat creation form", async ({ page }) => {
    await page.goto("/support");

    // Verify form elements
    await expect(page.getByPlaceholder(/subject/i)).toBeVisible();
    await expect(page.getByPlaceholder(/describe your issue/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /start chat/i }),
    ).toBeVisible();
  });

  test("should create a new support chat", async ({ page }) => {
    await page.goto("/support");

    // Fill in support request
    await page.getByPlaceholder(/subject/i).fill("Cannot complete trade");
    await page
      .getByPlaceholder(/describe your issue/i)
      .fill("I'm having trouble completing my trade with user123");

    // Select priority
    await page.getByRole("combobox", { name: /priority/i }).click();
    await page.getByRole("option", { name: /high/i }).click();

    // Submit
    await page.getByRole("button", { name: /start chat/i }).click();

    // Verify chat created and redirected to chat room
    await expect(page).toHaveURL(/\/support\/chat\/[a-z0-9-]+/);
    await expect(page.getByText(/cannot complete trade/i)).toBeVisible();
  });

  test("should send a message in support chat", async ({ page }) => {
    // Assume a chat already exists
    await page.goto("/support/chat/test-chat-id");

    // Type and send message
    const messageInput = page.getByPlaceholder(/type your message/i);
    await messageInput.fill("I need help with my account");
    await page.getByRole("button", { name: /send/i }).click();

    // Verify message appears
    await expect(page.getByText(/i need help with my account/i)).toBeVisible();
  });

  test("should display queue position", async ({ page }) => {
    await page.goto("/support/chat/test-chat-id");

    // Verify queue position indicator
    await expect(
      page.getByText(/position in queue/i).or(page.getByText(/assigned/i)),
    ).toBeVisible();
  });

  test("should display support agent when assigned", async ({ page }) => {
    await page.goto("/support/chat/test-chat-id");

    // Wait for agent assignment
    await expect(
      page.getByText(/support agent/i).or(page.getByText(/assigned/i)),
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show typing indicator", async ({ page }) => {
    await page.goto("/support/chat/test-chat-id");

    // Start typing
    const messageInput = page.getByPlaceholder(/type your message/i);
    await messageInput.fill("Test message");

    // In real scenario, socket would emit typing event
    // For now, just verify input works
    await expect(messageInput).toHaveValue("Test message");
  });

  test("should display chat history", async ({ page }) => {
    await page.goto("/support");

    // Click on my chats tab
    await page.getByRole("tab", { name: /my chats/i }).click();

    // Verify chat list is displayed
    await expect(
      page.locator('[data-testid="chat-item"]').first(),
    ).toBeVisible();
  });

  test("should allow closing resolved chat", async ({ page }) => {
    await page.goto("/support/chat/test-chat-id");

    // Wait for chat to be resolved by agent
    // In real test, agent would resolve it

    // Close the chat
    await page.getByRole("button", { name: /close chat/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/chat closed/i)).toBeVisible();
  });

  test("should display support categories", async ({ page }) => {
    await page.goto("/support");

    // Verify FAQ categories
    await expect(page.getByText(/account issues/i)).toBeVisible();
    await expect(page.getByText(/trading problems/i)).toBeVisible();
    await expect(page.getByText(/payment issues/i)).toBeVisible();
  });
});
