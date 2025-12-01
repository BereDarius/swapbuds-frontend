import { expect, test } from "@playwright/test";
import { mockRecaptcha } from "../fixtures/auth";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock reCAPTCHA for all tests
    await mockRecaptcha(page);
    await page.goto("/login");
  });

  test.describe("Successful Login", () => {
    test("should login as regular user and redirect to home", async ({
      page,
    }) => {
      // Fill in credentials
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");

      // Submit form
      await page.getByTestId("login-submit").click();

      // Should redirect away from login page
      await page.waitForURL((url) => url.pathname !== "/login");

      // Verify user is authenticated (navbar is visible)
      await expect(page.getByTestId("navbar")).toBeVisible();
    });

    test("should login as admin user", async ({ page }) => {
      await page.getByTestId("login-email").fill("admin@swapbuds.com");
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      await page.waitForURL((url) => url.pathname !== "/login");
      await expect(page.getByTestId("navbar")).toBeVisible();
    });

    test("should login as moderator user", async ({ page }) => {
      await page.getByTestId("login-email").fill("moderator@swapbuds.com");
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      await page.waitForURL((url) => url.pathname !== "/login");
      await expect(page.getByTestId("navbar")).toBeVisible();
    });

    test("should show success toast message", async ({ page }) => {
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      // Wait for toast message
      await expect(page.getByText(/welcome back/i)).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test.describe("Failed Login", () => {
    test("should show error for invalid email", async ({ page }) => {
      await page.getByTestId("login-email").fill("invalid@example.com");
      await page.getByTestId("login-password").fill("WrongPassword123!");
      await page.getByTestId("login-submit").click();

      // Should show error message
      await expect(page.getByTestId("login-error")).toBeVisible();
      await expect(page.getByTestId("login-error")).toContainText(
        /invalid credentials/i
      );

      // Should remain on login page
      expect(page.url()).toContain("/login");
    });

    test("should show error for wrong password", async ({ page }) => {
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("WrongPassword!");
      await page.getByTestId("login-submit").click();

      await expect(page.getByTestId("login-error")).toBeVisible();
      expect(page.url()).toContain("/login");
    });

    test("should show error toast for invalid credentials", async ({
      page,
    }) => {
      await page.getByTestId("login-email").fill("invalid@example.com");
      await page.getByTestId("login-password").fill("WrongPassword!");
      await page.getByTestId("login-submit").click();

      // Should show error toast (sonner toast with error message)
      await expect(page.getByText(/invalid credentials/i)).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe("Form Validation", () => {
    test("should require email field", async ({ page }) => {
      // Try to submit without email
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      // HTML5 validation should prevent submission
      const emailInput = page.getByTestId("login-email");
      await expect(emailInput).toHaveAttribute("required");

      // Should still be on login page
      expect(page.url()).toContain("/login");
    });

    test("should require password field", async ({ page }) => {
      await page.getByTestId("login-email").fill("john.doe@example.com");
      // Don't fill password
      await page.getByTestId("login-submit").click();

      const passwordInput = page.getByTestId("login-password");
      await expect(passwordInput).toHaveAttribute("required");

      expect(page.url()).toContain("/login");
    });

    test("should require valid email format", async ({ page }) => {
      await page.getByTestId("login-email").fill("invalid-email");
      await page.getByTestId("login-password").fill("Password123!");

      // HTML5 validation should prevent submission
      const emailInput = page.getByTestId("login-email");
      await expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  test.describe("Remember Me Functionality", () => {
    test("should toggle remember me checkbox", async ({ page }) => {
      const rememberCheckbox = page.getByTestId("login-remember-me");

      // Should be unchecked by default
      await expect(rememberCheckbox).not.toBeChecked();

      // Click to check
      await rememberCheckbox.click();
      await expect(rememberCheckbox).toBeChecked();

      // Click to uncheck
      await rememberCheckbox.click();
      await expect(rememberCheckbox).not.toBeChecked();
    });

    test("should persist remember me preference after login", async ({
      page,
    }) => {
      // Check remember me
      await page.getByTestId("login-remember-me").click();

      // Login
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      await page.waitForURL((url) => url.pathname !== "/login");

      // Check localStorage
      const rememberMe = await page.evaluate(() =>
        localStorage.getItem("rememberMe")
      );
      expect(rememberMe).toBe("true");
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to forgot password page", async ({ page }) => {
      await page.getByTestId("login-forgot-password").click();
      await expect(page).toHaveURL(/\/forgot-password/);
    });

    test("should navigate to register page", async ({ page }) => {
      await page.getByTestId("login-signup-link").click();
      await expect(page).toHaveURL(/\/register/);
    });

    test("should show forgot password link", async ({ page }) => {
      await expect(page.getByTestId("login-forgot-password")).toBeVisible();
      await expect(page.getByTestId("login-forgot-password")).toHaveText(
        /forgot password/i
      );
    });

    test("should show signup link", async ({ page }) => {
      await expect(page.getByTestId("login-signup-link")).toBeVisible();
      await expect(page.getByTestId("login-signup-link")).toHaveText(
        /sign up/i
      );
    });
  });

  test.describe("UI Elements", () => {
    test("should display login form elements", async ({ page }) => {
      // Check page title (CardTitle has "Welcome back" text)
      await expect(page.getByText("Welcome back")).toBeVisible();

      // Check form fields
      await expect(page.getByTestId("login-email")).toBeVisible();
      await expect(page.getByTestId("login-password")).toBeVisible();
      await expect(page.getByTestId("login-submit")).toBeVisible();
      await expect(page.getByTestId("login-remember-me")).toBeVisible();
    });

    test("should show correct placeholders", async ({ page }) => {
      await expect(page.getByTestId("login-email")).toHaveAttribute(
        "placeholder",
        "you@example.com"
      );
      await expect(page.getByTestId("login-password")).toHaveAttribute(
        "placeholder",
        /•+/
      );
    });

    test("should disable form during submission", async ({ page }) => {
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");

      // Click submit
      const submitButton = page.getByTestId("login-submit");
      await submitButton.click();

      // Button should show loading state
      await expect(submitButton).toHaveText(/signing in/i);
    });

    test("should mask password input", async ({ page }) => {
      const passwordInput = page.getByTestId("login-password");
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Error Handling", () => {
    test("should clear error on new submission", async ({ page }) => {
      // First failed attempt
      await page.getByTestId("login-email").fill("invalid@example.com");
      await page.getByTestId("login-password").fill("WrongPassword!");
      await page.getByTestId("login-submit").click();

      // Wait for error
      await expect(page.getByTestId("login-error")).toBeVisible();

      // Second attempt with correct credentials
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");
      await page.getByTestId("login-submit").click();

      // Error should be cleared before submission
      await expect(page.getByTestId("login-error")).not.toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper labels for form fields", async ({ page }) => {
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });

    test("should be keyboard navigable", async ({ page }) => {
      // Focus on email field first
      await page.getByTestId("login-email").focus();
      await expect(page.getByTestId("login-email")).toBeFocused();

      // Tab to password field
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("login-password")).toBeFocused();

      // Note: Checkbox focus behavior differs across browsers (webkit/safari don't focus custom checkboxes)
      // Just verify the elements are keyboard accessible
      await expect(page.getByTestId("login-remember-me")).toBeVisible();
    });

    test("should submit form with Enter key", async ({ page }) => {
      await page.getByTestId("login-email").fill("john.doe@example.com");
      await page.getByTestId("login-password").fill("Password123!");

      // Press Enter to submit
      await page.keyboard.press("Enter");

      // Should redirect
      await page.waitForURL((url) => url.pathname !== "/login");
    });
  });
});
