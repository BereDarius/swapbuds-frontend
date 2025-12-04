# Testing Lighthouse Locally

Before committing lighthouse changes, test them locally to ensure everything works.

## Quick Test

```bash
# 1. Start backend (in separate terminal)
cd ../swapbuds-backend
docker-compose up -d
yarn prisma migrate deploy
yarn prisma db seed  # Creates lighthouse test users
yarn build
yarn start

# 2. Start frontend (in separate terminal)
cd ../swapbuds-frontend
yarn build
yarn start

# 3. Run lighthouse test (in third terminal)
cd swapbuds-frontend
./scripts/test-lighthouse-local.sh
```

## What the Script Does

1. Verifies backend is running (http://localhost:3001/health)
2. Verifies frontend is running (http://localhost:3000)
3. Installs lighthouse dependencies (puppeteer, lighthouse, chrome-launcher)
4. Authenticates as test users (user, admin)
5. Runs lighthouse audits on all 19 pages
6. Reports pass/fail for each page

## Test Users

Created by `backend/prisma/seed.ts`:

- `lighthouse.user@test.com` / `LighthouseTest123!`
- `lighthouse.admin@test.com` / `LighthouseTest123!`
- `lighthouse.moderator@test.com` / `LighthouseTest123!`
- `lighthouse.support@test.com` / `LighthouseTest123!`

## Expected Output

```
🧪 Local Lighthouse Test
=======================

1️⃣ Checking backend...
✅ Backend is running

2️⃣ Checking frontend...
✅ Frontend is running

3️⃣ Installing Lighthouse dependencies...
[yarn output]

4️⃣ Authenticating test users...
✅ Authenticated as lighthouse.user@test.com
✅ Authenticated as lighthouse.admin@test.com

5️⃣ Running Lighthouse audits...

🌐 Testing Public Pages...
📊 home Scores:
   Performance: 95
   Accessibility: 98
   Best Practices: 92
   SEO: 100
...

👤 Testing User Pages...
...

⚙️ Testing Admin Pages...
...

✅ All pages passed Lighthouse audits
```

## Troubleshooting

**Backend not running:**

```bash
cd ../swapbuds-backend
docker-compose up -d
yarn start
```

**Frontend not running:**

```bash
yarn build
yarn start
```

**Authentication fails:**

- Verify test users exist: `cd ../swapbuds-backend && yarn prisma studio`
- Check user table for `lighthouse.*@test.com` entries
- Re-run seed: `yarn prisma db seed`

**Lighthouse scores fail:**

- Open HTML reports in `.lighthouseci/` directory
- Check specific failing metrics
- Common issues: large bundle size, missing alt text, poor CLS

## Viewing Reports

```bash
open .lighthouseci/home-*.html
open .lighthouseci/items-*.html
# etc.
```

## Manual Testing (Without Script)

```bash
# Install deps
yarn add -D puppeteer lighthouse chrome-launcher

# Authenticate
node scripts/lighthouse-auth.js user
node scripts/lighthouse-auth.js admin

# Run audits
node scripts/lighthouse-runner.js
```

## Cleanup

```bash
# Remove generated files
rm .lighthouse-cookies-*.json
rm -rf .lighthouseci/

# Stop servers
# Ctrl+C in backend and frontend terminals
```
