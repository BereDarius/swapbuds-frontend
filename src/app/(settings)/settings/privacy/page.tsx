"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCookieConsentStore } from "@/stores/cookieConsentStore";
import { CookieConsent } from "@/types/legal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const metadata = {
  title: "Privacy Settings | SwapBuds",
  description: "Manage your cookie preferences and privacy settings",
};

/**
 * Cookie category configuration with descriptions
 */
interface CookieCategory {
  id: keyof CookieConsent;
  title: string;
  description: string;
  required: boolean;
  examples: string[];
}

const categories: CookieCategory[] = [
  {
    id: "essential",
    title: "Essential Cookies",
    description:
      "Required for the website to function properly. These cookies enable core functionality like authentication, security, and session management.",
    required: true,
    examples: [
      "Authentication tokens",
      "Session identifiers",
      "Security tokens (CSRF)",
      "Load balancing",
    ],
  },
  {
    id: "functional",
    title: "Functional Cookies",
    description:
      "Enable enhanced functionality and personalization, such as remembering your preferences, settings, and language choices.",
    required: false,
    examples: [
      "Language preferences",
      "Theme settings (dark/light mode)",
      "User interface preferences",
      "Regional settings",
    ],
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the user experience.",
    required: false,
    examples: [
      "Page view tracking",
      "Session duration",
      "Feature usage statistics",
      "Error reporting (Sentry)",
    ],
  },
  {
    id: "marketing",
    title: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness. Currently not used on SwapBuds.",
    required: false,
    examples: [
      "Advertising tracking (not used)",
      "Remarketing (not used)",
      "Conversion tracking (not used)",
    ],
  },
];

/**
 * Privacy Settings Page
 *
 * Allows users to manage their cookie consent preferences with
 * detailed information about each cookie category.
 *
 * Features:
 * - View current cookie settings
 * - Toggle individual cookie categories
 * - Essential cookies locked (always enabled)
 * - Save preferences with backend sync
 * - Links to legal documents
 */
export default function PrivacySettingsPage() {
  const { consent, savePreferences } = useCookieConsentStore();
  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load current preferences
  useEffect(() => {
    if (consent) {
      setPreferences(consent);
    }
  }, [consent]);

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === "essential") return; // Cannot toggle essential

    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePreferences(preferences);
      toast.success("Preferences saved", {
        description: "Your cookie preferences have been updated.",
      });
    } catch {
      toast.error("Failed to save", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted: CookieConsent = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    setIsSaving(true);
    try {
      await savePreferences(allAccepted);
      toast.success("All cookies accepted", {
        description: "You've enabled all cookie categories.",
      });
    } catch {
      toast.error("Failed to save", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectAll = async () => {
    const onlyEssential: CookieConsent = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyEssential);
    setIsSaving(true);
    try {
      await savePreferences(onlyEssential);
      toast.success("Non-essential cookies rejected", {
        description: "Only essential cookies are enabled.",
      });
    } catch {
      toast.error("Failed to save", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cookie Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Manage how we use cookies and similar technologies. Learn more in our{" "}
          <Link
            href="/legal/cookies"
            className="underline underline-offset-4 hover:text-primary"
            target="_blank"
          >
            Cookie Policy
          </Link>
          .
        </p>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAcceptAll} disabled={isSaving}>
          Accept All
        </Button>
        <Button onClick={handleRejectAll} variant="outline" disabled={isSaving}>
          Reject Non-Essential
        </Button>
      </div>

      <Separator />

      {/* Cookie Categories */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">
                    {category.title}
                  </Label>
                  {category.required && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <div className="pt-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Examples:
                  </p>
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {category.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={preferences[category.id]}
                disabled={category.required || isSaving}
                onClick={() => handleToggle(category.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                  preferences[category.id] ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    preferences[category.id] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <Separator />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      {/* Additional Links */}
      <Separator />
      <div className="space-y-2">
        <p className="text-sm font-medium">Related Documents</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/legal/privacy"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal/cookies"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
          >
            Cookie Policy
          </Link>
          <Link
            href="/legal/terms"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            target="_blank"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
