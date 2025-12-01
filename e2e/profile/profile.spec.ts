import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Profile Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display user profile", async ({ page }) => {
    await page.goto("/profile/me");

    // Verify profile information is displayed
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("should allow editing profile", async ({ page }) => {
    await page.goto("/profile/me/edit");

    // Update bio
    const bioInput = page.getByLabel(/bio/i);
    await bioInput.fill("Updated bio text");

    // Save changes
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test("should allow uploading profile picture", async ({ page }) => {
    await page.goto("/profile/me/edit");

    // Click upload button
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("test-files/avatar.jpg");

    // Wait for upload
    await expect(page.getByText(/uploading/i)).toBeVisible();
    await expect(page.getByText(/upload complete/i)).toBeVisible();

    // Save profile
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test("should display user's items", async ({ page }) => {
    await page.goto("/profile/me/items");

    // Verify items tab is active
    await expect(page.getByRole("tab", { name: /items/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Should display user's items
    await expect(page.getByText(/my items/i)).toBeVisible();
  });

  test("should display user's reviews", async ({ page }) => {
    await page.goto("/profile/me/reviews");

    // Verify reviews tab is active
    await expect(page.getByRole("tab", { name: /reviews/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    // Should display reviews
    await expect(page.getByText(/reviews/i)).toBeVisible();
  });

  test("should allow viewing another user's profile", async ({ page }) => {
    await page.goto("/items");

    // Click on an item to see owner
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Click on owner's profile link
    await page.getByRole("link", { name: /view profile/i }).click();

    // Verify we're on another user's profile
    await expect(page).toHaveURL(/\/profile\/[a-z0-9-]+/);
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("should display reputation score", async ({ page }) => {
    await page.goto("/profile/me");

    // Verify reputation score is displayed
    await expect(page.getByText(/reputation/i)).toBeVisible();
  });

  test("should display verification badge for verified users", async ({
    page,
  }) => {
    await page.goto("/profile/me");

    // Should show verification status
    await expect(page.getByText(/verified|not verified/i)).toBeVisible();
  });

  test("should allow reporting a user", async ({ page }) => {
    await page.goto("/items");

    // Click on an item
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Click on owner's profile
    await page.getByRole("link", { name: /view profile/i }).click();

    // Click report button
    await page.getByRole("button", { name: /report/i }).click();

    // Select reason
    await page.getByLabel(/reason/i).click();
    await page.getByRole("option", { name: /spam/i }).click();

    // Add description
    await page.getByLabel(/description/i).fill("This user is spamming");

    // Submit report
    await page.getByRole("button", { name: /submit report/i }).click();

    // Verify success
    await expect(page.getByText(/report submitted/i)).toBeVisible();
  });

  test("should display completed trades count", async ({ page }) => {
    await page.goto("/profile/me");

    // Verify trades count is displayed
    await expect(page.getByText(/trades/i)).toBeVisible();
  });
});

test.describe("Profile - Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("should display settings page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /settings/i })
    ).toBeVisible();
  });

  test("should allow updating email preferences", async ({ page }) => {
    await page.goto("/settings/notifications");

    // Toggle email notifications
    const emailToggle = page.getByRole("switch", {
      name: /email notifications/i,
    });
    await emailToggle.click();

    // Save settings
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/settings saved/i)).toBeVisible();
  });

  test("should allow changing password", async ({ page }) => {
    await page.goto("/settings/security");

    // Fill password change form
    await page.getByLabel(/current password/i).fill("oldpassword");
    await page.getByLabel(/new password/i).fill("newpassword123");
    await page.getByLabel(/confirm password/i).fill("newpassword123");

    // Submit form
    await page.getByRole("button", { name: /change password/i }).click();

    // Verify success
    await expect(page.getByText(/password changed/i)).toBeVisible();
  });

  test("should allow enabling two-factor authentication", async ({ page }) => {
    await page.goto("/settings/security");

    // Click enable 2FA
    await page.getByRole("button", { name: /enable 2fa/i }).click();

    // Should display QR code
    await expect(page.getByText(/scan this qr code/i)).toBeVisible();

    // Enter verification code
    await page.getByLabel(/verification code/i).fill("123456");

    // Confirm
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/2fa enabled/i)).toBeVisible();
  });

  test("should allow deactivating account", async ({ page }) => {
    await page.goto("/settings/account");

    // Click deactivate account
    await page.getByRole("button", { name: /deactivate account/i }).click();

    // Confirm deactivation
    await page.getByRole("button", { name: /confirm deactivation/i }).click();

    // Verify success
    await expect(page.getByText(/account deactivated/i)).toBeVisible();
  });
});
