#!/bin/bash

# Performance Measurement Script
# Runs Lighthouse audits on key pages and saves reports

echo "🚀 Performance Measurement Suite"
echo "================================="
echo ""

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "⚠️  Lighthouse not found. Installing globally..."
    npm install -g lighthouse
fi

# Create reports directory
REPORTS_DIR="./lighthouse-reports"
mkdir -p "$REPORTS_DIR"

# URLs to test (adjust based on your setup)
BASE_URL="${1:-http://localhost:3000}"

PAGES=(
  "/"
  "/items"
  "/items/new"
  "/trades"
  "/messages"
  "/notifications"
  "/settings"
  "/support"
  "/verification"
  "/login"
  "/register"
  "/terms"
  "/privacy"
  "/guidelines"
  "/cookies"
)

echo "📊 Testing pages on: $BASE_URL"
echo ""

# Run Lighthouse for each page
for PAGE in "${PAGES[@]}"; do
  URL="${BASE_URL}${PAGE}"
  PAGE_NAME=$(echo "$PAGE" | sed 's/\//-/g' | sed 's/^-//')
  [ -z "$PAGE_NAME" ] && PAGE_NAME="home"

  REPORT_FILE="${REPORTS_DIR}/lighthouse-${PAGE_NAME}-$(date +%Y%m%d-%H%M%S).html"

  echo "🔍 Testing: $URL"
  lighthouse "$URL" \
    --output=html \
    --output-path="$REPORT_FILE" \
    --chrome-flags="--headless" \
    --quiet \
    --only-categories=performance,accessibility,best-practices,seo

  echo "   ✅ Report saved: $REPORT_FILE"
  echo ""
done

echo "================================="
echo "✅ Performance measurement complete!"
echo "📁 Reports saved in: $REPORTS_DIR"
echo ""
echo "📊 Summary:"
ls -lh "$REPORTS_DIR" | tail -n +2
