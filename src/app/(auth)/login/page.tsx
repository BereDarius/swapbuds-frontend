"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const { executeRecaptcha, isRecaptchaLoaded } = useRecaptcha();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Set mounted state for client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only redirect if user is logged in AND hydration is complete
  // This prevents redirect loops when API interceptor clears tokens
  useEffect(() => {
    if (_hasHydrated && user) {
      router.push("/");
    }
  }, [_hasHydrated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const recaptchaToken = await executeRecaptcha("login");
      if (!recaptchaToken) {
        const errorMsg = "Verification failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      const response = await api.post("/auth/login", {
        ...formData,
        recaptchaToken,
      });

      const { user, accessToken } = response.data;

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.setItem("rememberMe", "false");
      }

      setAuth(user, accessToken);

      toast.success(`Welcome back, ${user.username}!`);
      router.push("/items");
    } catch (error) {
      const message = getErrorMessage(error, "Invalid email or password");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your SwapBuds account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                data-testid="login-error"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="login-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="login-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  data-testid="login-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                data-testid="login-forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full"
              disabled={isLoading || !isMounted || !isRecaptchaLoaded}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            {isMounted && !isRecaptchaLoaded && (
              <p className="text-center text-xs text-muted-foreground">
                Loading security verification...
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              data-testid="login-signup-link"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
