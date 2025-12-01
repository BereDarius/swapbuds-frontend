import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("Trade Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should display user's trades", async ({ page }) => {
    await page.goto("/trades");

    // Check that trades page is displayed
    await expect(page.getByRole("heading", { name: /trades/i })).toBeVisible();
  });

  test("should allow proposing a trade", async ({ page }) => {
    await page.goto("/items");

    // Click on an item
    const firstItem = page.locator('[href^="/items/"]').first();
    await firstItem.click();

    // Click propose trade button
    await page.getByRole("button", { name: /propose trade/i }).click();

    // Select your item to offer
    await page.getByText(/select items to offer/i).click();
    await page.locator('[data-testid="item-checkbox"]').first().click();

    // Add message
    await page.getByPlaceholder(/add a message/i).fill("I'd like to trade!");

    // Submit trade proposal
    await page.getByRole("button", { name: /send proposal/i }).click();

    // Verify success
    await expect(page.getByText(/trade proposal sent/i)).toBeVisible();
  });

  test("should display trade proposals received", async ({ page }) => {
    await page.goto("/trades?tab=received");

    // Check that received tab is active
    await expect(page.getByRole("tab", { name: /received/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Should display received proposals
    await expect(page.getByText(/proposals received/i)).toBeVisible();
  });

  test("should allow accepting a trade proposal", async ({ page }) => {
    await page.goto("/trades?tab=received");

    // Click accept on first proposal
    const acceptButton = page.getByRole("button", { name: /accept/i }).first();
    await acceptButton.click();

    // Confirm acceptance
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/trade accepted/i)).toBeVisible();
  });

  test("should allow rejecting a trade proposal", async ({ page }) => {
    await page.goto("/trades?tab=received");

    // Click reject on first proposal
    const rejectButton = page.getByRole("button", { name: /reject/i }).first();
    await rejectButton.click();

    // Confirm rejection
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/trade rejected/i)).toBeVisible();
  });

  test("should allow countering a trade proposal", async ({ page }) => {
    await page.goto("/trades?tab=received");

    // Click counter on first proposal
    const counterButton = page
      .getByRole("button", { name: /counter/i })
      .first();
    await counterButton.click();

    // Modify items
    await page.getByText(/modify offer/i).click();

    // Add message
    await page
      .getByPlaceholder(/add a message/i)
      .fill("How about this instead?");

    // Submit counter-proposal
    await page.getByRole("button", { name: /send counter/i }).click();

    // Verify success
    await expect(page.getByText(/counter-proposal sent/i)).toBeVisible();
  });

  test("should display active trades", async ({ page }) => {
    await page.goto("/trades?tab=active");

    // Check that active tab is selected
    await expect(page.getByRole("tab", { name: /active/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("should mark trade as completed", async ({ page }) => {
    await page.goto("/trades?tab=active");

    // Click complete on first trade
    const completeButton = page
      .getByRole("button", { name: /complete/i })
      .first();
    await completeButton.click();

    // Confirm completion
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify success
    await expect(page.getByText(/trade marked as completed/i)).toBeVisible();
  });

  test("should allow opening a dispute", async ({ page }) => {
    await page.goto("/trades?tab=active");

    // Click dispute on first trade
    const disputeButton = page
      .getByRole("button", { name: /dispute/i })
      .first();
    await disputeButton.click();

    // Select dispute reason
    await page.getByLabel(/reason/i).click();
    await page.getByRole("option", { name: /item not as described/i }).click();

    // Add description
    await page.getByLabel(/description/i).fill("The item is damaged");

    // Submit dispute
    await page.getByRole("button", { name: /submit dispute/i }).click();

    // Verify success
    await expect(page.getByText(/dispute opened/i)).toBeVisible();
  });

  test("should display trade messages", async ({ page }) => {
    await page.goto("/trades");

    // Click on first trade
    const firstTrade = page.getByRole("link", { name: /view trade/i }).first();
    await firstTrade.click();

    // Verify messages section is visible
    await expect(
      page.getByRole("heading", { name: /messages/i }),
    ).toBeVisible();
  });

  test("should allow sending trade messages", async ({ page }) => {
    await page.goto("/trades");

    // Click on first trade
    const firstTrade = page.getByRole("link", { name: /view trade/i }).first();
    await firstTrade.click();

    // Send a message
    const messageInput = page.getByPlaceholder(/type a message/i);
    await messageInput.fill("When can we meet?");
    await page.getByRole("button", { name: /send/i }).click();

    // Verify message is displayed
    await expect(page.getByText("When can we meet?")).toBeVisible();
  });

  test("should filter trades by status", async ({ page }) => {
    await page.goto("/trades");

    // Open filter dropdown
    await page.getByRole("button", { name: /filter/i }).click();

    // Select completed status
    await page.getByLabel(/completed/i).click();

    // Apply filter
    await page.getByRole("button", { name: /apply/i }).click();

    // Verify URL updated
    await expect(page).toHaveURL(/status=COMPLETED/);
  });
});

test.describe("Trade - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display trades in mobile view", async ({ page }) => {
    await page.goto("/trades");

    // Verify mobile layout
    await expect(page.getByRole("heading", { name: /trades/i })).toBeVisible();
  });
});
