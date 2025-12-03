"use client";

import { RecaptchaProvider } from "@/components/recaptcha/recaptcha-provider";
import { type ReactNode } from "react";

/**
 * Authentication-specific providers (ReCAPTCHA)
 * Only loaded on pages that require authentication/verification
 */
export function AuthProviders({ children }: { children: ReactNode }) {
  return <RecaptchaProvider>{children}</RecaptchaProvider>;
}
