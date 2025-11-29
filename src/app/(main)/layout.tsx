"use client";

import { VerificationBanner } from "@/components/verification/verification-banner";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Main Layout
 *
 * Protected layout that requires authentication.
 * Redirects to login if user is not authenticated.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();

  // Redirect if not authenticated (only after hydration)
  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push("/login");
    }
  }, [_hasHydrated, user, router]);

  // Show nothing while hydrating or redirecting
  if (!_hasHydrated || !user) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <VerificationBanner />
      </div>
      {children}
    </>
  );
}
