import { expect, test } from "@playwright/test";
import { mockRecaptcha } from "../fixtures/auth";

test.describe("Register Page", () => {
  // Cache legal documents responses to avoid backend rate limiting
  const legalDocsCache: Record<string, unknown> = {};

  test.beforeEach(async ({ page }) => {
    // Mock legal documents API with caching to avoid rate limiting
    await page.route("**/legal/documents/**", async (route) => {
      const url = route.request().url();

      // Check cache first
      if (legalDocsCache[url]) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(legalDocsCache[url]),
        });
        return;
      }

      // Fetch from backend and cache
      const response = await route.fetch();
      if (response.status() === 200) {
        const data = await response.json();
        legalDocsCache[url] = data;
        await route.fulfill({ response });
      } else {
        await route.continue();
      }
    });

    await mockRecaptcha(page);
    await page.goto("/register", { waitUntil: "domcontentloaded" });

    // Simply wait for the submit button to be enabled
    // This ensures legal documents have loaded
    await expect(page.getByTestId("register-submit")).toBeEnabled({
      timeout: 15000,
    });
  });
  test.describe("Successful Registration", () => {
    test("should register a new user and show verification message", async ({
      page,
    }) => {
      // Fill in all required fields with unique data
      const timestamp = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      await page.getByTestId("register-username").fill(`testuser${timestamp}`);
      await page
        .getByTestId("register-email")
        .fill(`test${timestamp}@example.com`);
      await page.getByTestId("register-password").fill("TestPass123!");

      // Select date of birth (25 years old)
      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1999");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5"); // June
      await page.getByRole("gridcell", { name: "15" }).first().click();

      // Accept all required checkboxes
      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      // Wait for legal documents API to load - button will be enabled when docs are loaded
      const submitButton = page.getByTestId("register-submit");
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit form
      await submitButton.click();

      // Should show verification message
      await expect(
        page.getByText(/Please verify your email to continue/i),
      ).toBeVisible();
      await expect(
        page.getByText(`test${timestamp}@example.com`),
      ).toBeVisible();
    });

    test("should show email registered and verification screen", async ({
      page,
    }) => {
      const timestamp = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      await page.getByTestId("register-username").fill(`user${timestamp}`);
      await page
        .getByTestId("register-email")
        .fill(`user${timestamp}@example.com`);
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1995");
      await page.getByRole("combobox", { name: /month/i }).selectOption("3");
      await page.getByRole("gridcell", { name: "10" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      // Wait for legal documents to load
      await page.waitForTimeout(5000);

      await page.getByTestId("register-submit").click();

      // Should show verification screen with email
      await expect(
        page.getByText(/Please verify your email to continue/i),
      ).toBeVisible();
    });
  });

  test.describe("Failed Registration", () => {
    test("should show error for duplicate email", async ({ page }) => {
      // Use existing user's email
      await page.getByTestId("register-username").fill("duplicateuser");
      await page.getByTestId("register-email").fill("john.doe@example.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("0");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      // Should show error
      await expect(page.getByTestId("register-error")).toBeVisible();
    });

    test("should show error for duplicate username", async ({ page }) => {
      await page.getByTestId("register-username").fill("johndoe");
      await page.getByTestId("register-email").fill("unique@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1992");
      await page.getByRole("combobox", { name: /month/i }).selectOption("6");
      await page.getByRole("gridcell", { name: "20" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(page.getByTestId("register-error")).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    test("should show error for short username", async ({ page }) => {
      await page.getByTestId("register-username").fill("ab");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      // Don't fill date of birth to trigger validation first
      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/Username must be at least 3 characters/i),
      ).toBeVisible();
      expect(page.url()).toContain("/register");
    });

    test("should show error for invalid username characters", async ({
      page,
    }) => {
      await page.getByTestId("register-username").fill("user@name!");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/can only contain letters, numbers, and underscores/i),
      ).toBeVisible();
    });

    test("should show error for invalid email", async ({ page }) => {
      await page.getByTestId("register-username").fill("validuser123");
      await page.getByTestId("register-email").fill("invalidemail");
      await page.getByTestId("register-password").fill("ValidPass123");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(page.getByText(/Invalid email address/i)).toBeVisible();
    });

    test("should show error for weak password (too short)", async ({
      page,
    }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("Pass1!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/Password must be at least 8 characters/i),
      ).toBeVisible();
    });

    test("should show error for password without uppercase", async ({
      page,
    }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("testpass123!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/Password must contain an uppercase letter/i),
      ).toBeVisible();
    });

    test("should show error for password without lowercase", async ({
      page,
    }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TESTPASS123!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/Password must contain a lowercase letter/i),
      ).toBeVisible();
    });

    test("should show error for password without number", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPassword!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/Password must contain a number/i),
      ).toBeVisible();
    });

    test("should show error for missing date of birth", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(page.getByText(/Date of birth is required/i)).toBeVisible();
    });

    test("should show error for underage user (under 18)", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      // Select date making user 16 years old
      const currentYear = new Date().getFullYear();
      await page.getByTestId("register-dob-button").click();
      await page
        .getByRole("combobox", { name: /year/i })
        .selectOption(String(currentYear - 16));
      await page.getByRole("combobox", { name: /month/i }).selectOption("0");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/You must be at least 18 years old/i),
      ).toBeVisible();
    });

    test("should show error for missing age confirmation", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      // Don't check age checkbox
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/You must confirm you are 18 or older/i),
      ).toBeVisible();
    });

    test("should show error for missing TOS acceptance", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      // Don't check TOS
      await page.getByTestId("register-privacy-checkbox").check();

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/You must accept the Terms of Service/i),
      ).toBeVisible();
    });

    test("should show error for missing Privacy Policy acceptance", async ({
      page,
    }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@test.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      // Don't check privacy

      await page.getByTestId("register-submit").click();

      await expect(
        page.getByText(/You must accept the Privacy Policy/i),
      ).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to login page from sign in link", async ({
      page,
    }) => {
      await page.getByTestId("register-signin-link").click();
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });

    test("should open Terms of Service in new tab", async ({ page }) => {
      const tosLink = page.getByTestId("register-tos-link");
      await expect(tosLink).toHaveAttribute("target", "_blank");
      await expect(tosLink).toHaveAttribute("href", "/terms");
    });

    test("should open Privacy Policy in new tab", async ({ page }) => {
      const privacyLink = page.getByTestId("register-privacy-link");
      await expect(privacyLink).toHaveAttribute("target", "_blank");
      await expect(privacyLink).toHaveAttribute("href", "/privacy");
    });
  });

  test.describe("UI Elements", () => {
    test("should display register form elements", async ({ page }) => {
      await expect(page.getByText("Create an account")).toBeVisible();
      await expect(page.getByTestId("register-username")).toBeVisible();
      await expect(page.getByTestId("register-email")).toBeVisible();
      await expect(page.getByTestId("register-password")).toBeVisible();
      await expect(page.getByTestId("register-dob-button")).toBeVisible();
      await expect(page.getByTestId("register-age-checkbox")).toBeVisible();
      await expect(page.getByTestId("register-tos-checkbox")).toBeVisible();
      await expect(page.getByTestId("register-privacy-checkbox")).toBeVisible();
      await expect(page.getByTestId("register-submit")).toBeVisible();
    });

    test("should show correct placeholders", async ({ page }) => {
      await expect(page.getByTestId("register-username")).toHaveAttribute(
        "placeholder",
        "johndoe",
      );
      await expect(page.getByTestId("register-email")).toHaveAttribute(
        "placeholder",
        "you@example.com",
      );
      await expect(page.getByTestId("register-password")).toHaveAttribute(
        "placeholder",
        "••••••••",
      );
    });

    test("should disable form during submission", async ({ page }) => {
      await page.getByTestId("register-username").fill("testuser");
      await page.getByTestId("register-email").fill("test@example.com");
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      const submitButton = page.getByTestId("register-submit");
      await submitButton.click();

      // Check button text changes (brief check, might be fast)
      await expect(submitButton).toBeDisabled();
    });

    test("should mask password input", async ({ page }) => {
      await expect(page.getByTestId("register-password")).toHaveAttribute(
        "type",
        "password",
      );
    });
  });

  test.describe("Verification Screen", () => {
    test("should show resend verification button", async ({ page }) => {
      // Complete registration
      const timestamp = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      await page.getByTestId("register-username").fill(`verify${timestamp}`);
      await page
        .getByTestId("register-email")
        .fill(`verify${timestamp}@example.com`);
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      // Wait for legal documents to load
      await page.waitForTimeout(5000);

      await page.getByTestId("register-submit").click();

      // Verify screen elements
      await expect(
        page.getByText(/Please verify your email to continue/i),
      ).toBeVisible();
      await expect(page.getByTestId("register-resend-button")).toBeVisible();
      await expect(page.getByTestId("register-back-to-login")).toBeVisible();
    });

    test("should navigate back to login from verification screen", async ({
      page,
    }) => {
      // Complete registration
      const timestamp = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      await page.getByTestId("register-username").fill(`back${timestamp}`);
      await page
        .getByTestId("register-email")
        .fill(`back${timestamp}@example.com`);
      await page.getByTestId("register-password").fill("TestPass123!");

      await page.getByTestId("register-dob-button").click();
      await page.getByRole("combobox", { name: /year/i }).selectOption("1990");
      await page.getByRole("combobox", { name: /month/i }).selectOption("5");
      await page.getByRole("gridcell", { name: "15" }).first().click();

      await page.getByTestId("register-age-checkbox").check();
      await page.getByTestId("register-tos-checkbox").check();
      await page.getByTestId("register-privacy-checkbox").check();

      // Wait for legal documents to load
      await page.waitForTimeout(5000);

      await page.getByTestId("register-submit").click();

      // Verify we're on verification screen
      await expect(
        page.getByText(/Please verify your email to continue/i),
      ).toBeVisible();

      // Click back to login
      await page.getByTestId("register-back-to-login").click();
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper labels for form fields", async ({ page }) => {
      await expect(page.getByLabel(/username/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
    });
  });
});
