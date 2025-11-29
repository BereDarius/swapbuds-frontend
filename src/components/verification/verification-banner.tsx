"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getMyVerification } from "@/lib/api/verification";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * VerificationBanner Component
 *
 * Displays a banner based on the user's verification status:
 * - Not verified: Prompts user to complete ID verification
 * - Pending: Shows verification is being reviewed
 * - Approved: Shows verified status (can be hidden)
 * - Rejected: Shows rejection message with option to resubmit
 *
 * This banner should be shown on key pages like dashboard, trades, messages
 */
export function VerificationBanner() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const { data: verification, isLoading } = useQuery({
    queryKey: ["my-verification"],
    queryFn: getMyVerification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Don't show banner on the verification page itself
  if (pathname === "/verification") {
    return null;
  }

  // Don't show anything while loading
  if (isLoading || !user) {
    return null;
  }

  // User has no verification request yet
  if (!verification) {
    return (
      <Alert
        variant="default"
        className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      >
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Identity Verification Required</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>
            Complete ID verification to unlock all features: trading, messaging,
            listing items, reviews, and more. Verification typically takes 1-2
            business days.
          </span>
          <Button asChild size="sm" variant="default">
            <Link href="/verification">Verify Now</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Verification pending review
  if (verification.status === "PENDING") {
    return (
      <Alert
        variant="default"
        className="border-blue-500 bg-blue-50 dark:bg-blue-950/20"
      >
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertTitle>Verification Pending</AlertTitle>
        <AlertDescription>
          Your ID verification is being reviewed. This usually takes 1-2
          business days. You&apos;ll be notified once it&apos;s complete.
        </AlertDescription>
      </Alert>
    );
  }

  // Verification approved - don't show banner
  // User gets email notification instead
  if (verification.status === "APPROVED") {
    return null;
  }

  // Verification rejected
  if (verification.status === "REJECTED") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Verification Rejected</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>
            {verification.rejectionReason ||
              "Your verification was rejected. Please try again with clearer images."}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/verification">Try Again</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
