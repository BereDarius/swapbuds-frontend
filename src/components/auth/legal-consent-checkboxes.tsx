"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

interface LegalConsentCheckboxesProps {
  tosAccepted: boolean;
  onTosChange: (checked: boolean) => void;
  privacyAccepted: boolean;
  onPrivacyChange: (checked: boolean) => void;
  marketingConsent?: boolean;
  onMarketingChange?: (checked: boolean) => void;
  disabled?: boolean;
  tosError?: string;
  privacyError?: string;
}

/**
 * LegalConsentCheckboxes Component
 *
 * Checkboxes for accepting Terms of Service and Privacy Policy.
 * Includes optional marketing consent checkbox.
 *
 * Features:
 * - Required TOS and Privacy Policy acceptance
 * - Optional marketing consent
 * - Links to full legal documents
 * - Individual error messages
 * - Accessible checkboxes with proper labeling
 *
 * @example
 * ```tsx
 * <LegalConsentCheckboxes
 *   tosAccepted={form.watch("tosAccepted")}
 *   onTosChange={(checked) => form.setValue("tosAccepted", checked)}
 *   privacyAccepted={form.watch("privacyAccepted")}
 *   onPrivacyChange={(checked) => form.setValue("privacyAccepted", checked)}
 *   marketingConsent={form.watch("marketingConsent")}
 *   onMarketingChange={(checked) => form.setValue("marketingConsent", checked)}
 *   tosError={form.formState.errors.tosAccepted?.message}
 *   privacyError={form.formState.errors.privacyAccepted?.message}
 * />
 * ```
 */
export function LegalConsentCheckboxes({
  tosAccepted,
  onTosChange,
  privacyAccepted,
  onPrivacyChange,
  marketingConsent,
  onMarketingChange,
  disabled,
  tosError,
  privacyError,
}: LegalConsentCheckboxesProps) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      {/* Terms of Service */}
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            checked={tosAccepted}
            onCheckedChange={onTosChange}
            disabled={disabled}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel className="text-sm font-normal">
            I agree to the{" "}
            <Link
              href="/legal/terms"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Terms of Service
            </Link>{" "}
            <span className="text-destructive">*</span>
          </FormLabel>
          {tosError && <FormMessage>{tosError}</FormMessage>}
        </div>
      </FormItem>

      {/* Privacy Policy */}
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox
            checked={privacyAccepted}
            onCheckedChange={onPrivacyChange}
            disabled={disabled}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel className="text-sm font-normal">
            I agree to the{" "}
            <Link
              href="/legal/privacy"
              target="_blank"
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Privacy Policy
            </Link>{" "}
            <span className="text-destructive">*</span>
          </FormLabel>
          {privacyError && <FormMessage>{privacyError}</FormMessage>}
        </div>
      </FormItem>

      {/* Marketing Consent (Optional) */}
      {onMarketingChange !== undefined && (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox
              checked={marketingConsent}
              onCheckedChange={onMarketingChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal">
              I would like to receive news, updates, and promotional offers from
              SwapBuds <span className="text-muted-foreground">(Optional)</span>
            </FormLabel>
          </div>
        </FormItem>
      )}

      <p className="text-xs text-muted-foreground">
        <span className="text-destructive">*</span> Required fields
      </p>
    </div>
  );
}
