import { AuthProviders } from "@/components/providers-auth";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s - SwapBuds",
    default: "Authentication",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthProviders>{children}</AuthProviders>;
}
