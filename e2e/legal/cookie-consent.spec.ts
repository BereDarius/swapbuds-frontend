import { expect, test } from "@playwright/test";

test.describe("Cookie Consent", () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and localStorage before each test
    await context.clearCookies();
  });

  test("should show cookie banner on first visit", async ({ page }) => {
    await page.goto("/");

    // Cookie banner should be visible
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).toBeVisible({ timeout: 5000 });

    // Should have action buttons
    await expect(
      page.getByRole("button", { name: /accept all/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reject all/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /customize/i }),
    ).toBeVisible();
  });

  test("should not show banner after accepting all cookies", async ({
    page,
  }) => {
    await page.goto("/");

    // Accept all cookies
    await page.getByRole("button", { name: /accept all/i }).click();

    // Banner should disappear
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();

    // Reload page
    await page.reload();

    // Banner should not appear again
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();
  });

  test("should not show banner after rejecting all cookies", async ({
    page,
  }) => {
    await page.goto("/");

    // Reject all cookies
    await page.getByRole("button", { name: /reject all/i }).click();

    // Banner should disappear
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();

    // Reload page
    await page.reload();

    // Banner should not appear again
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();
  });

  test("should open preferences modal when clicking customize", async ({
    page,
  }) => {
    await page.goto("/");

    // Click customize button
    await page.getByRole("button", { name: /customize/i }).click();

    // Modal should open
    await expect(
      page.getByRole("heading", { name: /cookie preferences/i }),
    ).toBeVisible();

    // Should show cookie categories
    await expect(page.getByText(/essential cookies/i)).toBeVisible();
    await expect(page.getByText(/functional cookies/i)).toBeVisible();
    await expect(page.getByText(/analytics cookies/i)).toBeVisible();
    await expect(page.getByText(/marketing cookies/i)).toBeVisible();
  });

  test("should have essential cookies always enabled", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize/i }).click();

    // Find essential cookies toggle (should be disabled/checked)
    const essentialSection = page
      .locator("text=/essential cookies/i")
      .locator("..");

    // Essential cookies should be visible and required
    await expect(essentialSection.getByText(/always active/i)).toBeVisible();
  });

  test("should allow toggling optional cookie categories", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize/i }).click();

    // Find and toggle functional cookies
    // Note: Adjust selectors based on actual implementation
    const functionalToggle = page.locator('[role="switch"]').nth(1); // Assuming essential is 0

    // Toggle should be clickable
    await functionalToggle.click();
  });

  test("should save cookie preferences", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize/i }).click();

    // Toggle some preferences (adjust based on implementation)
    // Then save
    await page.getByRole("button", { name: /save preferences/i }).click();

    // Modal should close
    await expect(
      page.getByRole("heading", { name: /cookie preferences/i }),
    ).not.toBeVisible();

    // Banner should disappear
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();

    // Reload page
    await page.reload();

    // Banner should not appear again
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();
  });

  test("should have links to legal documents", async ({ page }) => {
    await page.goto("/");

    // Banner should have links to policies
    await expect(
      page.getByRole("link", { name: /cookie policy/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /privacy policy/i }),
    ).toBeVisible();
  });

  test("should navigate to cookie policy", async ({ page }) => {
    await page.goto("/");

    // Click cookie policy link
    await page
      .getByRole("link", { name: /cookie policy/i })
      .first()
      .click();

    // Should navigate to cookie policy page
    await expect(page).toHaveURL(/\/legal\/cookies/);
  });

  test("should navigate to privacy policy", async ({ page }) => {
    await page.goto("/");

    // Click privacy policy link
    await page
      .getByRole("link", { name: /privacy policy/i })
      .first()
      .click();

    // Should navigate to privacy policy page
    await expect(page).toHaveURL(/\/legal\/privacy/);
  });

  test("should persist preferences across pages", async ({ page }) => {
    await page.goto("/");

    // Accept all cookies
    await page.getByRole("button", { name: /accept all/i }).click();

    // Navigate to different page
    await page.goto("/login");

    // Banner should not show
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();

    // Navigate to another page
    await page.goto("/register");

    // Banner should still not show
    await expect(
      page.getByText(/we use cookies to enhance your experience/i),
    ).not.toBeVisible();
  });

  test("should allow changing preferences from settings", async ({ page }) => {
    // First accept cookies
    await page.goto("/");
    await page.getByRole("button", { name: /accept all/i }).click();

    // Navigate to privacy settings (adjust URL based on implementation)
    await page.goto("/settings/privacy");

    // Should see cookie preferences section
    await expect(page.getByText(/cookie preferences/i)).toBeVisible();

    // Should see toggle switches for cookie categories
    await expect(page.getByText(/analytics cookies/i)).toBeVisible();
    await expect(page.getByText(/marketing cookies/i)).toBeVisible();
  });

  test("should show toast notification after saving preferences", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize/i }).click();

    // Save preferences
    await page.getByRole("button", { name: /save preferences/i }).click();

    // Should show success toast
    await expect(page.getByText(/preferences saved/i)).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Cookie Consent - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display mobile-friendly cookie banner", async ({ page }) => {
    await page.goto("/");

    // Cookie banner should be visible and properly sized
    const banner = page.getByText(/we use cookies to enhance your experience/i);
    await expect(banner).toBeVisible();

    // Buttons should be visible and clickable
    await expect(
      page.getByRole("button", { name: /accept all/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reject all/i }),
    ).toBeVisible();
  });

  test("should open modal on mobile when customizing", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /customize/i }).click();

    // Modal should be visible on mobile
    await expect(
      page.getByRole("heading", { name: /cookie preferences/i }),
    ).toBeVisible();
  });
});
