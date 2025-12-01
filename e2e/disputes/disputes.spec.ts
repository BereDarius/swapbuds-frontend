import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Trade Disputes", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should open dispute from trade page", async ({ page }) => {
    await page.goto("/trades/test-trade-id");

    // Click open dispute button
    await page.getByRole("button", { name: /open dispute/i }).click();

    // Verify dispute form appears
    await expect(
      page.getByRole("heading", { name: /open dispute/i })
    ).toBeVisible();
  });

  test("should select dispute reason", async ({ page }) => {
    await page.goto("/trades/test-trade-id");
    await page.getByRole("button", { name: /open dispute/i }).click();

    // Select reason
    await page.getByRole("combobox", { name: /reason/i }).click();
    await page.getByRole("option", { name: /item not as described/i }).click();

    // Verify selection
    await expect(page.getByText(/item not as described/i)).toBeVisible();
  });

  test("should provide detailed description", async ({ page }) => {
    await page.goto("/trades/test-trade-id");
    await page.getByRole("button", { name: /open dispute/i }).click();

    // Fill description
    const description =
      "The item I received is significantly different from what was shown in the photos.";
    await page.getByPlaceholder(/describe the issue/i).fill(description);

    // Verify text entered
    await expect(page.getByPlaceholder(/describe the issue/i)).toHaveValue(
      description
    );
  });

  test("should submit dispute", async ({ page }) => {
    await page.goto("/trades/test-trade-id");
    await page.getByRole("button", { name: /open dispute/i }).click();

    // Fill out form
    await page.getByRole("combobox", { name: /reason/i }).click();
    await page.getByRole("option", { name: /item damaged/i }).click();
    await page
      .getByPlaceholder(/describe the issue/i)
      .fill("Item arrived damaged during shipping");

    // Submit
    await page.getByRole("button", { name: /submit dispute/i }).click();

    // Verify success
    await expect(page.getByText(/dispute submitted/i)).toBeVisible();
    await expect(page).toHaveURL(/\/disputes\/[a-z0-9-]+/);
  });

  test("should display dispute details", async ({ page }) => {
    await page.goto("/disputes/test-dispute-id");

    // Verify dispute information
    await expect(page.getByText(/dispute/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
    await expect(page.getByText(/reason/i)).toBeVisible();
  });

  test("should show dispute timeline", async ({ page }) => {
    await page.goto("/disputes/test-dispute-id");

    // Verify timeline events
    await expect(page.getByText(/dispute opened/i)).toBeVisible();
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
  });

  test("should display my disputes list", async ({ page }) => {
    await page.goto("/disputes");

    // Verify disputes list
    await expect(
      page.getByRole("heading", { name: /my disputes/i })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="dispute-card"]').first()
    ).toBeVisible();
  });

  test("should filter disputes by status", async ({ page }) => {
    await page.goto("/disputes");

    // Select status filter
    await page.getByRole("combobox", { name: /status/i }).click();
    await page.getByRole("option", { name: /open/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/status=OPEN/);
  });

  test("should display resolution when resolved", async ({ page }) => {
    // Dispute has been resolved
    await page.goto("/disputes/resolved-dispute-id");

    // Verify resolution is shown
    await expect(page.getByText(/resolved/i)).toBeVisible();
    await expect(page.getByText(/resolution/i)).toBeVisible();
  });

  test("should show upload evidence option", async ({ page }) => {
    await page.goto("/disputes/test-dispute-id");

    // Click add evidence button
    await page.getByRole("button", { name: /add evidence/i }).click();

    // Verify upload form
    await expect(page.getByText(/upload supporting documents/i)).toBeVisible();
  });

  test("should display both parties information", async ({ page }) => {
    await page.goto("/disputes/test-dispute-id");

    // Verify both parties are shown
    await expect(page.getByText(/claimant/i)).toBeVisible();
    await expect(page.getByText(/respondent/i)).toBeVisible();
  });

  test("should show admin notes when resolved", async ({ page }) => {
    await page.goto("/disputes/resolved-dispute-id");

    // Verify admin resolution notes
    await expect(
      page.getByText(/admin decision/i).or(page.getByText(/resolution notes/i))
    ).toBeVisible();
  });
});
