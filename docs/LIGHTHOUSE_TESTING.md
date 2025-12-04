# Lighthouse Performance Testing

## Overview

Comprehensive Lighthouse CI testing runs on every PR, testing both **public** and **protected pages** (authenticated with different user roles) to ensure production-ready performance across all user journeys.

## Architecture

### Single Unified Workflow (`lighthouse.yml`)

**Duration:** ~20-30 minutes
**Triggers:** PRs to main/develop with frontend changes

**Infrastructure:**

1. Spins up services (PostgreSQL + Redis)
2. Clones both backend and frontend repos
3. Runs database migrations
4. Seeds database using existing `backend/prisma/seed.ts` (includes lighthouse test users)
5. Starts backend server (port 3001)
6. Starts frontend server (port 3000)
7. Authenticates test users via Puppeteer
8. Runs Lighthouse audits with session cookies
9. Uploads reports to PR

### Test Users (Integrated in Prisma Seed)

The backend's main seed script includes lighthouse test users:

```typescript
// backend/prisma/seeds/users.seed.ts
{
  email: 'lighthouse.user@test.com',
  username: 'lighthouse_user',
  password: await bcrypt.hash('LighthouseTest123!', 10),
  role: 'USER',
  // ... all required fields
}
// + admin, moderator, support variants
```

**Credentials:**

- Email: `lighthouse.{role}@test.com`
- Password: `LighthouseTest123!`
- Roles: user, admin, moderator, support

## Pages Tested (19 Total)

### Public Pages (7)

No authentication required:

- Home (`/`)
- Login (`/login`)
- Register (`/register`)
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Community Guidelines (`/guidelines`)
- Cookie Policy (`/cookies`)

### Regular User Pages (8)

Authenticated as `lighthouse.user@test.com`:

- Browse items (`/items`)
- List new item (`/items/new`)
- My trades (`/trades`)
- Messages (`/messages`)
- Notifications (`/notifications`)
- Settings (`/settings`)
- Support tickets (`/support`)
- ID verification (`/verification`)

### Admin Pages (4)

Authenticated as `lighthouse.admin@test.com`:

- Admin dashboard (`/admin`)
- User management (`/admin/users`)
- Verification queue (`/admin/verification`)
- Moderation tools (`/admin/moderation`)

## Authentication Flow

### How Puppeteer Auth Works

```javascript
// scripts/lighthouse-auth.js
const browser = await puppeteer.launch();
const page = await browser.newPage();

// Navigate to login
await page.goto("http://localhost:3000/login");

// Fill credentials
await page.type('input[name="email"]', "lighthouse.user@test.com");
await page.type('input[name="password"]', "LighthouseTest123!");

// Submit and wait for redirect
await page.click('button[type="submit"]');
await page.waitForNavigation();

// Extract and save cookies
const cookies = await page.cookies();
fs.writeFileSync(".lighthouse-cookies-user.json", JSON.stringify(cookies));
```

### Using Cookies in Lighthouse

```javascript
// scripts/lighthouse-runner.js
const cookies = JSON.parse(fs.readFileSync(".lighthouse-cookies-user.json"));

const options = {
  extraHeaders: {
    Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
  },
};

await lighthouse(url, options);
```

## Performance Budgets

### Scores (Error if Below)

- **Performance:** ≥90%
- **Accessibility:** ≥90%
- **Best Practices:** ≥90%
- **SEO:** ≥90%

### Core Web Vitals (Warning if Above)

- **First Contentful Paint (FCP):** ≤2000ms
- **Largest Contentful Paint (LCP):** ≤2500ms
- **Cumulative Layout Shift (CLS):** ≤0.1
- **Total Blocking Time (TBT):** ≤300ms
- **Speed Index:** ≤3000ms
- **Time to Interactive (TTI):** ≤3500ms

## Local Testing

### Prerequisites

- Backend running on port 3001
- Database seeded with test users
- Frontend built and running on port 3000

### Steps

```bash
# 1. Start backend (in backend repo)
cd swapbuds-backend
docker-compose up -d  # Start postgres + redis
yarn prisma migrate deploy
yarn prisma db seed   # Creates lighthouse test users!
yarn build
yarn start

# 2. Start frontend (in frontend repo)
cd swapbuds-frontend
yarn build
yarn start

# 3. Run Lighthouse audits
node scripts/lighthouse-auth.js user
node scripts/lighthouse-auth.js admin
node scripts/lighthouse-runner.js
```

### Quick Local Test (Public Pages Only)

```bash
yarn build
yarn start
yarn lighthouse:local
```

## E2E Tests Integration

This infrastructure is **reusable for Playwright E2E tests**:

```yaml
# .github/workflows/e2e.yml (future)
jobs:
  e2e:
    services:
      postgres:
        image: postgres:15-alpine
      redis:
        image: redis:7-alpine

    steps:
      - name: Checkout repos
      - name: Start backend
      - name: Seed database # ← Same seed!
      - name: Start frontend
      - name: Run Playwright tests
```

**Benefits:**

- Same CI infrastructure
- Same test users (consistency)
- Backend + frontend integration validated
- No duplication

## Why This Matters

### Problem Without Authenticated Testing

❌ Protected routes redirect to `/login` when unauthenticated
❌ Testing login page 15+ times doesn't validate actual UX
❌ Miss performance issues in real user flows
❌ Can't test role-specific pages (admin, moderator)
❌ No validation of data-heavy pages (trades with history, messages)

### Solution With Authenticated Testing

✅ Test actual user flows with real sessions
✅ Catch role-specific performance issues
✅ Validate admin tools are performant
✅ Test pages with authentication context
✅ Production-ready confidence

## Debugging Failed Audits

### View Reports

1. Go to PR checks → "Lighthouse CI"
2. Click "Details" → Scroll to artifacts
3. Download "lighthouse-reports" artifact
4. Open HTML reports in browser

### Common Issues

**Low Performance Score:**

- Check TBT and LCP in report
- Review JavaScript bundle size
- Inspect network waterfall
- Look for render-blocking resources

**Low Accessibility Score:**

- Missing alt text on images
- Insufficient color contrast
- Missing ARIA labels
- Keyboard navigation issues

**Failed Authentication:**

- Backend not ready (check health endpoint)
- Database migration failed
- Cookie domain mismatch
- Session expiration

## Maintenance

### Adding New Pages

Edit `scripts/lighthouse-runner.js`:

```javascript
const pages = {
  user: [
    // ... existing pages
    { url: "http://localhost:3000/new-page", name: "new-page" },
  ],
};
```

### Adding New Test User Role

Edit `backend/prisma/seeds/users.seed.ts`:

```typescript
{
  email: 'lighthouse.newrole@test.com',
  username: 'lighthouse_newrole',
  password: lighthousePassword,
  role: UserRole.NEWROLE,
  isVerified: true,
  emailVerified: true,
  // ... required fields
}
```

Then update authentication script:

```javascript
// scripts/lighthouse-auth.js
const users = {
  // ... existing users
  newrole: {
    email: "lighthouse.newrole@test.com",
    password: "LighthouseTest123!",
  },
};
```

### Adjusting Performance Budgets

Edit `.lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "largest-contentful-paint": ["warn", { "maxNumericValue": 3000 }]
      }
    }
  }
}
```

## Resources

- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Puppeteer Authentication](https://pptr.dev/)
- [Web Vitals Thresholds](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
