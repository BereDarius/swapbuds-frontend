"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCookieConsentStore } from "@/stores/cookieConsentStore";
import { CookieConsent } from "@/types/legal";
import Link from "next/link";
import { useState } from "react";

/**
 * Cookie category configuration
 */
interface CookieCategory {
  id: keyof CookieConsent;
  title: string;
  description: string;
  required: boolean;
}

const categories: CookieCategory[] = [
  {
    id: "essential",
    title: "Essential Cookies",
    description:
      "Required for the website to function. These cannot be disabled as they enable core functionality like authentication and security.",
    required: true,
  },
  {
    id: "functional",
    title: "Functional Cookies",
    description:
      "Enable enhanced functionality and personalization, such as remembering your preferences and settings.",
    required: false,
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    required: false,
  },
  {
    id: "marketing",
    title: "Marketing Cookies",
    description:
      "Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.",
    required: false,
  },
];

/**
 * Cookie Preferences Modal
 *
 * Allows users to customize their cookie consent preferences with
 * granular control over each category.
 *
 * Features:
 * - Individual toggles for each cookie category
 * - Essential cookies locked (always enabled)
 * - Detailed descriptions for each category
 * - Save preferences button
 * - Links to Cookie Policy
 *
 * @example
 * ```tsx
 * <CookiePreferencesModal />
 * ```
 */
export function CookiePreferencesModal() {
  const {
    preferencesModalOpen,
    closePreferencesModal,
    savePreferences,
    consent,
  } = useCookieConsentStore();

  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Reset preferences when dialog state or consent changes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closePreferencesModal();
    } else if (consent) {
      setPreferences(consent);
    }
  };

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === "essential") return; // Cannot toggle essential cookies

    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = async () => {
    await savePreferences(preferences);
  };

  return (
    <Dialog open={preferencesModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you want to allow. You can change these
            settings at any time. Learn more in our{" "}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
            >
              Cookie Policy
            </Link>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={category.id}
                    className="text-base font-semibold"
                  >
                    {category.title}
                    {category.required && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Required)
                      </span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[category.id]}
                  disabled={category.required}
                  onClick={() => handleToggle(category.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
                    preferences[category.id] ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      preferences[category.id]
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <Separator />
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={closePreferencesModal}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
