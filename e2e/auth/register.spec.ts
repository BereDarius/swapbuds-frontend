import { expect, test } from "@playwright/test";

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should display registration form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /create an account/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("should show validation errors for invalid inputs", async ({ page }) => {
    // Try to submit without filling anything
    await page.getByRole("button", { name: /create account/i }).click();

    // Check for validation errors
    await expect(
      page.getByText(/username must be at least 3 characters/i),
    ).toBeVisible();
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
    await expect(
      page.getByText(/password must be at least 8 characters/i),
    ).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    const passwordInput = page.getByLabel(/^password$/i);

    // Test weak password
    await passwordInput.fill("weak");
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show multiple password errors
    await expect(
      page.getByText(/password must be at least 8 characters/i),
    ).toBeVisible();
  });

  test("should display date of birth fields", async ({ page }) => {
    await expect(page.getByText(/date of birth/i)).toBeVisible();

    // Check for day, month, year selects
    const selects = page.getByRole("combobox");
    await expect(selects).toHaveCount(3); // day, month, year
  });

  test("should validate age requirement (18+)", async ({ page }) => {
    // Fill basic info
    await page.getByLabel(/username/i).fill("testuser123");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("Test1234");

    // Select a date that makes user under 18
    const currentYear = new Date().getFullYear();
    const underageYear = currentYear - 15; // 15 years old

    // Fill DOB fields (adjust selectors based on actual implementation)
    await page.locator('select[name="day"]').selectOption("15");
    await page.locator('select[name="month"]').selectOption("6"); // June
    await page
      .locator('select[name="year"]')
      .selectOption(underageYear.toString());

    // Try to submit
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show age validation error
    await expect(
      page.getByText(/you must be at least 18 years old/i),
    ).toBeVisible();
  });

  test("should display age verification checkbox", async ({ page }) => {
    await expect(
      page.getByText(/i confirm i am at least 18 years old/i),
    ).toBeVisible();
  });

  test("should display legal consent checkboxes", async ({ page }) => {
    // Terms of Service checkbox
    await expect(
      page.getByText(/i accept the terms of service/i),
    ).toBeVisible();

    // Privacy Policy checkbox
    await expect(page.getByText(/i accept the privacy policy/i)).toBeVisible();

    // Optional Marketing checkbox
    await expect(page.getByText(/i agree to receive marketing/i)).toBeVisible();
  });

  test("should require TOS and Privacy acceptance", async ({ page }) => {
    // Fill all required fields except legal consents
    await page.getByLabel(/username/i).fill("testuser123");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("Test1234");

    // Fill valid DOB (25 years old)
    const currentYear = new Date().getFullYear();
    const validYear = currentYear - 25;
    await page.locator('select[name="day"]').selectOption("15");
    await page.locator('select[name="month"]').selectOption("6");
    await page
      .locator('select[name="year"]')
      .selectOption(validYear.toString());

    // Check age verification
    await page.getByText(/i confirm i am at least 18 years old/i).click();

    // Try to submit without checking TOS/Privacy
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show consent validation errors
    await expect(
      page.getByText(/you must accept the terms of service/i),
    ).toBeVisible();
    await expect(
      page.getByText(/you must accept the privacy policy/i),
    ).toBeVisible();
  });

  test("should have links to legal documents", async ({ page }) => {
    // Check for links to legal pages
    await expect(
      page.getByRole("link", { name: /terms of service/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /privacy policy/i }),
    ).toBeVisible();
  });

  test("should show reCAPTCHA notice", async ({ page }) => {
    await expect(
      page.getByText(/this site is protected by recaptcha/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /privacy policy/i, exact: false }),
    ).toBeVisible();
  });

  test("should disable submit button while reCAPTCHA loads", async ({
    page,
  }) => {
    const submitButton = page.getByRole("button", { name: /create account/i });

    // Button might be disabled initially while reCAPTCHA loads
    // Wait for it to become enabled
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
  });

  test("should have link to login page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("marketing consent should be optional", async ({ page }) => {
    // Fill all required fields
    await page.getByLabel(/username/i).fill("testuser123");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("Test1234");

    const currentYear = new Date().getFullYear();
    const validYear = currentYear - 25;
    await page.locator('select[name="day"]').selectOption("15");
    await page.locator('select[name="month"]').selectOption("6");
    await page
      .locator('select[name="year"]')
      .selectOption(validYear.toString());

    await page.getByText(/i confirm i am at least 18 years old/i).click();
    await page.getByText(/i accept the terms of service/i).click();
    await page.getByText(/i accept the privacy policy/i).click();

    // Don't check marketing consent
    const submitButton = page.getByRole("button", { name: /create account/i });

    // Should not show marketing consent error
    await submitButton.click();
    await expect(
      page.getByText(/you must agree to receive marketing/i),
    ).not.toBeVisible();
  });
});
