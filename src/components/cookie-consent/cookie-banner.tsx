"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCookieConsentStore } from "@/stores/cookieConsentStore";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Cookie Consent Banner
 *
 * GDPR-compliant cookie consent banner that appears at the bottom of the page.
 *
 * Features:
 * - Accept All/Reject All buttons
 * - Customize link to open preferences modal
 * - Links to Cookie Policy
 * - Auto-loads consent on mount
 * - Persistent across sessions
 * - Syncs with backend for authenticated users
 *
 * @example
 * ```tsx
 * // Add to layout.tsx
 * <CookieBanner />
 * ```
 */
export function CookieBanner() {
  const {
    bannerVisible,
    acceptAll,
    rejectAll,
    openPreferencesModal,
    loadConsent,
  } = useCookieConsentStore();

  useEffect(() => {
    loadConsent();
  }, [loadConsent]);

  if (!bannerVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-safe">
      <Card className="mx-auto max-w-2xl border-2 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cookie Consent</CardTitle>
          <CardDescription>
            We use cookies to enhance your browsing experience and analyze our
            traffic. By clicking &quot;Accept All&quot;, you consent to our use
            of cookies.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">
            Learn more in our{" "}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-4 hover:text-primary"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={acceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
          <Button
            onClick={rejectAll}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reject All
          </Button>
          <Button
            onClick={openPreferencesModal}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            Customize
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
