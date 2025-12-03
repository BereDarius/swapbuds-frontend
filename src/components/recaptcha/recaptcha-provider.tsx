"use client";

import { logger } from "@/lib/logger";
import { ReactNode } from "react";
import {
  GoogleReCaptcha,
  GoogleReCaptchaProvider,
} from "react-google-recaptcha-v3";

interface RecaptchaProviderProps {
  children: ReactNode;
}

/**
 * reCAPTCHA Provider Component
 *
 * Wraps the app with Google reCAPTCHA v3 provider for invisible bot protection.
 *
 * Features:
 * - Invisible reCAPTCHA v3 (no user interaction required)
 * - Automatic token generation
 * - Error handling and logging
 * - Validates site key from environment
 *
 * Environment:
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY: Your reCAPTCHA site key
 *
 * @example
 * ```tsx
 * <RecaptchaProvider>
 *   <App />
 * </RecaptchaProvider>
 * ```
 */
export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const skipRecaptcha = process.env.NEXT_PUBLIC_SKIP_RECAPTCHA === "true";

  if (skipRecaptcha) {
    logger.debug("reCAPTCHA disabled via NEXT_PUBLIC_SKIP_RECAPTCHA");
    return <>{children}</>;
  }

  if (!siteKey) {
    logger.warn("reCAPTCHA site key not configured");
    return <>{children}</>;
  }

  const handleVerify = (token: string) => {
    if (token) {
      logger.debug("reCAPTCHA token generated", { tokenLength: token.length });
    } else {
      logger.error("reCAPTCHA verification failed - no token received");
    }
  };

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
      useEnterprise={false}
      useRecaptchaNet={false}
      container={{
        parameters: {
          badge: "inline", // Move badge inline instead of floating
          theme: "light",
        },
      }}
    >
      {children}
      <GoogleReCaptcha onVerify={handleVerify} />
    </GoogleReCaptchaProvider>
  );
}
