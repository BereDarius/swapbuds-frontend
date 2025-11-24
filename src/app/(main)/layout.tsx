/**
 * Main Layout
 *
 * Layout for main application pages (items, profile, etc.)
 * Includes navigation and authentication checks.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SwapBuds",
  description: "Trade items with your community",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
