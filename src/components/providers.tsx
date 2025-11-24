"use client";

import { RecaptchaProvider } from "@/components/recaptcha/recaptcha-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

/**
 * Root providers component for application-wide context
 *
 * Wraps the app with TanStack Query (React Query) for data fetching,
 * caching, and server state management.
 *
 * Configuration:
 * - staleTime: 60 seconds (data considered fresh for 1 minute)
 * - refetchOnWindowFocus: disabled (prevents unwanted refetches)
 * - retry: 1 attempt (reduces wait time on persistent failures)
 *
 * This should wrap your root layout or _app component.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <Providers>
 *   <YourApp />
 * </Providers>
 * ```
 */
export function Providers({ children }: { children: ReactNode }) {
  /**
   * QueryClient instance created once per component mount
   * Using useState ensures it's not recreated on every render
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RecaptchaProvider>
        {children}
        {/* Development-only devtools panel for inspecting queries/cache */}
        <ReactQueryDevtools initialIsOpen={false} />
      </RecaptchaProvider>
    </QueryClientProvider>
  );
}
