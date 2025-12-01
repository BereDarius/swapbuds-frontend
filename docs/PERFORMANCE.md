# Performance Optimization Guide

This document outlines the performance optimizations implemented in the SwapBuds frontend application.

## Table of Contents

- [Overview](#overview)
- [Build-Time Optimizations](#build-time-optimizations)
- [Runtime Optimizations](#runtime-optimizations)
- [Image Optimization](#image-optimization)
- [Code Splitting](#code-splitting)
- [Web Vitals Tracking](#web-vitals-tracking)
- [Best Practices](#best-practices)
- [Measuring Performance](#measuring-performance)

## Overview

Our performance strategy focuses on three key areas:

1. **Build-time optimizations** - Reducing bundle size and optimizing production builds
2. **Runtime optimizations** - Improving perceived and actual performance during user interactions
3. **Monitoring** - Tracking Core Web Vitals and identifying bottlenecks

## Build-Time Optimizations

### Next.js Configuration

The `next.config.ts` file includes comprehensive build optimizations:

```typescript
// Image optimization
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}

// React 19 Compiler
experimental: {
  reactCompiler: true,
}

// Package import optimization
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-*',
    'lucide-react',
  ],
}

// Webpack bundle splitting
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
      },
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true,
      },
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        priority: 20,
      },
      radix: {
        test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
        name: 'radix-ui',
        priority: 15,
      },
    },
  };
}
```

**Benefits:**

- AVIF/WebP format support reduces image sizes by 30-50%
- React 19 compiler optimizes component rendering
- Package import optimization reduces bundle sizes for tree-shaking
- Smart code splitting enables better caching and parallel downloads

### Development vs Production

Development-only code is automatically excluded from production builds:

```typescript
// React Query Devtools (only in development)
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (mod) => mod.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : () => null;
```

**Savings:** ~150KB removed from production bundle

## Runtime Optimizations

### Performance Utilities

Located in `src/lib/performance.ts`:

#### Function Performance Measurement

```typescript
import { measurePerformance } from "@/lib/performance";

const result = await measurePerformance("fetchUserData", async () => {
  return await api.getUser(userId);
});
```

#### Debouncing (Search, Input)

```typescript
import { debounce } from "@/lib/performance";

const debouncedSearch = debounce((query: string) => {
  searchItems(query);
}, 300);
```

**Use cases:**

- Search input fields
- Form validation
- Window resize handlers
- Scroll event handlers (when only final position matters)

#### Throttling (Scroll, Resize)

```typescript
import { throttle } from "@/lib/performance";

const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

**Use cases:**

- Scroll position tracking
- Animation updates
- Progress indicators
- Any handler that needs immediate feedback but rate-limiting

#### Network-Aware Loading

```typescript
import { getConnectionSpeed } from "@/lib/performance";

const speed = getConnectionSpeed();

if (speed === "slow") {
  // Load lower quality images
  // Reduce animations
  // Defer non-critical resources
} else {
  // Load full quality assets
}
```

#### Accessibility-Aware Animations

```typescript
import { prefersReducedMotion } from "@/lib/performance";

if (!prefersReducedMotion()) {
  // Enable animations
  animateElement();
}
```

## Image Optimization

### OptimizedImage Component

Use `OptimizedImage` instead of `next/image` for automatic optimizations:

```typescript
import { OptimizedImage } from "@/components/optimized-image";

<OptimizedImage
  src="/item-photo.jpg"
  alt="Item description"
  width={800}
  height={600}
  showPlaceholder
  priority // For above-the-fold images
/>;
```

**Features:**

- Automatic blur placeholder while loading
- Lazy loading by default
- AVIF/WebP format support
- Optimized quality (85%)

### Avatar Images

```typescript
import { AvatarImage } from "@/components/optimized-image";

<AvatarImage src={user.avatar} alt={user.name} size={40} />;
```

### Responsive Images

```typescript
import { getResponsiveSizes } from "@/components/optimized-image";

<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes={getResponsiveSizes({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    default: "100vw",
  })}
/>;
```

## Code Splitting

### Route-Level Splitting

Next.js automatically splits code by route. Use `loading.tsx` files for better UX:

```typescript
// app/(main)/items/loading.tsx
import { CardGridLoadingSkeleton } from "@/components/loading-skeletons";

export default function ItemsLoading() {
  return <CardGridLoadingSkeleton count={9} />;
}
```

### Component-Level Splitting

Use dynamic imports for heavy components:

```typescript
import dynamic from "next/dynamic";

const Calendar = dynamic(() => import("@/components/ui/calendar"), {
  loading: () => <Skeleton className="h-[350px] w-full" />,
  ssr: false, // If component doesn't need SSR
});
```

**Good candidates for dynamic imports:**

- Rich text editors
- Charts and visualizations
- Calendar/date pickers
- Admin dashboards
- Modal content (load when opened)

### Prefetching

```typescript
import { prefetchRoute } from "@/lib/performance";
import { useRouter } from "next/navigation";

const router = useRouter();

// Prefetch on hover
<Link
  href="/items/123"
  onMouseEnter={() => prefetchRoute(router, "/items/123")}
>
  View Item
</Link>;
```

## Web Vitals Tracking

Core Web Vitals are automatically tracked and reported to Sentry:

- **LCP** (Largest Contentful Paint) - Target: < 2.5s
- **FID/INP** (First Input Delay / Interaction to Next Paint) - Target: < 100ms
- **CLS** (Cumulative Layout Shift) - Target: < 0.1
- **FCP** (First Contentful Paint) - Target: < 1.8s
- **TTFB** (Time to First Byte) - Target: < 800ms

### View Metrics

**Development:**
Metrics are logged to the browser console.

**Production:**
Metrics are sent to Sentry and available in the Performance dashboard.

## Loading Skeletons

Use skeleton loading states for better perceived performance:

```typescript
import {
  PageLoadingSkeleton,
  CardGridLoadingSkeleton,
  ListLoadingSkeleton,
  ProfileLoadingSkeleton,
  FormLoadingSkeleton,
  TableLoadingSkeleton,
} from "@/components/loading-skeletons";
```

**Available skeletons:**

- `PageLoadingSkeleton` - Generic page with header and content
- `CardGridLoadingSkeleton` - Grid layouts (items, trades)
- `ListLoadingSkeleton` - List views (messages, notifications)
- `ProfileLoadingSkeleton` - Profile pages
- `FormLoadingSkeleton` - Form pages
- `TableLoadingSkeleton` - Admin tables

## Best Practices

### Images

✅ **Do:**

- Use `OptimizedImage` component
- Set `priority` prop for above-the-fold images
- Provide explicit width and height
- Use descriptive alt text
- Use responsive sizes for variable-width images

❌ **Don't:**

- Use `<img>` tags directly
- Load high-resolution images for thumbnails
- Forget alt text (accessibility!)
- Use large images without optimization

### Code Splitting

✅ **Do:**

- Lazy load heavy components (Calendar, charts, editors)
- Use `loading.tsx` for route-level loading states
- Prefetch critical routes on hover
- Split vendor code from application code

❌ **Don't:**

- Over-split (creates more network requests)
- Lazy load critical above-the-fold content
- Forget loading states

### Event Handlers

✅ **Do:**

- Debounce search inputs (300-500ms)
- Throttle scroll handlers (100-200ms)
- Use `prefersReducedMotion()` before animations
- Clean up event listeners in `useEffect` cleanup

❌ **Don't:**

- Attach unthrottled scroll/resize handlers
- Forget to remove event listeners
- Run expensive operations on every keystroke

### State Management

✅ **Do:**

- Use React Query's built-in caching (60s staleTime)
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use virtualization for long lists (react-window)

❌ **Don't:**

- Fetch the same data multiple times
- Render 1000+ items without virtualization
- Create new objects/functions in render

## Measuring Performance

### Lighthouse

Run Lighthouse audits in Chrome DevTools:

1. Open Chrome DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Performance" category
4. Click "Analyze page load"

**Target Scores:**

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### Chrome DevTools Performance

1. Open DevTools > Performance tab
2. Click Record
3. Perform actions
4. Stop recording
5. Analyze flame graph and metrics

**Look for:**

- Long tasks (> 50ms)
- Layout thrashing
- Unnecessary re-renders
- Memory leaks

### Bundle Analyzer

Analyze bundle sizes:

```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

### Real User Monitoring

Sentry automatically tracks:

- Page load times
- API request durations
- Error rates
- Core Web Vitals

View in Sentry dashboard under Performance > Web Vitals.

## Performance Checklist

Before deploying to production:

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle sizes (`ANALYZE=true npm run build`)
- [ ] Test on slow 3G network
- [ ] Test on low-end mobile devices
- [ ] Verify images use AVIF/WebP
- [ ] Confirm devtools excluded from production
- [ ] Test loading states appear correctly
- [ ] Verify prefetching works on key routes
- [ ] Check Core Web Vitals in production
- [ ] Test with reduced motion enabled
- [ ] Verify accessibility (a11y) scores

## Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
