import { Page } from "@playwright/test";

/**
 * Mock reCAPTCHA to speed up tests and avoid verification issues
 */
export async function mockRecaptcha(page: Page) {
  // Inject Playwright flag BEFORE any page loads
  // This must be the FIRST thing that runs
  await page.addInitScript(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__PLAYWRIGHT__ = true;
  });

  // Intercept reCAPTCHA script loads to prevent network requests
  await page.route("**/*recaptcha*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "// reCAPTCHA mocked for E2E tests",
    });
  });
}

/**
 * Login as a specific user
 */
export async function loginAsUser(page: Page, email: string, password: string) {
  // Mock reCAPTCHA before navigating
  await mockRecaptcha(page);

  await page.goto("/login");

  // Wait for page to load completely
  await page.waitForLoadState("networkidle");

  // Fill in credentials
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);

  // Click sign in button and wait for navigation
  // The login page redirects to "/" after successful authentication
  // (the useEffect redirect happens before handleSubmit's router.push("/items"))
  await page.getByTestId("login-submit").click();

  // Wait for redirect away from /login (either to "/" or "/items")
  await page.waitForURL((url) => url.pathname !== "/login", {
    timeout: 10000,
  });
}
/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  await loginAsUser(page, "admin@swapbuds.com", "Password123!");
}

/**
 * Login as regular user (johndoe)
 */
export async function loginAsRegularUser(page: Page) {
  await loginAsUser(page, "john.doe@example.com", "Password123!");
}

/**
 * Login as moderator user
 */
export async function loginAsModerator(page: Page) {
  await loginAsUser(page, "moderator@swapbuds.com", "Password123!");
}

/**
 * Skip authentication for tests that don't need it
 */
export async function skipAuth(page: Page) {
  await mockRecaptcha(page);
}
