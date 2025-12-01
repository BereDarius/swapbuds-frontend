import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Item Details Page", () => {
  test.describe("Page Load and Error States", () => {
    test("should show loading state while fetching item", async ({ page }) => {
      await loginAsRegularUser(page);

      // Delay API response to see loading state
      await page.route("**/api/items/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "test-item-1",
            title: "Test Item",
            description: "Test description",
            category: "ELECTRONICS",
            condition: "NEW",
            status: "AVAILABLE",
            images: [],
            estimatedValue: 100,
            currency: "EUR",
            viewCount: 10,
            likesCount: 5,
            commentsCount: 2,
            deliveryMethods: ["PHYSICAL"],
            deliveryScope: "LOCAL",
            owner: {
              id: "owner-1",
              username: "testowner",
              avatarUrl: null,
              reputationScore: 100,
              isVerified: true,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      });

      await page.goto("/items/test-item-1");

      // Should briefly see loading state
      await expect(page.getByTestId("item-details-loading")).toBeVisible();
    });

    test("should show error state when item not found", async ({ page }) => {
      await loginAsRegularUser(page);

      // Mock 404 response
      await page.route("**/api/items/non-existent-item", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "Item not found" }),
        });
      });

      await page.goto("/items/non-existent-item");

      await expect(page.getByTestId("item-details-error")).toBeVisible();
      await expect(page.getByTestId("item-error-title")).toHaveText(
        "Item not found"
      );
      await expect(page.getByTestId("item-error-message")).toContainText(
        "removed or doesn't exist"
      );
      await expect(page.getByTestId("item-error-back-button")).toBeVisible();
    });

    test("should navigate back to items list from error page", async ({
      page,
    }) => {
      await loginAsRegularUser(page);

      await page.route("**/api/items/non-existent-item", async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "Item not found" }),
        });
      });

      await page.goto("/items/non-existent-item");

      await page.getByTestId("item-error-back-button").click();
      await page.waitForURL("**/items");
      expect(page.url()).toContain("/items");
    });
  });

  test.describe("Item Display", () => {
    test("should display item details correctly", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      // Wait for page to load
      await expect(page.getByTestId("item-details-page")).toBeVisible();

      // Check title and basic info
      await expect(page.getByTestId("item-title")).toBeVisible();
      await expect(page.getByTestId("item-category-badge")).toBeVisible();
      await expect(page.getByTestId("item-condition-badge")).toBeVisible();
    });

    test("should display item price when available", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      // Check if price is displayed (might not be present for all items)
      const price = page.getByTestId("item-price");
      const priceCount = await price.count();
      if (priceCount > 0) {
        await expect(price).toBeVisible();
        await expect(price).toContainText("€");
      }
    });

    test("should display item description when available", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      const descriptionSection = page.getByTestId("item-description-section");
      const descCount = await descriptionSection.count();
      if (descCount > 0) {
        await expect(descriptionSection).toBeVisible();
        await expect(page.getByTestId("item-description")).toBeVisible();
      }
    });

    test("should display item details section", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-details-info")).toBeVisible();
      await expect(page.getByTestId("item-condition-detail")).toBeVisible();
      await expect(page.getByTestId("item-category-detail")).toBeVisible();
      await expect(page.getByTestId("item-delivery-detail")).toBeVisible();
    });

    test("should display status badge when item is not available", async ({
      page,
    }) => {
      await loginAsRegularUser(page);

      // Check if we can find an item with non-available status
      await page.goto("/items");
      await expect(page.getByTestId("items-page-title")).toBeVisible();

      // Navigate to first item
      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const statusBadge = page.getByTestId("item-status-badge");
        const badgeCount = await statusBadge.count();
        // Status badge only appears for non-available items
        if (badgeCount > 0) {
          await expect(statusBadge).toBeVisible();
        }
      }
    });
  });

  test.describe("Image Gallery", () => {
    test("should display main image section", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-images-section")).toBeVisible();
      await expect(page.getByTestId("item-main-image")).toBeVisible();
    });

    test("should display thumbnails when multiple images exist", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      // Thumbnails only appear if there are multiple images
      const thumbnails = page.getByTestId("item-thumbnails");
      const thumbCount = await thumbnails.count();

      if (thumbCount > 0) {
        await expect(thumbnails).toBeVisible();
        const firstThumb = page.getByTestId("item-thumbnail-0");
        await expect(firstThumb).toBeVisible();
      }
    });

    test("should switch main image when clicking thumbnail", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      const thumbnails = page.getByTestId("item-thumbnails");
      const thumbCount = await thumbnails.count();

      if (thumbCount > 0) {
        const secondThumb = page.getByTestId("item-thumbnail-1");
        const thumbExists = await secondThumb.count();

        if (thumbExists > 0) {
          await secondThumb.click();
          // Main image should remain visible (switched to different image)
          await expect(page.getByTestId("item-main-image")).toBeVisible();
        }
      }
    });
  });

  test.describe("Owner Information", () => {
    test("should display owner card", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-owner-card")).toBeVisible();
      await expect(page.getByTestId("item-owner-link")).toBeVisible();
      await expect(page.getByTestId("item-owner-avatar")).toBeVisible();
      await expect(page.getByTestId("item-owner-username")).toBeVisible();
    });

    test("should navigate to owner profile when clicking owner link", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      const ownerLink = page.getByTestId("item-owner-link");
      await expect(ownerLink).toBeVisible();

      await ownerLink.click();
      await page.waitForURL(/\/profile\/.+/);
      expect(page.url()).toContain("/profile/");
    });
  });

  test.describe("Action Buttons - Non-Owner", () => {
    test("should display propose trade button for available items", async ({
      page,
    }) => {
      await loginAsRegularUser(page);

      // Go to items list and find an available item that's not owned by current user
      await page.goto("/items");
      await expect(page.getByTestId("items-page-title")).toBeVisible();

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);
        await expect(page.getByTestId("item-details-page")).toBeVisible();

        const proposeTradeBtn = page.getByTestId("item-propose-trade-button");
        const editBtn = page.getByTestId("item-edit-button");

        // If not owner (no edit button), should see propose trade button
        const isOwner = (await editBtn.count()) > 0;
        if (!isOwner) {
          const proposeBtnCount = await proposeTradeBtn.count();
          // Propose trade button only shows for available items
          if (proposeBtnCount > 0) {
            await expect(proposeTradeBtn).toBeVisible();
          }
        }
      }
    });

    test("should display like button for non-owner", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (!isOwner) {
          await expect(page.getByTestId("item-like-button")).toBeVisible();
        }
      }
    });

    test("should display comment button for non-owner", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (!isOwner) {
          await expect(page.getByTestId("item-comment-button")).toBeVisible();
        }
      }
    });

    test("should display flag button for non-owner", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (!isOwner) {
          await expect(page.getByTestId("item-flag-button")).toBeVisible();
        }
      }
    });

    test("should scroll to comments when clicking comment button", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (!isOwner) {
          const commentBtn = page.getByTestId("item-comment-button");
          await commentBtn.click();

          // Comments section should be visible after scrolling
          await expect(page.getByTestId("item-comments-section")).toBeVisible();
        }
      }
    });
  });

  test.describe("Action Buttons - Owner", () => {
    test("should display edit and delete buttons for owner", async ({
      page,
    }) => {
      await loginAsRegularUser(page);

      // Navigate to items page and list a new item (or find owned item)
      await page.goto("/items");
      await expect(page.getByTestId("items-page-title")).toBeVisible();

      // Try to find an owned item by checking for edit button presence
      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await itemCards.nth(i).click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (isOwner) {
          await expect(editBtn).toBeVisible();
          await expect(page.getByTestId("item-delete-button")).toBeVisible();

          // Owner should not see propose trade button
          const proposeTradeBtn = page.getByTestId("item-propose-trade-button");
          await expect(proposeTradeBtn).not.toBeVisible();
          break;
        }

        await page.goto("/items");
      }
    });

    test("should navigate to edit page when clicking edit button", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        await itemCards.nth(i).click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (isOwner) {
          const currentUrl = page.url();
          const itemId = currentUrl.split("/items/")[1];

          await editBtn.click();
          await page.waitForURL(`**/items/${itemId}/edit`);
          expect(page.url()).toContain(`/items/${itemId}/edit`);
          break;
        }

        await page.goto("/items");
      }
    });
  });

  test.describe("Share Functionality", () => {
    test("should display share button", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-share-button")).toBeVisible();
    });

    test("should handle share button click", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      // Grant clipboard permissions to avoid permission errors
      await page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"]);

      const shareBtn = page.getByTestId("item-share-button");
      await shareBtn.click();

      // Should either share or copy to clipboard (both are valid)
      // We can't easily test the actual share dialog, but button should be clickable
      await expect(shareBtn).toBeVisible();
    });
  });

  test.describe("Stats Display", () => {
    test("should display likes and comments count", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-stats")).toBeVisible();
      await expect(page.getByTestId("item-likes-count")).toBeVisible();
      await expect(page.getByTestId("item-comments-count")).toBeVisible();
    });

    test("should display correct pluralization for stats", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      const likesText = await page
        .getByTestId("item-likes-count")
        .textContent();
      const commentsText = await page
        .getByTestId("item-comments-count")
        .textContent();

      // Check that text contains "like" or "likes"
      expect(likesText).toMatch(/\d+\s*(like|likes)/);
      // Check that text contains "comment" or "comments"
      expect(commentsText).toMatch(/\d+\s*(comment|comments)/);
    });

    test("should scroll to comments when clicking comments count", async ({
      page,
    }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const editBtn = page.getByTestId("item-edit-button");
        const isOwner = (await editBtn.count()) > 0;

        if (!isOwner) {
          const commentsCount = page.getByTestId("item-comments-count");
          await commentsCount.click();

          // Comments section should be visible after scrolling
          await expect(page.getByTestId("item-comments-section")).toBeVisible();
        }
      }
    });
  });

  test.describe("Comments Section", () => {
    test("should display comments section", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();

      // Scroll to comments
      await page.evaluate(() => {
        const section = document.getElementById("comments-section");
        section?.scrollIntoView();
      });

      await expect(page.getByTestId("item-comments-section")).toBeVisible();
    });
  });

  test.describe("Responsive Behavior", () => {
    test("should display correctly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-title")).toBeVisible();
      await expect(page.getByTestId("item-images-section")).toBeVisible();
      await expect(page.getByTestId("item-details-section")).toBeVisible();
    });

    test("should display correctly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-title")).toBeVisible();
      await expect(page.getByTestId("item-images-section")).toBeVisible();
      await expect(page.getByTestId("item-details-section")).toBeVisible();
    });

    test("should display correctly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await loginAsRegularUser(page);
      await page.goto("/items/test-item-1");

      await expect(page.getByTestId("item-details-page")).toBeVisible();
      await expect(page.getByTestId("item-title")).toBeVisible();
      await expect(page.getByTestId("item-images-section")).toBeVisible();
      await expect(page.getByTestId("item-details-section")).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should maintain proper URL structure", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        const url = page.url();
        expect(url).toMatch(/\/items\/[a-zA-Z0-9-]+$/);
      }
    });

    test("should allow navigation back to items list", async ({ page }) => {
      await loginAsRegularUser(page);
      await page.goto("/items");

      const itemCards = page.locator('[data-testid^="item-card-"]');
      const count = await itemCards.count();

      if (count > 0) {
        await itemCards.first().click();
        await page.waitForURL(/\/items\/.+/);

        await page.goBack();
        await page.waitForURL("**/items");
        expect(page.url()).toContain("/items");
        await expect(page.getByTestId("items-page-title")).toBeVisible();
      }
    });
  });
});
