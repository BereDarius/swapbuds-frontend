/**
 * useVerification Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useVerification } from "./useVerification";
import * as verificationApi from "@/lib/api/verification";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { VerificationRequest } from "@/types/verification";

// Mock dependencies
vi.mock("@/lib/api/verification");
vi.mock("@/stores/authStore");
vi.mock("next/navigation");
vi.mock("sonner");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestQueryClientWrapper";
  return Wrapper;
};

describe("useVerification", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(
      mockRouter as ReturnType<typeof useRouter>
    );
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "user-1", username: "testuser" },
    } as ReturnType<typeof useAuthStore>);
  });

  describe("verification status", () => {
    it("should detect verified user", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "APPROVED",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isVerified).toBe(true);
        expect(result.current.isPending).toBe(false);
        expect(result.current.isRejected).toBe(false);
        expect(result.current.hasNoVerification).toBe(false);
      });
    });

    it("should detect pending verification", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "PENDING",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isVerified).toBe(false);
        expect(result.current.isPending).toBe(true);
        expect(result.current.isRejected).toBe(false);
      });
    });

    it("should detect rejected verification", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "REJECTED",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
        reviewedAt: "2024-01-02T00:00:00Z",
        rejectionReason: "Document not clear",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isVerified).toBe(false);
        expect(result.current.isPending).toBe(false);
        expect(result.current.isRejected).toBe(true);
      });
    });

    it("should detect no verification submitted", async () => {
      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(null);

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasNoVerification).toBe(true);
        expect(result.current.isVerified).toBe(false);
      });
    });
  });

  describe("requireVerification", () => {
    it("should return true for verified users", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "APPROVED",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isVerified).toBe(true);
      });

      const canProceed = result.current.requireVerification("create trade");
      expect(canProceed).toBe(true);
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it("should show warning for pending verification", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "PENDING",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      const canProceed = result.current.requireVerification("send message");
      expect(canProceed).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith(
        "Verification Pending",
        expect.objectContaining({
          description: expect.stringContaining("send message"),
        })
      );
    });

    it("should show error for rejected verification", async () => {
      const mockVerification: VerificationRequest = {
        id: "ver-1",
        userId: "user-1",
        status: "REJECTED",
        documentType: "PASSPORT",
        submittedAt: "2024-01-01T00:00:00Z",
        rejectionReason: "Document not clear",
      };

      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(
        mockVerification
      );

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isRejected).toBe(true);
      });

      const canProceed = result.current.requireVerification("make offer");
      expect(canProceed).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Verification Required",
        expect.objectContaining({
          description: expect.stringContaining("make offer"),
          action: expect.objectContaining({
            label: "Verify Now",
          }),
        })
      );
    });

    it("should show warning for no verification", async () => {
      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(null);

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasNoVerification).toBe(true);
      });

      const canProceed = result.current.requireVerification("trade items");
      expect(canProceed).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith(
        "Verification Required",
        expect.objectContaining({
          description: expect.stringContaining("trade items"),
          action: expect.objectContaining({
            label: "Verify Now",
          }),
        })
      );
    });

    it("should use default action text when not provided", async () => {
      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(null);

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasNoVerification).toBe(true);
      });

      const canProceed = result.current.requireVerification();
      expect(canProceed).toBe(false);
      expect(toast.warning).toHaveBeenCalledWith(
        "Verification Required",
        expect.objectContaining({
          description: expect.stringContaining("perform this action"),
        })
      );
    });
  });

  describe("redirectToVerification", () => {
    it("should redirect to verification page", async () => {
      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(null);

      const { result } = renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasNoVerification).toBe(true);
      });

      result.current.redirectToVerification();
      expect(mockRouter.push).toHaveBeenCalledWith("/verification");
    });
  });

  describe("query configuration", () => {
    it("should not fetch when user is not logged in", () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
      } as ReturnType<typeof useAuthStore>);

      renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      expect(verificationApi.getMyVerification).not.toHaveBeenCalled();
    });

    it("should fetch when user is logged in", async () => {
      vi.mocked(verificationApi.getMyVerification).mockResolvedValue(null);

      renderHook(() => useVerification(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(verificationApi.getMyVerification).toHaveBeenCalled();
      });
    });
  });
});
