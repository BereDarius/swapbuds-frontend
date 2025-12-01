import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("User Reviews", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should prompt for review after completed trade", async ({ page }) => {
    await page.goto("/trades/completed-trade-id");

    // Verify review prompt appears
    await expect(page.getByText(/leave a review/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /write review/i })
    ).toBeVisible();
  });

  test("should open review form", async ({ page }) => {
    await page.goto("/trades/completed-trade-id");

    // Click write review button
    await page.getByRole("button", { name: /write review/i }).click();

    // Verify form appears
    await expect(page.getByRole("heading", { name: /review/i })).toBeVisible();
  });

  test("should select star rating", async ({ page }) => {
    await page.goto("/reviews/new?tradeId=test-trade-id");

    // Click on 5 stars
    await page.locator('[data-testid="star-5"]').click();

    // Verify selection
    await expect(page.locator('[data-testid="star-5"]')).toHaveClass(/filled/);
  });

  test("should write review text", async ({ page }) => {
    await page.goto("/reviews/new?tradeId=test-trade-id");

    // Write review
    const reviewText =
      "Great trader! Item was exactly as described and shipping was fast.";
    await page.getByPlaceholder(/share your experience/i).fill(reviewText);

    // Verify text entered
    await expect(page.getByPlaceholder(/share your experience/i)).toHaveValue(
      reviewText
    );
  });

  test("should submit review", async ({ page }) => {
    await page.goto("/reviews/new?tradeId=test-trade-id");

    // Fill out form
    await page.locator('[data-testid="star-5"]').click();
    await page
      .getByPlaceholder(/share your experience/i)
      .fill("Excellent trader, highly recommended!");

    // Submit
    await page.getByRole("button", { name: /submit review/i }).click();

    // Verify success
    await expect(page.getByText(/review submitted/i)).toBeVisible();
  });

  test("should display user reviews on profile", async ({ page }) => {
    await page.goto("/profile/testuser");

    // Navigate to reviews tab
    await page.getByRole("tab", { name: /reviews/i }).click();

    // Verify reviews are displayed
    await expect(
      page.locator('[data-testid="review-card"]').first()
    ).toBeVisible();
  });

  test("should display average rating", async ({ page }) => {
    await page.goto("/profile/testuser");

    // Verify rating is shown
    await expect(page.getByText(/rating/i)).toBeVisible();
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
  });

  test("should display review statistics", async ({ page }) => {
    await page.goto("/profile/testuser");
    await page.getByRole("tab", { name: /reviews/i }).click();

    // Verify stats
    await expect(page.getByText(/total reviews/i)).toBeVisible();
    await expect(page.getByText(/5 star/i)).toBeVisible();
    await expect(page.getByText(/4 star/i)).toBeVisible();
  });

  test("should filter reviews by rating", async ({ page }) => {
    await page.goto("/profile/testuser");
    await page.getByRole("tab", { name: /reviews/i }).click();

    // Filter by 5 stars
    await page.getByRole("button", { name: /5 stars/i }).click();

    // Verify filtered results
    await expect(page).toHaveURL(/rating=5/);
  });

  test("should allow editing own review", async ({ page }) => {
    await page.goto("/profile/me");
    await page.getByRole("tab", { name: /reviews given/i }).click();

    // Click edit on first review
    await page
      .locator('[data-testid="review-card"]')
      .first()
      .getByRole("button", { name: /edit/i })
      .click();

    // Verify edit form appears
    await expect(
      page.getByRole("heading", { name: /edit review/i })
    ).toBeVisible();
  });

  test("should allow deleting own review", async ({ page }) => {
    await page.goto("/profile/me");
    await page.getByRole("tab", { name: /reviews given/i }).click();

    // Click delete on first review
    await page
      .locator('[data-testid="review-card"]')
      .first()
      .getByRole("button", { name: /delete/i })
      .click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/review deleted/i)).toBeVisible();
  });

  test("should display reviews received", async ({ page }) => {
    await page.goto("/profile/me");

    // Navigate to reviews received tab
    await page.getByRole("tab", { name: /reviews received/i }).click();

    // Verify reviews are shown
    await expect(
      page.locator('[data-testid="review-card"]').first()
    ).toBeVisible();
  });

  test("should validate review length", async ({ page }) => {
    await page.goto("/reviews/new?tradeId=test-trade-id");

    // Try to submit with short review
    await page.locator('[data-testid="star-5"]').click();
    await page.getByPlaceholder(/share your experience/i).fill("Good");
    await page.getByRole("button", { name: /submit review/i }).click();

    // Verify validation error
    await expect(page.getByText(/review must be at least/i)).toBeVisible();
  });
});
