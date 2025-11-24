# E2E Testing Guide

This document describes the end-to-end (E2E) testing setup for the SwapBuds frontend application.

## Technology Stack

- **Playwright** - Modern E2E testing framework
- **TypeScript** - Type-safe test writing
- **Multi-browser** - Tests run on Chromium, Firefox, WebKit, and mobile browsers

## Test Structure

```
e2e/
├── auth/
│   ├── login.spec.ts          # Login flow tests
│   └── register.spec.ts       # Registration flow tests
└── legal/
    └── cookie-consent.spec.ts # Cookie consent tests
```

## Running Tests

### All Tests (Headless)

```bash
yarn test:e2e
```

### Interactive UI Mode

```bash
yarn test:e2e:ui
```

Opens Playwright's UI mode where you can see tests run, time-travel debug, and inspect DOM.

### Headed Mode (See Browser)

```bash
yarn test:e2e:headed
```

Runs tests with browser window visible.

### Specific Browser

```bash
yarn test:e2e:chromium
yarn test:e2e:firefox
yarn test:e2e:webkit
```

### Mobile Tests Only

```bash
yarn test:e2e:mobile
```

### Debug Mode

```bash
yarn test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### View Report

```bash
yarn test:e2e:report
```

Opens the HTML report from the last test run.

## Test Coverage

### Authentication Tests

**Login (`e2e/auth/login.spec.ts`)**

- ✅ Form display and validation
- ✅ Email format validation
- ✅ Password length validation
- ✅ Invalid credentials handling
- ✅ Loading states
- ✅ reCAPTCHA integration
- ✅ Error handling
- ✅ Navigation to registration

**Registration (`e2e/auth/register.spec.ts`)**

- ✅ Form display and validation
- ✅ Password requirements (8+ chars, uppercase, lowercase, number)
- ✅ Date of birth fields
- ✅ Age verification (18+ requirement)
- ✅ Age declaration checkbox
- ✅ Legal consent checkboxes (TOS, Privacy)
- ✅ Optional marketing consent
- ✅ reCAPTCHA integration
- ✅ Links to legal documents

### Legal Compliance Tests

**Cookie Consent (`e2e/legal/cookie-consent.spec.ts`)**

- ✅ Banner display on first visit
- ✅ Accept all functionality
- ✅ Reject all functionality
- ✅ Customize preferences modal
- ✅ Cookie categories (Essential, Functional, Analytics, Marketing)
- ✅ Essential cookies always enabled
- ✅ Toggle optional categories
- ✅ Save preferences
- ✅ Links to legal documents
- ✅ Persistence across pages
- ✅ Settings page integration
- ✅ Mobile responsive tests

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Base URL**: http://localhost:3000
- **Reporters**: HTML, List, GitHub (on CI)
- **Screenshots**: On failure only
- **Traces**: On first retry

### Test Projects

1. **Desktop Chrome** - Primary browser
2. **Desktop Firefox** - Cross-browser compatibility
3. **Desktop Safari** - WebKit engine
4. **Mobile Chrome** - Pixel 5 viewport
5. **Mobile Safari** - iPhone 12 viewport

## Writing New Tests

### Basic Test Structure

```typescript
import { expect, test } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/your-route");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    const button = page.getByRole("button", { name: /click me/i });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText(/success/i)).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Locators**

   - Prefer `getByRole()`, `getByLabel()`, `getByText()`
   - Avoid CSS selectors when possible

2. **Wait for Elements**

   ```typescript
   await expect(element).toBeVisible({ timeout: 5000 });
   ```

3. **Clean State**

   - Clear cookies/localStorage in `beforeEach` when needed
   - Use `test.beforeEach()` for setup

4. **Test User Flows**

   - Test complete user journeys, not just individual actions
   - Include happy path and error cases

5. **Mobile Testing**
   ```typescript
   test.use({ viewport: { width: 375, height: 667 } });
   ```

## CI/CD Integration

Tests are configured to run in CI environments with:

- GitHub reporter for integration with GitHub Actions
- 2 automatic retries for flaky tests
- Single worker (no parallel execution)
- Automatic test report artifacts

### Environment Variables

Required for CI:

```bash
CI=true                              # Enables CI-specific config
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx   # reCAPTCHA key (can be test key)
```

## Common Issues

### reCAPTCHA in Tests

reCAPTCHA v3 is invisible and should work in tests. For local testing, ensure:

1. `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
2. Use test keys from Google reCAPTCHA console for localhost

### Timeouts

If tests timeout waiting for reCAPTCHA:

- Increase timeout in assertions: `{ timeout: 10000 }`
- Check network connectivity
- Verify reCAPTCHA keys are valid

### Flaky Tests

If tests are flaky:

1. Add explicit waits: `await expect(element).toBeVisible()`
2. Use `test.setTimeout()` for slow operations
3. Avoid `page.waitForTimeout()` - use event-based waits

## Debug Tips

### Visual Debugging

```bash
yarn test:e2e:ui
```

Best for seeing what's happening in real-time.

### Step-by-Step Debugging

```bash
yarn test:e2e:debug
```

Pauses before each action, shows DOM inspector.

### Screenshots on Failure

Check `test-results/` folder for screenshots from failed tests.

### Trace Viewer

After a test failure:

```bash
yarn test:e2e:report
```

Opens trace viewer with timeline, network, console logs.

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Configuration](https://playwright.dev/docs/ci)
