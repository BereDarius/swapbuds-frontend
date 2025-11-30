"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    !token ? "error" : "verifying",
  );
  const [message, setMessage] = useState(
    !token ? "No verification token provided." : "Verifying your email...",
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/verify-email`, {
          token,
        });
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 3000);
      } catch (error) {
        setStatus("error");
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Failed to verify email. The token may be invalid or expired.";
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>Confirming your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-center text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-center text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
              <p className="text-center text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-600" />
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-center text-red-800">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/register")}
                >
                  Register Again
                </Button>
                <Button onClick={() => router.push("/login")}>
                  Go to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
