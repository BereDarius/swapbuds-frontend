"use client";

import { ReactNode } from "react";

interface RecaptchaProviderProps {
  children: ReactNode;
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  // Simple passthrough for now - reCAPTCHA will be integrated later
  return <>{children}</>;
}
