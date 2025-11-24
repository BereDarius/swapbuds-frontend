"use client";

import { logger } from "@/lib/logger";
import { useCallback } from "react";
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

  /**
   * Execute reCAPTCHA and get token
   *
   * @param action - Action name for reCAPTCHA scoring (e.g., "login", "register")
   * @returns Promise with reCAPTCHA token or null on failure
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
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
    [executeRecaptchaBase],
  );

  return {
    executeRecaptcha,
    isRecaptchaLoaded: !!executeRecaptchaBase,
  };
}
