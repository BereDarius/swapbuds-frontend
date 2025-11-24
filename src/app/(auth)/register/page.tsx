"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { AgeVerificationCheckbox } from "@/components/auth/age-verification-checkbox";
import { DateOfBirthInput } from "@/components/auth/date-of-birth-input";
import { LegalConsentCheckboxes } from "@/components/auth/legal-consent-checkboxes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/authStore";

/**
 * Registration form validation schema
 * Enforces username, email, password, age verification, and legal consent requirements
 */
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    dateOfBirth: z.date({
      message: "Date of birth is required",
    }),
    selfDeclaredAge18: z.boolean().refine((val) => val === true, {
      message: "You must confirm you are 18 years or older",
    }),
    tosAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms of Service",
    }),
    privacyAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the Privacy Policy",
    }),
    marketingConsent: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Calculate age from dateOfBirth
      const age = differenceInYears(new Date(), data.dateOfBirth);
      return age >= 18;
    },
    {
      message: "You must be at least 18 years old to register",
      path: ["dateOfBirth"],
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Register page component
 * Provides registration form with validation and error handling
 */
export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const { executeRecaptcha, isRecaptchaLoaded } = useRecaptcha();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      dateOfBirth: undefined,
      selfDeclaredAge18: false,
      tosAccepted: false,
      privacyAccepted: false,
      marketingConsent: false,
    },
  });

  /**
   * Handles registration form submission
   * Creates new account with legal compliance and redirects to home on success
   */
  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    try {
      // Generate reCAPTCHA token
      const recaptchaToken = await executeRecaptcha("register");
      if (!recaptchaToken) {
        toast.error("Verification failed", {
          description:
            "Please try again or contact support if the issue persists.",
        });
        setIsLoading(false);
        return;
      }

      // Prepare registration data with legal fields
      const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth.toISOString(),
        selfDeclaredAge18: data.selfDeclaredAge18,
        marketingConsent: data.marketingConsent || false,
        recaptchaToken,
      };

      const response = await api.post("/auth/register", registrationData);
      const { user, accessToken } = response.data;

      // Update auth store and localStorage
      setAuth(user, accessToken);

      toast.success("Account created!", {
        description: `Welcome to SwapBuds, ${user.username}!`,
      });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      // Log the error with full details for debugging
      logger.apiError("POST", "/auth/register", error);

      const message = getErrorMessage(
        error,
        "Failed to create account. Please try again.",
      );
      toast.error("Registration failed", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="johndoe"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DateOfBirthInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    error={form.formState.errors.dateOfBirth?.message}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="selfDeclaredAge18"
                render={({ field }) => (
                  <AgeVerificationCheckbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    error={form.formState.errors.selfDeclaredAge18?.message}
                  />
                )}
              />

              <LegalConsentCheckboxes
                tosAccepted={form.watch("tosAccepted")}
                onTosChange={(checked) => form.setValue("tosAccepted", checked)}
                privacyAccepted={form.watch("privacyAccepted")}
                onPrivacyChange={(checked) =>
                  form.setValue("privacyAccepted", checked)
                }
                marketingConsent={form.watch("marketingConsent")}
                onMarketingChange={(checked) =>
                  form.setValue("marketingConsent", checked)
                }
                disabled={isLoading}
                tosError={form.formState.errors.tosAccepted?.message}
                privacyError={form.formState.errors.privacyAccepted?.message}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isRecaptchaLoaded}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              {!isRecaptchaLoaded && (
                <p className="text-center text-xs text-muted-foreground">
                  Loading security verification...
                </p>
              )}
            </form>
          </Form>
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
