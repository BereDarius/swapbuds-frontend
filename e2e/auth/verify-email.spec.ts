import { expect, test } from "@playwright/test";

test.describe("Verify Email Page", () => {
  test.describe("Successful Verification", () => {
    test("should verify email with valid token", async ({ page }) => {
      // Mock the API response for successful verification
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Email verified successfully!",
          }),
        });
      });

      await page.goto("/verify-email?token=valid-token-123");

      // Should show verifying state first
      await expect(page.getByTestId("verify-email-card")).toBeVisible();
      await expect(page.getByTestId("verify-email-title")).toHaveText(
        "Email Verification",
      );

      // Should show success state
      await expect(page.getByTestId("verify-email-success")).toBeVisible();
      await expect(page.getByTestId("verify-email-success-icon")).toBeVisible();
      await expect(page.getByTestId("verify-email-success-message")).toHaveText(
        "Email verified successfully!",
      );
      await expect(
        page.getByTestId("verify-email-redirect-message"),
      ).toHaveText("Redirecting to login page...");
    });

    test("should redirect to login after successful verification", async ({
      page,
    }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Email verified successfully!",
          }),
        });
      });

      await page.goto("/verify-email?token=valid-token-123");
      await expect(page.getByTestId("verify-email-success")).toBeVisible();

      // Wait for redirect (3 seconds in the code)
      await page.waitForURL("**/login?verified=true", { timeout: 5000 });
      expect(page.url()).toContain("/login?verified=true");
    });
  });

  test.describe("Failed Verification", () => {
    test("should show error for missing token", async ({ page }) => {
      await page.goto("/verify-email");

      await expect(page.getByTestId("verify-email-card")).toBeVisible();
      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-icon")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-message")).toHaveText(
        "No verification token provided.",
      );
    });

    test("should show error for invalid token", async ({ page }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Invalid verification token.",
          }),
        });
      });

      await page.goto("/verify-email?token=invalid-token");

      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-message")).toHaveText(
        "Invalid verification token.",
      );
    });

    test("should show error for expired token", async ({ page }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Verification token has expired.",
          }),
        });
      });

      await page.goto("/verify-email?token=expired-token");

      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-message")).toHaveText(
        "Verification token has expired.",
      );
    });

    test("should show generic error for server error", async ({ page }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Internal server error",
          }),
        });
      });

      await page.goto("/verify-email?token=some-token");

      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-message")).toHaveText(
        "Internal server error",
      );
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to register page from error state", async ({
      page,
    }) => {
      await page.goto("/verify-email");
      await expect(page.getByTestId("verify-email-error")).toBeVisible();

      await page.getByTestId("verify-email-register-button").click();
      await page.waitForURL("**/register");
      expect(page.url()).toContain("/register");
    });

    test("should navigate to login page from error state", async ({ page }) => {
      await page.goto("/verify-email");
      await expect(page.getByTestId("verify-email-error")).toBeVisible();

      await page.getByTestId("verify-email-login-button").click();
      await page.waitForURL("**/login");
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("UI Elements", () => {
    test("should display all UI elements correctly in verifying state", async ({
      page,
    }) => {
      // Delay the API response to keep verifying state visible
      await page.route("**/api/auth/verify-email", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Email verified successfully!",
          }),
        });
      });

      await page.goto("/verify-email?token=valid-token");

      // Check verifying state elements
      await expect(page.getByTestId("verify-email-card")).toBeVisible();
      await expect(page.getByTestId("verify-email-title")).toBeVisible();
      await expect(page.getByTestId("verify-email-description")).toBeVisible();
      await expect(page.getByTestId("verify-email-verifying")).toBeVisible();
      await expect(page.getByTestId("verify-email-spinner")).toBeVisible();
      await expect(page.getByTestId("verify-email-message")).toContainText(
        "Verifying",
      );
    });

    test("should display all UI elements correctly in success state", async ({
      page,
    }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Email verified successfully!",
          }),
        });
      });

      await page.goto("/verify-email?token=valid-token");
      await expect(page.getByTestId("verify-email-success")).toBeVisible();

      // Check success state elements
      await expect(page.getByTestId("verify-email-success-icon")).toBeVisible();
      await expect(
        page.getByTestId("verify-email-success-message"),
      ).toBeVisible();
      await expect(
        page.getByTestId("verify-email-redirect-message"),
      ).toBeVisible();
    });

    test("should display all UI elements correctly in error state", async ({
      page,
    }) => {
      await page.goto("/verify-email");

      // Check error state elements
      await expect(page.getByTestId("verify-email-card")).toBeVisible();
      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(page.getByTestId("verify-email-error-icon")).toBeVisible();
      await expect(
        page.getByTestId("verify-email-error-message"),
      ).toBeVisible();
      await expect(
        page.getByTestId("verify-email-register-button"),
      ).toBeVisible();
      await expect(page.getByTestId("verify-email-login-button")).toBeVisible();
    });

    test("should have correct card styling", async ({ page }) => {
      await page.goto("/verify-email");

      const card = page.getByTestId("verify-email-card");
      await expect(card).toBeVisible();
      await expect(card).toHaveClass(/max-w-md/);
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await page.goto("/verify-email");

      const title = page.getByTestId("verify-email-title");
      await expect(title).toBeVisible();
      // CardTitle component should render as h3 by default
    });

    test("should have visible error buttons", async ({ page }) => {
      await page.goto("/verify-email");

      const registerButton = page.getByTestId("verify-email-register-button");
      const loginButton = page.getByTestId("verify-email-login-button");

      await expect(registerButton).toBeVisible();
      await expect(registerButton).toBeEnabled();
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();
    });

    test("should show loading spinner animation", async ({ page }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: "Success" }),
        });
      });

      await page.goto("/verify-email?token=valid-token");

      const spinner = page.getByTestId("verify-email-spinner");
      await expect(spinner).toBeVisible();
      await expect(spinner).toHaveClass(/animate-spin/);
    });
  });

  test.describe("State Transitions", () => {
    test("should transition from verifying to success state", async ({
      page,
    }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Email verified successfully!",
          }),
        });
      });

      await page.goto("/verify-email?token=valid-token");

      // Should start in verifying state
      await expect(page.getByTestId("verify-email-verifying")).toBeVisible();

      // Should transition to success state
      await expect(page.getByTestId("verify-email-success")).toBeVisible({
        timeout: 3000,
      });
      await expect(
        page.getByTestId("verify-email-verifying"),
      ).not.toBeVisible();
    });

    test("should transition from verifying to error state", async ({
      page,
    }) => {
      await page.route("**/api/auth/verify-email", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Invalid token",
          }),
        });
      });

      await page.goto("/verify-email?token=invalid-token");

      // Should start in verifying state
      await expect(page.getByTestId("verify-email-verifying")).toBeVisible();

      // Should transition to error state
      await expect(page.getByTestId("verify-email-error")).toBeVisible({
        timeout: 3000,
      });
      await expect(
        page.getByTestId("verify-email-verifying"),
      ).not.toBeVisible();
    });

    test("should show immediate error state for missing token", async ({
      page,
    }) => {
      await page.goto("/verify-email");

      // Should show error state immediately (no verifying state)
      await expect(page.getByTestId("verify-email-error")).toBeVisible();
      await expect(
        page.getByTestId("verify-email-verifying"),
      ).not.toBeVisible();
    });
  });
});
