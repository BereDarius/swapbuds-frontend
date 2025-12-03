#!/bin/bash

# Local Lighthouse Test Script
# Tests the full lighthouse setup locally before CI

set -e

echo "🧪 Local Lighthouse Test"
echo "======================="
echo ""

# Check if backend is running
echo "1️⃣ Checking backend..."
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "❌ Backend not running on port 3001"
  echo "   Start it with: cd ../swapbuds-backend && yarn start:prod"
  exit 1
fi
echo "✅ Backend is running"

# Check if frontend is running
echo ""
echo "2️⃣ Checking frontend..."
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Frontend not running on port 3000"
  echo "   Build and start with: NEXT_PUBLIC_SKIP_RECAPTCHA=true yarn build && NEXT_PUBLIC_SKIP_RECAPTCHA=true yarn start"
  exit 1
fi
echo "✅ Frontend is running"

# Authenticate users
echo ""
echo "3️⃣ Authenticating test users..."
npx tsx scripts/lighthouse-auth.ts user
npx tsx scripts/lighthouse-auth.ts admin

# Run lighthouse
echo ""
echo "4️⃣ Running Lighthouse audits..."
node scripts/lighthouse-runner.mjs

echo ""
echo "✅ Test complete! Check .lighthouseci/ for reports"
