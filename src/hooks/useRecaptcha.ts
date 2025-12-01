"use client";

import { logger } from "@/lib/logger";
import { useCallback, useMemo } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

/**
 * useRecaptcha Hook
 *
 * Provides easy access to reCAPTCHA token generation for form submissions.
 *
 * Features:
 * - Generates reCAPTCHA v3 tokens on demand
 * - Handles errors gracefully
 * - Logs token generation for debugging
 * - Returns loading state
 * - Automatically mocks for E2E tests when __PLAYWRIGHT__ flag is set
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { executeRecaptcha, isRecaptchaLoaded } = useRecaptcha();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const token = await executeRecaptcha("login");
 *     // Use token in API call
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useRecaptcha() {
  const { executeRecaptcha: executeRecaptchaBase } = useGoogleReCaptcha();

  // Check if we're in E2E test mode (Playwright injects this flag)
  // Memoize to prevent recalculation on every render
  const isE2ETest = useMemo(
    () =>
      typeof window !== "undefined" &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__PLAYWRIGHT__ !== undefined,
    [],
  );

  /**
   * Execute reCAPTCHA and get token
   *
   * @param action - Action name for reCAPTCHA scoring (e.g., "login", "register")
   * @returns Promise with reCAPTCHA token or null on failure
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      // In E2E tests, always return a mock token
      if (isE2ETest) {
        logger.debug("Using mock reCAPTCHA token for E2E test", { action });
        return `mock_recaptcha_token_${action}_${Date.now()}`;
      }

      if (!executeRecaptchaBase) {
        logger.warn("reCAPTCHA not loaded yet");
        return null;
      }

      try {
        const token = await executeRecaptchaBase(action);
        logger.debug("reCAPTCHA token generated", {
          action,
          tokenLength: token.length,
        });
        return token;
      } catch (error) {
        logger.error("Failed to execute reCAPTCHA", error);
        return null;
      }
    },
    [executeRecaptchaBase, isE2ETest],
  );

  const isRecaptchaLoaded = useMemo(
    () => isE2ETest || !!executeRecaptchaBase,
    [isE2ETest, executeRecaptchaBase],
  );

  return {
    executeRecaptcha,
    isRecaptchaLoaded,
  };
}
