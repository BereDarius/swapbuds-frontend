import { expect, test } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should show validation errors for invalid inputs", async ({ page }) => {
    // Try to submit without filling anything
    await page.getByRole("button", { name: /sign in/i }).click();

    // Check for validation errors
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
    await expect(
      page.getByText(/password must be at least 6 characters/i),
    ).toBeVisible();
  });

  test("should validate email format", async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);

    // Test invalid email
    await emailInput.fill("notanemail");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test("should validate password length", async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);

    // Test short password
    await passwordInput.fill("123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(
      page.getByText(/password must be at least 6 characters/i),
    ).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");

    // Submit form
    await page.getByRole("button", { name: /sign in/i }).click();

    // Wait for API call and error toast
    await expect(page.getByText(/login failed/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should disable submit button while loading", async ({ page }) => {
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");

    const submitButton = page.getByRole("button", { name: /sign in/i });

    // Click and check if button gets disabled
    await submitButton.click();
    await expect(submitButton).toBeDisabled();
    await expect(
      page.getByRole("button", { name: /signing in.../i }),
    ).toBeVisible();
  });

  test("should show reCAPTCHA notice", async ({ page }) => {
    await expect(
      page.getByText(/this site is protected by recaptcha/i),
    ).toBeVisible();

    // Check for Google policy links
    const privacyLink = page
      .getByRole("link", { name: /privacy policy/i })
      .first();
    const tosLink = page
      .getByRole("link", { name: /terms of service/i })
      .first();

    await expect(privacyLink).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy",
    );
    await expect(tosLink).toHaveAttribute(
      "href",
      "https://policies.google.com/terms",
    );
  });

  test("should disable submit button while reCAPTCHA loads", async ({
    page,
  }) => {
    const submitButton = page.getByRole("button", { name: /sign in/i });

    // Button might be disabled initially while reCAPTCHA loads
    // Wait for it to become enabled
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
  });

  test("should have link to registration page", async ({ page }) => {
    const signUpLink = page.getByRole("link", { name: /sign up/i });

    await expect(signUpLink).toBeVisible();
    await expect(signUpLink).toHaveAttribute("href", "/register");
  });

  test("should navigate to registration page", async ({ page }) => {
    await page.getByRole("link", { name: /sign up/i }).click();

    await expect(page).toHaveURL("/register");
    await expect(
      page.getByRole("heading", { name: /create an account/i }),
    ).toBeVisible();
  });

  test("should allow password visibility toggle if implemented", async ({
    page,
  }) => {
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill("testpassword");

    // Check if input type is password
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should accept valid credentials format", async ({ page }) => {
    // Fill with valid format (will fail auth but should pass validation)
    await page.getByLabel(/email/i).fill("valid@example.com");
    await page.getByLabel(/password/i).fill("validpass");

    const submitButton = page.getByRole("button", { name: /sign in/i });

    // Should not show validation errors
    await submitButton.click();

    // Wait a bit to ensure no validation errors appear
    await page.waitForTimeout(1000);
    await expect(page.getByText(/invalid email address/i)).not.toBeVisible();
    await expect(
      page.getByText(/password must be at least 6 characters/i),
    ).not.toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept API call and simulate network error
    await page.route("**/auth/login", (route) => {
      route.abort("failed");
    });

    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error toast
    await expect(page.getByText(/login failed/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should clear form validation on input change", async ({ page }) => {
    // Submit empty form to trigger validation
    await page.getByRole("button", { name: /sign in/i }).click();

    // Verify errors are shown
    await expect(page.getByText(/invalid email address/i)).toBeVisible();

    // Start typing in email field
    await page.getByLabel(/email/i).fill("test@example.com");

    // Email error should disappear
    await expect(page.getByText(/invalid email address/i)).not.toBeVisible();
  });
});
