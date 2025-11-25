"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes provider to enable dark mode support.
 * Uses class-based theme switching with local storage persistence.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <YourApp />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
