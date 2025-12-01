import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "../fixtures/auth";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should access admin dashboard", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/admin/i).first()).toBeVisible();
  });

  test("should display user management", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByText(/users/i)).toBeVisible();
  });

  test("should allow searching for users", async ({ page }) => {
    await page.goto("/admin/users");

    // Search for user
    const searchInput = page.getByPlaceholder(/search users/i);
    await searchInput.fill("testuser");
    await searchInput.press("Enter");

    // Verify search results appear
    await expect(page.locator("table")).toBeVisible();
  });

  test("should allow banning a user", async ({ page }) => {
    await page.goto("/admin/users");

    // Click on first user's action menu
    await page
      .getByRole("button", { name: /actions/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /ban/i }).click();

    // Fill ban reason
    await page.getByPlaceholder(/reason/i).fill("Terms violation");
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/user banned/i)).toBeVisible();
  });

  test("should allow changing user role", async ({ page }) => {
    await page.goto("/admin/users");

    // Click on first user's action menu
    await page
      .getByRole("button", { name: /actions/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /change role/i }).click();

    // Select new role
    await page.getByRole("combobox", { name: /role/i }).click();
    await page.getByRole("option", { name: /moderator/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success message
    await expect(page.getByText(/role updated/i)).toBeVisible();
  });

  test("should display admin statistics", async ({ page }) => {
    await page.goto("/admin");

    // Verify stats cards are displayed
    await expect(page.getByText(/total users/i)).toBeVisible();
    await expect(page.getByText(/total items/i)).toBeVisible();
    await expect(page.getByText(/total trades/i)).toBeVisible();
  });

  test("should display admin logs", async ({ page }) => {
    await page.goto("/admin/logs");

    // Verify logs table is displayed
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(/action/i)).toBeVisible();
    await expect(page.getByText(/admin/i)).toBeVisible();
  });

  test("should allow filtering logs by date", async ({ page }) => {
    await page.goto("/admin/logs");

    // Open date picker
    await page.getByRole("button", { name: /filter by date/i }).click();

    // Select date range (this week)
    await page.getByText(/this week/i).click();

    // Verify logs are filtered
    await expect(page).toHaveURL(/date=/);
  });
});
