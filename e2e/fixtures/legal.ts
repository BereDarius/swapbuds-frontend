import { Page } from "@playwright/test";

/**
 * Mock the legal documents API to return test data
 * This prevents API calls to /api/legal/* during E2E tests
 */
export async function mockLegalDocuments(page: Page) {
  // Mock the Terms of Service endpoint - use flexible pattern for cross-browser compatibility
  await page.route(
    (url) =>
      url.pathname.includes("/api/legal/documents/TERMS_OF_SERVICE") &&
      url.searchParams.get("lang") === "EN",
    (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-tos-id",
          type: "TERMS_OF_SERVICE",
          version: "1.0.0",
          language: "EN",
          content: "Test Terms of Service content",
          effectiveDate: new Date().toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    },
  );

  // Mock the Privacy Policy endpoint - use flexible pattern for cross-browser compatibility
  await page.route(
    (url) =>
      url.pathname.includes("/api/legal/documents/PRIVACY_POLICY") &&
      url.searchParams.get("lang") === "EN",
    (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-privacy-id",
          type: "PRIVACY_POLICY",
          version: "1.0.0",
          language: "EN",
          content: "Test Privacy Policy content",
          effectiveDate: new Date().toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
    },
  );
}
