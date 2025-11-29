import { getMyVerification } from "@/lib/api/verification";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook to check if user is verified and redirect if not
 *
 * @returns Object with verification status and helper methods
 */
export function useVerification() {
  const { user } = useAuthStore();
  const router = useRouter();

  const {
    data: verification,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-verification"],
    queryFn: getMyVerification,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isVerified = verification?.status === "APPROVED";
  const isPending = verification?.status === "PENDING";
  const isRejected = verification?.status === "REJECTED";
  const hasNoVerification = !verification;

  /**
   * Check if user is verified, show toast and redirect if not
   * @param action - Description of the action being attempted (e.g., "create trade", "send message")
   * @returns true if verified, false if not
   */
  const requireVerification = (
    action: string = "perform this action",
  ): boolean => {
    if (isVerified) {
      return true;
    }

    if (isPending) {
      toast.warning("Verification Pending", {
        description: `Your ID verification is still being reviewed. You can ${action} once it's approved.`,
      });
      return false;
    }

    if (isRejected) {
      toast.error("Verification Required", {
        description: `Your verification was rejected. Please resubmit to ${action}.`,
        action: {
          label: "Verify Now",
          onClick: () => router.push("/verification"),
        },
      });
      return false;
    }

    // No verification submitted
    toast.warning("Verification Required", {
      description: `You must verify your identity to ${action}.`,
      action: {
        label: "Verify Now",
        onClick: () => router.push("/verification"),
      },
    });
    return false;
  };

  /**
   * Redirect to verification page if not verified
   */
  const redirectToVerification = () => {
    router.push("/verification");
  };

  return {
    verification,
    isLoading,
    error,
    isVerified,
    isPending,
    isRejected,
    hasNoVerification,
    requireVerification,
    redirectToVerification,
  };
}
