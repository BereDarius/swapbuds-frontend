import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Items Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display items list", async ({ page }) => {
    await page.goto("/items");

    // Check that items are displayed
    await expect(page.getByText(/items/i)).toBeVisible();
  });

  test("should allow filtering items by category", async ({ page }) => {
    await page.goto("/items");

    // Click on Electronics category filter
    await page.getByRole("button", { name: /electronics/i }).click();

    // Verify URL updated with filter
    await expect(page).toHaveURL(/category=ELECTRONICS/);
  });

  test("should allow searching for items", async ({ page }) => {
    await page.goto("/items");

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill("laptop");
    await searchInput.press("Enter");

    // Verify search results
    await expect(page).toHaveURL(/search=laptop/);
  });

  test("should display item details", async ({ page }) => {
    await page.goto("/items");

    // Click on first item
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Verify we're on item detail page
    await expect(page).toHaveURL(/\/items\/[a-z0-9-]+/);

    // Verify item details are displayed
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("should allow creating a new item", async ({ page }) => {
    await page.goto("/items/new");

    // Fill in item form
    await page.getByLabel(/title/i).fill("Test Item");
    await page.getByLabel(/description/i).fill("Test Description");

    // Select category
    await page.getByLabel(/category/i).click();
    await page.getByRole("option", { name: /electronics/i }).click();

    // Select condition
    await page.getByLabel(/condition/i).click();
    await page.getByRole("option", { name: /new/i }).click();

    // Enter estimated value
    await page.getByLabel(/estimated value/i).fill("100");

    // Submit form
    await page.getByRole("button", { name: /create item/i }).click();

    // Verify success
    await expect(page.getByText(/item created/i)).toBeVisible();
  });

  test("should validate item creation form", async ({ page }) => {
    await page.goto("/items/new");

    // Try to submit empty form
    await page.getByRole("button", { name: /create item/i }).click();

    // Verify validation errors
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
  });

  test("should allow editing own item", async ({ page }) => {
    await page.goto("/profile/me/items");

    // Click edit on first item
    const editButton = page.getByRole("button", { name: /edit/i }).first();
    await editButton.click();

    // Verify we're on edit page
    await expect(page).toHaveURL(/\/items\/[a-z0-9-]+\/edit/);

    // Update title
    const titleInput = page.getByLabel(/title/i);
    await titleInput.fill("Updated Title");

    // Save changes
    await page.getByRole("button", { name: /save/i }).click();

    // Verify success
    await expect(page.getByText(/item updated/i)).toBeVisible();
  });

  test("should allow deleting own item", async ({ page }) => {
    await page.goto("/profile/me/items");

    // Click delete on first item
    const deleteButton = page.getByRole("button", { name: /delete/i }).first();
    await deleteButton.click();

    // Confirm deletion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/item deleted/i)).toBeVisible();
  });

  test("should allow liking an item", async ({ page }) => {
    await page.goto("/items");

    // Click on first item
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Click like button
    const likeButton = page.getByRole("button", { name: /like/i });
    await likeButton.click();

    // Verify item is liked
    await expect(likeButton).toHaveAttribute("aria-pressed", "true");
  });

  test("should allow commenting on an item", async ({ page }) => {
    await page.goto("/items");

    // Click on first item
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Scroll to comments section
    await page
      .getByRole("heading", { name: /comments/i })
      .scrollIntoViewIfNeeded();

    // Add a comment
    const commentInput = page.getByPlaceholder(/add a comment/i);
    await commentInput.fill("Great item!");
    await page.getByRole("button", { name: /post comment/i }).click();

    // Verify comment is displayed
    await expect(page.getByText("Great item!")).toBeVisible();
  });
});

test.describe("Items - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display items in mobile view", async ({ page }) => {
    await page.goto("/items");

    // Verify mobile layout
    await expect(page.getByText(/items/i)).toBeVisible();
  });

  test("should open mobile filter menu", async ({ page }) => {
    await page.goto("/items");

    // Click filter button
    await page.getByRole("button", { name: /filter/i }).click();

    // Verify filter menu is open
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
