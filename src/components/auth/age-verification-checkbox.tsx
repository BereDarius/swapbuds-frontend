"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AgeVerificationCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * AgeVerificationCheckbox Component
 *
 * Checkbox for users to declare they are 18 years or older.
 * Required for registration compliance with age restrictions.
 *
 * Features:
 * - Clear age declaration statement
 * - Required field validation
 * - Accessible checkbox with proper labeling
 * - Error message display
 *
 * @example
 * ```tsx
 * <FormField
 *   control={form.control}
 *   name="selfDeclaredAge18"
 *   render={({ field }) => (
 *     <AgeVerificationCheckbox
 *       checked={field.value}
 *       onCheckedChange={field.onChange}
 *       error={form.formState.errors.selfDeclaredAge18?.message}
 *     />
 *   )}
 * />
 * ```
 */
export function AgeVerificationCheckbox({
  checked,
  onCheckedChange,
  disabled,
  error,
}: AgeVerificationCheckboxProps) {
  return (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <FormControl>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel className="font-medium">
          I confirm that I am 18 years of age or older
        </FormLabel>
        <p className="text-sm text-muted-foreground">
          You must be at least 18 years old to use SwapBuds.
        </p>
        {error && <FormMessage>{error}</FormMessage>}
      </div>
    </FormItem>
  );
}
