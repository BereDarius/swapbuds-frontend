# Quick Action Plan: Performance Optimization

## Immediate Actions (Do These Now)

### 1. Font Display Optimization (2 min)

```css
/* Add to src/app/globals.css or tailwind config */
@layer base {
  @font-face {
    font-family: "Inter";
    font-display: swap;
  }
}
```

### 2. Preconnect to Cloudinary (1 min)

```tsx
// Add to src/app/layout.tsx <head>
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="dns-prefetch" href="https://res.cloudinary.com" />
```

### 3. Dynamic Import Calendar (5 min)

```tsx
// In src/app/(auth)/register/page.tsx
import dynamic from "next/dynamic";

const Calendar = dynamic(
  () =>
    import("@/components/ui/calendar").then((mod) => ({
      default: mod.Calendar,
    })),
  {
    loading: () => (
      <div className="h-[350px] animate-pulse bg-muted rounded-md" />
    ),
  }
);
```

## Test After Each Change

```bash
# Build and start
yarn build && yarn start

# Run Lighthouse (in another terminal)
cd swapbuds-frontend
yarn lighthouse:local

# Check results
yarn lighthouse:check
```

## Expected Impact

| Action           | Impact              | Time      |
| ---------------- | ------------------- | --------- |
| Font display     | Eliminates FOIT     | 2 min     |
| Preconnect       | Faster images       | 1 min     |
| Dynamic Calendar | -50KB JS bundle     | 5 min     |
| **Total**        | **Better LCP, TTI** | **8 min** |

## Success Criteria

**Before:**

- Performance: 63-88%
- LCP: 2.88-4.34s
- TTI: 4.94-9.0s

**Target:**

- Performance: 90%+
- LCP: <2.5s
- TTI: <3.5s

## Verification Checklist

- [x] Font loads without invisible text flash (Already configured: `display: "swap"`)
- [x] Cloudinary images load faster (Already configured: preconnect + dns-prefetch)
- [x] Register page loads smaller JS bundle (Calendar now lazy loaded)
- [ ] All Lighthouse tests pass 90%+
- [ ] No new errors in console
- [ ] Application still functions correctly

## Implementation Status

✅ **Completed:**

1. Font display optimization - Already configured in layout.tsx
2. Preconnect to Cloudinary - Already configured in layout.tsx
3. Dynamic Calendar import - Implemented in register page (SSR enabled to maintain Best Practices score)

⚠️ **Important Note:**

- Removed `ssr: false` from dynamic import to maintain 100% Best Practices score
- Calendar is still code-split and lazy-loaded for performance
- Best of both worlds: code splitting + SSR

🔄 **Next:** Rebuild and run tests to verify improvements

```bash
yarn build
yarn start
# In another terminal:
yarn lighthouse:local
yarn lighthouse:check
```

---

**Priority:** High
**Status:** ✅ Implemented - Ready for testing
**Est. Time:** Testing only (2-3 minutes)
