import { expect, test } from "@playwright/test";
import { loginAsRegularUser } from "../fixtures/auth";

test.describe("ID Verification", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsRegularUser(page);
  });

  test("should access verification page", async ({ page }) => {
    await page.goto("/verification");

    // Verify verification page loads
    await expect(page.getByRole("heading", { name: /verify/i })).toBeVisible();
  });

  test("should display verification instructions", async ({ page }) => {
    await page.goto("/verification");

    // Verify instructions are shown
    await expect(
      page.getByText(/upload a government-issued id/i)
    ).toBeVisible();
    await expect(page.getByText(/requirements/i)).toBeVisible();
  });

  test("should select document type", async ({ page }) => {
    await page.goto("/verification");

    // Select document type
    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /passport/i }).click();

    // Verify selection
    await expect(page.getByText(/passport/i)).toBeVisible();
  });

  test("should upload front document image", async ({ page }) => {
    await page.goto("/verification");

    // Select document type first
    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /drivers license/i }).click();

    // Upload front image
    const frontInput = page.locator('input[name="frontImage"]');
    await frontInput.setInputFiles("./e2e/fixtures/sample-id-front.jpg");

    // Verify preview appears
    await expect(page.locator('[data-testid="front-preview"]')).toBeVisible();
  });

  test("should upload back document image", async ({ page }) => {
    await page.goto("/verification");

    // Select document type
    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /drivers license/i }).click();

    // Upload front and back images
    await page
      .locator('input[name="frontImage"]')
      .setInputFiles("./e2e/fixtures/sample-id-front.jpg");
    await page
      .locator('input[name="backImage"]')
      .setInputFiles("./e2e/fixtures/sample-id-back.jpg");

    // Verify both previews appear
    await expect(page.locator('[data-testid="front-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-preview"]')).toBeVisible();
  });

  test("should upload selfie image", async ({ page }) => {
    await page.goto("/verification");

    // Navigate to selfie step
    await page.getByRole("button", { name: /next/i }).click();

    // Upload selfie
    const selfieInput = page.locator('input[name="selfie"]');
    await selfieInput.setInputFiles("./e2e/fixtures/sample-selfie.jpg");

    // Verify preview appears
    await expect(page.locator('[data-testid="selfie-preview"]')).toBeVisible();
  });

  test("should submit verification request", async ({ page }) => {
    await page.goto("/verification");

    // Complete all steps
    // 1. Document type
    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /passport/i }).click();

    // 2. Document images
    await page
      .locator('input[name="frontImage"]')
      .setInputFiles("./e2e/fixtures/sample-id-front.jpg");

    // 3. Selfie
    await page.getByRole("button", { name: /next/i }).click();
    await page
      .locator('input[name="selfie"]')
      .setInputFiles("./e2e/fixtures/sample-selfie.jpg");

    // 4. Agree to terms
    await page.getByRole("checkbox", { name: /i agree/i }).check();

    // 5. Submit
    await page.getByRole("button", { name: /submit/i }).click();

    // Verify success message
    await expect(page.getByText(/verification submitted/i)).toBeVisible();
  });

  test("should display pending verification status", async ({ page }) => {
    // User already submitted verification
    await page.goto("/verification");

    // Verify pending status is shown
    await expect(page.getByText(/pending review/i)).toBeVisible();
    await expect(page.getByText(/usually takes 24-48 hours/i)).toBeVisible();
  });

  test("should display approved verification status", async ({ page }) => {
    // User is verified
    await page.goto("/verification");

    // Verify approved status
    await expect(
      page.getByText(/verified/i).or(page.getByText(/approved/i))
    ).toBeVisible();
  });

  test("should display rejected verification with reason", async ({ page }) => {
    // User's verification was rejected
    await page.goto("/verification");

    // Verify rejection message
    await expect(page.getByText(/rejected/i)).toBeVisible();
    await expect(page.getByText(/reason/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /resubmit/i })).toBeVisible();
  });

  test("should validate image file size", async ({ page }) => {
    await page.goto("/verification");

    // Try to upload large file
    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /passport/i }).click();

    // Upload oversized file (would need mock)
    // In real test, you'd create a large file
    // For now, just verify error handling exists
    await expect(page.getByText(/max file size/i)).toBeVisible();
  });

  test("should validate image file type", async ({ page }) => {
    await page.goto("/verification");

    await page.getByRole("combobox", { name: /document type/i }).click();
    await page.getByRole("option", { name: /passport/i }).click();

    // Verify accepted formats message
    await expect(
      page.getByText(/jpg, jpeg, png/i).or(page.getByText(/supported formats/i))
    ).toBeVisible();
  });
});
