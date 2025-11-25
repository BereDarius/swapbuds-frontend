"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Something went wrong!</h2>
            <p className="mt-2 text-muted-foreground">
              {error.message || "An unexpected error occurred"}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={() => reset()}>Try again</Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Go home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
