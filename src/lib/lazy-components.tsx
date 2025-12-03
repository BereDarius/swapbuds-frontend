/**
 * Lazy-loaded Components for Performance Optimization
 *
 * This file contains dynamically imported heavy components to reduce initial bundle size.
 * Components are loaded on-demand when they're actually needed.
 *
 * Implemented:
 * ✅ Calendar component (register page) - ~50KB savings
 *
 * TODO: Add more lazy components:
 * - LazySocketProvider (messages/notifications)
 * - LazyAdminDashboard (admin routes)
 * - LazyRichTextEditor (comments/descriptions)
 * - LazyImageCropper (image uploads)
 */

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

/**
 * Calendar Component
 * Used in: Register page date picker
 * Bundle savings: ~50KB (react-day-picker + date-fns utils)
 * Loads: When popover opens (user interaction)
 */
export const LazyCalendar = dynamic(
  () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
  {
    loading: () => (
      <div className="flex h-[300px] w-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);
