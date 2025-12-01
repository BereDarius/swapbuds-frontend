import { expect, test } from "@playwright/test";
import { loginAsModerator } from "../fixtures/auth";

test.describe("Content Moderation", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsModerator(page);
  });

  test("should access moderation dashboard", async ({ page }) => {
    await page.goto("/moderation");

    // Verify moderation page loads
    await expect(
      page.getByRole("heading", { name: /moderation/i }),
    ).toBeVisible();
  });

  test("should display flagged content", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Verify flags list is displayed
    await expect(page.getByText(/flagged content/i)).toBeVisible();
    await expect(
      page.locator('[data-testid="flag-card"]').first(),
    ).toBeVisible();
  });

  test("should allow filtering flags by type", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Filter by items
    await page.getByRole("button", { name: /filter/i }).click();
    await page.getByRole("checkbox", { name: /items/i }).check();
    await page.getByRole("button", { name: /apply/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/type=ITEM/);
  });

  test("should allow filtering flags by status", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Select pending status
    await page.getByRole("combobox", { name: /status/i }).click();
    await page.getByRole("option", { name: /pending/i }).click();

    // Verify only pending flags shown
    await expect(page).toHaveURL(/status=PENDING/);
  });

  test("should allow approving a flag", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Click on first flag
    await page.locator('[data-testid="flag-card"]').first().click();

    // Approve the flag
    await page.getByRole("button", { name: /approve/i }).click();
    await page.getByPlaceholder(/notes/i).fill("No violation found");
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/flag approved/i)).toBeVisible();
  });

  test("should allow rejecting a flag", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Click on first flag
    await page.locator('[data-testid="flag-card"]').first().click();

    // Reject the flag
    await page.getByRole("button", { name: /reject/i }).click();
    await page.getByPlaceholder(/reason/i).fill("Not applicable");
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/flag rejected/i)).toBeVisible();
  });

  test("should allow removing flagged content", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Click on first flag
    await page.locator('[data-testid="flag-card"]').first().click();

    // Remove the content
    await page.getByRole("button", { name: /remove content/i }).click();
    await page.getByPlaceholder(/reason/i).fill("Policy violation");
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/content removed/i)).toBeVisible();
  });

  test("should display moderation statistics", async ({ page }) => {
    await page.goto("/moderation");

    // Verify stats are displayed
    await expect(page.getByText(/pending flags/i)).toBeVisible();
    await expect(page.getByText(/resolved today/i)).toBeVisible();
    await expect(page.getByText(/removal rate/i)).toBeVisible();
  });

  test("should allow bulk approving flags", async ({ page }) => {
    await page.goto("/moderation/flags");

    // Select multiple flags
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("checkbox").nth(2).check();

    // Bulk approve
    await page.getByRole("button", { name: /bulk actions/i }).click();
    await page.getByRole("menuitem", { name: /approve selected/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/flags approved/i)).toBeVisible();
  });
});
