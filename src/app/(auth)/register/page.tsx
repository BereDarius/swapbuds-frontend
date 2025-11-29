"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { api } from "@/lib/api";
import { getActiveLegalDocument } from "@/lib/api/legal";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Language, LegalDocumentType } from "@/types/legal";
import { differenceInYears, format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tosVersion, setTosVersion] = useState<string>("");
  const [privacyVersion, setPrivacyVersion] = useState<string>("");
  const [isLoadingLegal, setIsLoadingLegal] = useState(true);
  const { executeRecaptcha, isRecaptchaLoaded } = useRecaptcha();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    dateOfBirth: undefined as Date | undefined,
    selfDeclaredAge18: false,
    tosAccepted: false,
    privacyAccepted: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    dateOfBirth: "",
    selfDeclaredAge18: "",
    tosAccepted: "",
    privacyAccepted: "",
  });

  // Redirect if already logged in (only after hydration completes)
  // This prevents redirect loops when API interceptor clears tokens
  useEffect(() => {
    if (_hasHydrated && user) {
      router.push("/");
    }
  }, [_hasHydrated, user, router]);

  // Fetch legal document versions on mount
  useEffect(() => {
    const fetchLegalVersions = async () => {
      try {
        const [tos, privacy] = await Promise.all([
          getActiveLegalDocument(LegalDocumentType.TOS, Language.EN),
          getActiveLegalDocument(LegalDocumentType.PRIVACY_POLICY, Language.EN),
        ]);
        setTosVersion(tos.version);
        setPrivacyVersion(privacy.version);
      } catch (error) {
        console.error("Failed to fetch legal documents:", error);
        toast.error("Failed to load legal documents. Please refresh the page.");
      } finally {
        setIsLoadingLegal(false);
      }
    };

    fetchLegalVersions();
  }, []);

  const validateForm = () => {
    const newErrors = {
      username: "",
      email: "",
      password: "",
      dateOfBirth: "",
      selfDeclaredAge18: "",
      tosAccepted: "",
      privacyAccepted: "",
    };

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain a lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain a number";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (differenceInYears(new Date(), formData.dateOfBirth) < 18) {
      newErrors.dateOfBirth = "You must be at least 18 years old";
    }

    // Age verification
    if (!formData.selfDeclaredAge18) {
      newErrors.selfDeclaredAge18 = "You must confirm you are 18 or older";
    }

    // Legal checkboxes
    if (!formData.tosAccepted) {
      newErrors.tosAccepted = "You must accept the Terms of Service";
    }
    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = "You must accept the Privacy Policy";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAuthError("");

    try {
      const recaptchaToken = await executeRecaptcha("register");
      if (!recaptchaToken) {
        const errorMsg = "Verification failed. Please try again.";
        setAuthError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      const response = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth?.toISOString(),
        selfDeclaredAge18: formData.selfDeclaredAge18,
        tosVersion,
        privacyVersion,
        recaptchaToken,
      });

      const { user, accessToken } = response.data;
      setAuth(user, accessToken);

      toast.success(`Welcome to SwapBuds, ${user.username}!`);
      router.push("/items");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create account");
      setAuthError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to get started with SwapBuds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth
                      ? format(formData.dateOfBirth, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) =>
                      setFormData({ ...formData, dateOfBirth: date })
                    }
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* Age Verification Checkbox */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="age18"
                  checked={formData.selfDeclaredAge18}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      selfDeclaredAge18: checked as boolean,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="age18"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am 18 years of age or older
                </label>
              </div>
              {errors.selfDeclaredAge18 && (
                <p className="text-sm text-destructive">
                  {errors.selfDeclaredAge18}
                </p>
              )}
            </div>

            {/* Terms of Service */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="tos"
                  checked={formData.tosAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      tosAccepted: checked as boolean,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="tos"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </Link>
                </label>
              </div>
              {errors.tosAccepted && (
                <p className="text-sm text-destructive">{errors.tosAccepted}</p>
              )}
            </div>

            {/* Privacy Policy */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      privacyAccepted: checked as boolean,
                    })
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="privacy"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.privacyAccepted && (
                <p className="text-sm text-destructive">
                  {errors.privacyAccepted}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isRecaptchaLoaded || isLoadingLegal}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>

            {isLoadingLegal && (
              <p className="text-center text-xs text-muted-foreground">
                Loading legal documents...
              </p>
            )}
            {!isRecaptchaLoaded && !isLoadingLegal && (
              <p className="text-center text-xs text-muted-foreground">
                Loading security verification...
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
