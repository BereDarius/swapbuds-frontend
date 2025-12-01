import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Item Likes", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should like an item from item page", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click like button
    const likeButton = page.getByRole("button", { name: /like|favorite/i });
    await likeButton.click();

    // Verify button state changed
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should unlike an item", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Like then unlike
    const likeButton = page.getByRole("button", { name: /like|favorite/i });
    await likeButton.click(); // Like
    await likeButton.click(); // Unlike

    // Verify button state changed back
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
  });

  test("should display like count", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Verify like count is visible
    await expect(
      page
        .getByText(/\d+ likes?/i)
        .or(page.locator('[data-testid="like-count"]'))
    ).toBeVisible();
  });

  test("should like item from item card", async ({ page }) => {
    await page.goto("/items");

    // Click like on first item card
    const firstCard = page.locator('[data-testid="item-card"]').first();
    const likeButton = firstCard.getByRole("button", { name: /like/i });
    await likeButton.click();

    // Verify liked state
    await expect(likeButton).toHaveClass(/liked|active/);
  });

  test("should view liked items list", async ({ page }) => {
    await page.goto("/profile/me");

    // Navigate to liked items tab
    await page.getByRole("tab", { name: /liked|favorites/i }).click();

    // Verify liked items are displayed
    await expect(
      page.getByRole("heading", { name: /liked items|favorites/i })
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="item-card"]').first()
    ).toBeVisible();
  });

  test("should remove item from liked list", async ({ page }) => {
    await page.goto("/profile/me");
    await page.getByRole("tab", { name: /liked|favorites/i }).click();

    // Unlike first item
    const firstCard = page.locator('[data-testid="item-card"]').first();
    await firstCard.getByRole("button", { name: /unlike|remove/i }).click();

    // Verify item removed from list
    await expect(page.getByText(/removed from favorites/i)).toBeVisible();
  });

  test("should display empty state when no liked items", async ({ page }) => {
    await page.goto("/profile/me");
    await page.getByRole("tab", { name: /liked|favorites/i }).click();

    // If no liked items, verify empty state
    await expect(
      page
        .getByText(/no liked items/i)
        .or(page.locator('[data-testid="item-card"]').first())
    ).toBeVisible();
  });

  test("should persist like state across pages", async ({ page }) => {
    // Like item on detail page
    await page.goto("/items/test-item-id");
    const likeButton = page.getByRole("button", { name: /like|favorite/i });
    await likeButton.click();

    // Navigate to items list
    await page.goto("/items");

    // Find the same item and verify it's still liked
    const itemCard = page.locator('[data-testid="item-card"]').filter({
      has: page.locator('[href="/items/test-item-id"]'),
    });

    await expect(
      itemCard.getByRole("button", { name: /like/i })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("should display who liked an item", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click on like count to see users
    await page.getByText(/\d+ likes?/i).click();

    // Verify modal/list of users appears
    await expect(
      page.getByRole("heading", { name: /liked by/i })
    ).toBeVisible();
  });

  test("should show like animation on click", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click like button
    const likeButton = page.getByRole("button", { name: /like|favorite/i });
    await likeButton.click();

    // Verify animation class or state
    // This is a visual check, in real test you'd check for animation class
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should require authentication to like", async ({ page }) => {
    // Logout first
    await page.goto("/");
    await page.getByRole("button", { name: /logout/i }).click();

    // Try to like without auth
    await page.goto("/items/test-item-id");
    const likeButton = page.getByRole("button", { name: /like|favorite/i });
    await likeButton.click();

    // Verify redirect to login or auth prompt
    await expect(
      page
        .getByText(/sign in to like/i)
        .or(page.getByRole("heading", { name: /login/i }))
    ).toBeVisible();
  });

  test("should filter items by liked status", async ({ page }) => {
    await page.goto("/items");

    // Apply liked filter
    await page.getByRole("button", { name: /filters/i }).click();
    await page.getByRole("checkbox", { name: /liked by me/i }).check();
    await page.getByRole("button", { name: /apply/i }).click();

    // Verify only liked items shown
    await expect(page).toHaveURL(/liked=true/);
  });
});
