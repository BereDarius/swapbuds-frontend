import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Item Comments", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display comments on item page", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Scroll to comments section
    await page
      .getByRole("heading", { name: /comments/i })
      .scrollIntoViewIfNeeded();

    // Verify comments section
    await expect(
      page.getByRole("heading", { name: /comments/i }),
    ).toBeVisible();
  });

  test("should write a comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Find comment input
    const commentInput = page.getByPlaceholder(/add a comment/i);
    await commentInput.fill("Is this item still available?");

    // Submit comment
    await page.getByRole("button", { name: /post comment/i }).click();

    // Verify comment appears
    await expect(page.getByText(/is this item still available/i)).toBeVisible();
  });

  test("should reply to a comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click reply on first comment
    await page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /reply/i })
      .click();

    // Write reply
    await page.getByPlaceholder(/write a reply/i).fill("Yes, it is!");
    await page.getByRole("button", { name: /post reply/i }).click();

    // Verify reply appears
    await expect(page.getByText(/yes, it is/i)).toBeVisible();
  });

  test("should like a comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click like button on first comment
    const likeButton = page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /like/i });

    await likeButton.click();

    // Verify like count increased
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should unlike a comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Like then unlike
    const likeButton = page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /like/i });

    await likeButton.click(); // Like
    await likeButton.click(); // Unlike

    // Verify unlike
    await expect(likeButton).toHaveAttribute("aria-pressed", "false");
  });

  test("should edit own comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click edit on own comment
    await page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /edit/i })
      .click();

    // Modify text
    const editInput = page.getByPlaceholder(/edit comment/i);
    await editInput.clear();
    await editInput.fill("Updated comment text");
    await page.getByRole("button", { name: /save/i }).click();

    // Verify updated text
    await expect(page.getByText(/updated comment text/i)).toBeVisible();
    await expect(page.getByText(/edited/i)).toBeVisible();
  });

  test("should delete own comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click delete on own comment
    await page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /delete/i })
      .click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify comment removed
    await expect(page.getByText(/comment deleted/i)).toBeVisible();
  });

  test("should flag inappropriate comment", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click flag on a comment
    await page
      .locator('[data-testid="comment-card"]')
      .first()
      .getByRole("button", { name: /flag/i })
      .click();

    // Select reason
    await page.getByRole("combobox", { name: /reason/i }).click();
    await page.getByRole("option", { name: /spam/i }).click();

    // Add description
    await page
      .getByPlaceholder(/additional details/i)
      .fill("This is a spam comment");

    // Submit flag
    await page.getByRole("button", { name: /submit/i }).click();

    // Verify success
    await expect(page.getByText(/comment flagged/i)).toBeVisible();
  });

  test("should display nested replies", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Find comment with replies
    const commentWithReplies = page
      .locator('[data-testid="comment-card"]')
      .filter({ hasText: /replies/i })
      .first();

    // Verify replies are visible or expandable
    await expect(commentWithReplies.getByText(/reply/i)).toBeVisible();
  });

  test("should load more comments", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Scroll to load more button
    const loadMoreButton = page.getByRole("button", { name: /load more/i });
    await loadMoreButton.scrollIntoViewIfNeeded();
    await loadMoreButton.click();

    // Verify more comments loaded
    const commentCount = await page
      .locator('[data-testid="comment-card"]')
      .count();
    expect(commentCount).toBeGreaterThanOrEqual(5);
  });

  test("should display comment count", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Verify comment count is shown
    await expect(page.getByText(/\d+ comments?/i)).toBeVisible();
  });

  test("should sort comments by newest", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click sort dropdown
    await page.getByRole("combobox", { name: /sort/i }).click();
    await page.getByRole("option", { name: /newest/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/sort=newest/);
  });

  test("should sort comments by most liked", async ({ page }) => {
    await page.goto("/items/test-item-id");

    // Click sort dropdown
    await page.getByRole("combobox", { name: /sort/i }).click();
    await page.getByRole("option", { name: /most liked/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/sort=likes/);
  });
});
