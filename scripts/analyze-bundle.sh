#!/bin/bash

# Bundle Analysis Script
# Analyzes the Next.js bundle size and generates a visual report

echo "📦 Starting bundle analysis..."
echo ""

# Check if @next/bundle-analyzer is installed
if ! grep -q "@next/bundle-analyzer" package.json; then
  echo "⚠️  @next/bundle-analyzer not found. Installing..."
  npm install --save-dev @next/bundle-analyzer
fi

# Set environment variable to enable bundle analyzer
export ANALYZE=true

# Build with analysis
echo "🔨 Building with bundle analyzer..."
npm run build

echo ""
echo "✅ Bundle analysis complete!"
echo "📊 Check the generated HTML reports in .next/analyze/"
echo ""
echo "Bundle reports:"
echo "  - Client: .next/analyze/client.html"
echo "  - Server: .next/analyze/server.html"
echo "  - Edge: .next/analyze/edge.html (if applicable)"
