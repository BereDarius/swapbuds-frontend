import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  productionBrowserSourceMaps: true,

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "date-fns",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
    // Enable CSS optimization
    optimizeCss: true,
    // Enable module layer
    webpackBuildWorker: true,
  },

  // Webpack optimizations
  webpack: (config, { dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React ecosystem)
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
              name: "framework",
              chunks: "all",
              priority: 40,
              enforce: true,
            },
            // Radix UI chunk
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: "radix-ui",
              chunks: "all",
              priority: 35,
              enforce: true,
            },
            // TanStack Query chunk
            tanstack: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              name: "tanstack",
              chunks: "all",
              priority: 30,
            },
            // Icons chunk (lucide-react)
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: "icons",
              chunks: "all",
              priority: 25,
            },
            // Large libraries
            libs: {
              test: /[\\/]node_modules[\\/](axios|zod|date-fns|socket\.io-client)[\\/]/,
              name: "libs",
              chunks: "all",
              priority: 20,
            },
            // Common vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module: { context: string }) {
                const packageName: string | undefined = module.context.match(
                  /[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/
                )?.[1];
                return `vendor.${packageName?.replace("@", "")}` || "vendor";
              },
              chunks: "all",
              priority: 10,
              minSize: 20000,
              maxSize: 244000,
            },
            // Common chunk for shared code
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 5,
              reuseExistingChunk: true,
              minSize: 10000,
            },
          },
        },
        // Tree shaking
        usedExports: true,
        sideEffects: false,
      };
    }

    // Resolve optimizations
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
      },
    };

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "standout-development",

  project: "swapbuds-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
