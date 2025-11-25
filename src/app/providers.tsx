"use client";

import { RecaptchaProvider } from "@/components/recaptcha/recaptcha-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RecaptchaProvider>
          {children}
          <Toaster position="top-right" richColors />
        </RecaptchaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
