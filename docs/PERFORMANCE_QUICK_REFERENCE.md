# Performance Quick Reference

Quick lookup for performance utilities and best practices.

## Import Statements

```typescript
// Images
import {
  OptimizedImage,
  AvatarImage,
  getResponsiveSizes,
} from "@/components/optimized-image";

// Performance utilities
import {
  measurePerformance,
  debounce,
  throttle,
  prefersReducedMotion,
  getConnectionSpeed,
  prefetchRoute,
} from "@/lib/performance";

// Loading skeletons
import {
  CardGridLoadingSkeleton,
  ListLoadingSkeleton,
  ProfileLoadingSkeleton,
  FormLoadingSkeleton,
  TableLoadingSkeleton,
} from "@/components/loading-skeletons";

// Dynamic imports
import dynamic from "next/dynamic";
```

## Common Use Cases

### Optimized Images

```typescript
// Standard image
<OptimizedImage
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  showPlaceholder
/>

// Above-the-fold (hero)
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
/>

// Avatar
<AvatarImage
  src={user.avatar}
  alt={user.name}
  size={40}
/>
```

### Search Input (Debounce)

```typescript
const [searchQuery, setSearchQuery] = useState("");

const debouncedSearch = useMemo(
  () =>
    debounce((query: string) => {
      performSearch(query);
    }, 300),
  [],
);

<Input
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  }}
/>;
```

### Scroll Handler (Throttle)

```typescript
const throttledScroll = useMemo(
  () =>
    throttle(() => {
      const scrollY = window.scrollY;
      setShowBackToTop(scrollY > 500);
    }, 100),
  [],
);

useEffect(() => {
  window.addEventListener("scroll", throttledScroll);
  return () => window.removeEventListener("scroll", throttledScroll);
}, [throttledScroll]);
```

### Lazy Load Heavy Component

```typescript
const Calendar = dynamic(() => import("@/components/ui/calendar"), {
  loading: () => <Skeleton className="h-[350px]" />,
  ssr: false,
});
```

### Loading States

```typescript
// app/items/loading.tsx
export default function ItemsLoading() {
  return <CardGridLoadingSkeleton count={9} />;
}
```

### Conditional Animation

```typescript
const shouldAnimate = !prefersReducedMotion();

<motion.div
  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
  initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
>
  Content
</motion.div>;
```

### Network-Aware Loading

```typescript
const speed = getConnectionSpeed();
const imageQuality = speed === "slow" ? 60 : 85;

<OptimizedImage
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  quality={imageQuality}
/>;
```

### Route Prefetching

```typescript
const router = useRouter();

<Link
  href="/items/123"
  onMouseEnter={() => prefetchRoute(router, "/items/123")}
>
  View Item
</Link>;
```

## Performance Targets

| Metric                             | Target  | Poor     |
| ---------------------------------- | ------- | -------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | > 4.0s   |
| **FID/INP** (First Input Delay)    | < 100ms | > 300ms  |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | > 0.25   |
| **FCP** (First Contentful Paint)   | < 1.8s  | > 3.0s   |
| **TTFB** (Time to First Byte)      | < 800ms | > 1800ms |
| **Lighthouse Performance**         | > 90    | < 50     |
| **Bundle Size (JS)**               | < 200KB | > 500KB  |

## Quick Commands

```bash
# Build production bundle
npm run build

# Analyze bundle sizes
ANALYZE=true npm run build

# Run dev server
npm run dev

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

## Debugging Tips

### Slow Page Load

1. Check Network tab for large resources
2. Use Lighthouse to identify issues
3. Check for unoptimized images
4. Look for render-blocking resources

### High CLS (Layout Shift)

1. Set explicit width/height on images
2. Reserve space for dynamic content
3. Avoid injecting content above existing content
4. Use CSS aspect-ratio for responsive elements

### Slow Interactions

1. Debounce/throttle event handlers
2. Use React DevTools Profiler
3. Look for unnecessary re-renders
4. Memoize expensive computations

### Large Bundle Size

1. Run bundle analyzer
2. Check for duplicate dependencies
3. Use dynamic imports for heavy components
4. Remove unused dependencies

## When to Optimize

✅ **Optimize Now:**

- Above-the-fold images
- Search inputs
- Scroll handlers
- Heavy third-party libraries
- Initial page load

⏳ **Optimize Later:**

- Below-the-fold content
- Rarely-used features
- Already fast interactions
- Small components (< 10KB)

## Key Files

| File                                     | Purpose                                 |
| ---------------------------------------- | --------------------------------------- |
| `next.config.ts`                         | Build configuration, image optimization |
| `src/lib/performance.ts`                 | Performance utilities                   |
| `src/components/optimized-image.tsx`     | Image components                        |
| `src/components/loading-skeletons.tsx`   | Loading states                          |
| `src/components/web-vitals-reporter.tsx` | Web Vitals tracking                     |
| `src/app/layout.tsx`                     | Root layout with monitoring             |
| `docs/PERFORMANCE.md`                    | Full documentation                      |
