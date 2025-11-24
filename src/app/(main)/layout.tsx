/**
 * Main Layout
 *
 * Layout for main application pages (items, profile, etc.)
 * Wraps content in a container with appropriate padding.
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
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      {children}
    </div>
  );
}
