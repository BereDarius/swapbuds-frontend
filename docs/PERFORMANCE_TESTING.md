# Performance Testing Guide

Step-by-step guide to measure and track performance improvements.

## Prerequisites

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Ensure production build works
npm run build
npm start
```

## 1. Baseline Lighthouse Audits

### Run Lighthouse in Chrome DevTools

1. **Build for production:**

   ```bash
   npm run build
   npm start
   ```

2. **Open Chrome DevTools** (F12)

3. **Navigate to Lighthouse tab**

4. **Configure audit:**

   - Mode: Navigation
   - Device: Mobile & Desktop (run both)
   - Categories: Performance, Accessibility, Best Practices, SEO
   - Throttling: Simulated throttling (default)

5. **Run audits for key pages:**

   - Homepage: `http://localhost:3000`
   - Items list: `http://localhost:3000/items`
   - Item detail: `http://localhost:3000/items/[id]`
   - Login: `http://localhost:3000/login`

6. **Record baseline scores:**

| Page        | Device  | Performance | FCP    | LCP    | CLS    | TBT    | Speed Index |
| ----------- | ------- | ----------- | ------ | ------ | ------ | ------ | ----------- |
| Homepage    | Mobile  | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |
| Homepage    | Desktop | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |
| Items       | Mobile  | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |
| Items       | Desktop | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |
| Item Detail | Mobile  | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |
| Item Detail | Desktop | \_\_\_      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_      |

### Lighthouse CI (Optional)

For automated testing:

```bash
npm install --save-dev @lhci/cli

# Create lighthouserc.json
cat > lighthouserc.json << 'EOF'
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run build && npm start",
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/items",
        "http://localhost:3000/login"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}]
      }
    }
  }
}
EOF

# Run Lighthouse CI
npx lhci autorun
```

## 2. Bundle Size Analysis

### Install Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer
```

### Update next.config.ts

```typescript
// Add at the top
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Wrap config
module.exports = withBundleAnalyzer(nextConfig);
```

### Run Bundle Analysis

```bash
ANALYZE=true npm run build
```

This will:

1. Build the production bundle
2. Open browser with interactive bundle visualization
3. Show size of each chunk and dependency

### Record Baseline Bundle Sizes

From the build output:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    ___ kB        ___ kB
├ ○ /items                               ___ kB        ___ kB
├ ○ /items/[id]                          ___ kB        ___ kB
├ ○ /login                               ___ kB        ___ kB
└ ○ /register                            ___ kB        ___ kB

○ (Static)  prerendered as static content
```

**Total Bundle Sizes:**

- Total JS: \_\_\_ KB
- Total CSS: \_\_\_ KB
- Largest chunk: **_ KB (_** file)
- Vendor chunk: \_\_\_ KB
- React chunk: \_\_\_ KB

### Identify Large Dependencies

In the bundle analyzer, look for:

- Dependencies > 50KB
- Duplicate packages
- Unnecessary polyfills
- Heavy icon libraries

## 3. Network Performance Testing

### Chrome DevTools Network Tab

1. **Open DevTools** (F12) > **Network** tab

2. **Configure throttling:**

   - Fast 3G (1.6 Mbps, 150ms RTT)
   - Slow 3G (400 Kbps, 400ms RTT)
   - Custom (test specific conditions)

3. **Record metrics:**
   - Disable cache
   - Hard reload (Cmd/Ctrl + Shift + R)
   - Record DOMContentLoaded and Load times

| Page     | Network | DOMContentLoaded | Load      | Requests | Size      |
| -------- | ------- | ---------------- | --------- | -------- | --------- |
| Homepage | Fast 3G | \_\_\_ ms        | \_\_\_ ms | \_\_\_   | \_\_\_ KB |
| Homepage | Slow 3G | \_\_\_ ms        | \_\_\_ ms | \_\_\_   | \_\_\_ KB |
| Items    | Fast 3G | \_\_\_ ms        | \_\_\_ ms | \_\_\_   | \_\_\_ KB |
| Items    | Slow 3G | \_\_\_ ms        | \_\_\_ ms | \_\_\_   | \_\_\_ KB |

### WebPageTest (Optional)

For more detailed analysis:

1. Go to https://www.webpagetest.org
2. Test URL: Your production URL or ngrok tunnel
3. Configuration:
   - Location: Multiple (US, Europe, Asia)
   - Browser: Chrome
   - Connection: 3G/4G/Cable
   - Repeat View: First View and Repeat View
4. Advanced: Enable filmstrip, capture video

## 4. Core Web Vitals Monitoring

### Development Testing

Web Vitals are automatically logged to console in development:

```bash
npm run dev
# Check browser console for Web Vitals logs
```

### Production Monitoring

Web Vitals are sent to Sentry in production. View them:

1. Go to Sentry dashboard
2. Navigate to **Performance** > **Web Vitals**
3. Check metrics:
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1
   - FCP (First Contentful Paint): < 1.8s
   - TTFB (Time to First Byte): < 800ms

### Manual CrUX Data (Chrome User Experience Report)

Check real user data for your production site:

```bash
# Install CrUX API CLI
npm install -g crux

# Query your site
crux https://your-production-url.com
```

## 5. Device Testing

### Real Device Testing

Test on actual devices:

**iOS (Safari):**

- iPhone SE (low-end)
- iPhone 12/13 (mid-range)
- iPhone 14 Pro (high-end)

**Android (Chrome):**

- Samsung Galaxy A series (low-end)
- Google Pixel (mid-range)
- Samsung Galaxy S series (high-end)

**Tablets:**

- iPad
- Android tablet

### Browser DevTools Device Emulation

1. Open DevTools (F12)
2. Click device toolbar icon (Cmd/Ctrl + Shift + M)
3. Select device:
   - iPhone SE (375x667)
   - iPhone 14 Pro Max (430x932)
   - iPad (768x1024)
   - Galaxy S20 (360x800)
   - Pixel 5 (393x851)

### Performance Throttling

Test with CPU throttling:

1. DevTools > Performance tab
2. Click gear icon
3. Enable CPU throttling (4x or 6x slowdown)
4. Simulates low-end devices

## 6. Accessibility Testing

### Reduced Motion

Test with reduced motion enabled:

**macOS:**
System Preferences > Accessibility > Display > Reduce motion

**Windows:**
Settings > Ease of Access > Display > Show animations

**Browser:**
DevTools > Rendering > Emulate CSS prefers-reduced-motion

### Screen Reader Testing

**macOS:** VoiceOver (Cmd + F5)
**Windows:** NVDA or JAWS
**Chrome:** ChromeVox extension

### Keyboard Navigation

Test without mouse:

- Tab through all interactive elements
- Enter/Space to activate
- Escape to close dialogs
- Arrow keys in dropdowns

## 7. Load Testing (Optional)

For testing under load:

```bash
# Install Artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: "/"
      - get:
          url: "/items"
      - get:
          url: "/login"
EOF

# Run load test
artillery run load-test.yml
```

## 8. Results Tracking

### Create Baseline Report

```markdown
# Performance Baseline - [Date]

## Lighthouse Scores

### Homepage

- **Mobile Performance:** \_\_\_/100
- **Desktop Performance:** \_\_\_/100
- **Accessibility:** \_\_\_/100
- **Best Practices:** \_\_\_/100
- **SEO:** \_\_\_/100

### Key Metrics

- **LCP:** \_\_\_ s
- **FID:** \_\_\_ ms
- **CLS:** \_\_\_
- **FCP:** \_\_\_ s
- **TTFB:** \_\_\_ ms

## Bundle Sizes

- **Total JS:** \_\_\_ KB (gzipped)
- **Total CSS:** \_\_\_ KB (gzipped)
- **Largest Chunk:** \_\_\_ KB

## Network Performance (Fast 3G)

- **DOMContentLoaded:** \_\_\_ ms
- **Load:** \_\_\_ ms
- **Total Requests:** \_\_\_
- **Total Size:** \_\_\_ KB

## Issues Identified

1. ***
2. ***
3. ***

## Recommendations

1. ***
2. ***
3. ***
```

### Compare After Optimizations

After implementing optimizations:

1. Run all tests again
2. Record new metrics
3. Calculate improvements:
   - Bundle size reduction: `((old - new) / old) * 100%`
   - Performance score improvement: `new - old`
   - Load time reduction: `((old - new) / old) * 100%`

### Target Improvements

Based on our optimizations:

- **Bundle Size:** 20-30% reduction
- **LCP:** 15-25% improvement
- **Performance Score:** +10-20 points
- **Total Load Time:** 20-30% faster

## 9. Continuous Monitoring

### Set Up Performance Budget

Add to `lighthouserc.json`:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }],
        "speed-index": ["error", { "maxNumericValue": 3400 }]
      }
    }
  }
}
```

### Add to CI/CD

```yaml
# .github/workflows/performance.yml
name: Performance
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx lhci autorun
```

## 10. Tools Reference

### Required

- Chrome DevTools (built-in)
- Lighthouse (built-in to Chrome)

### Recommended

- @next/bundle-analyzer
- WebPageTest
- Lighthouse CI

### Optional

- Artillery (load testing)
- CrUX CLI (real user data)
- SpeedCurve (continuous monitoring)
- Calibre (performance monitoring)

## Quick Test Commands

```bash
# Production build
npm run build && npm start

# Bundle analysis
ANALYZE=true npm run build

# Lighthouse CI
npx lhci autorun

# Check build sizes
npm run build | grep -A 20 "Route (app)"
```

---

**Next Steps:**

1. Run baseline tests
2. Record metrics in checklist
3. Implement remaining optimizations
4. Re-test and compare results
