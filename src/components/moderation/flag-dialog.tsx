/**
 * Flag Dialog Component
 *
 * Reusable dialog for flagging/reporting content
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flagContent } from "@/lib/api/moderation";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { FlagReason } from "@/types/moderation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const flagSchema = z.object({
  reason: z.nativeEnum(FlagReason),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters")
    .optional(),
});

type FlagFormValues = z.infer<typeof flagSchema>;

interface FlagDialogProps {
  contentType: "ITEM" | "COMMENT" | "USER" | "TRADE";
  contentId: string;
  triggerButton?: React.ReactNode;
}

const FLAG_REASONS = [
  {
    value: FlagReason.INAPPROPRIATE_CONTENT,
    label: "Inappropriate Content",
    description: "Contains offensive or inappropriate material",
  },
  {
    value: FlagReason.SPAM,
    label: "Spam",
    description: "Spam or unwanted promotional content",
  },
  {
    value: FlagReason.HARASSMENT,
    label: "Harassment",
    description: "Harassment or abusive behavior",
  },
  {
    value: FlagReason.MISLEADING_INFORMATION,
    label: "Misleading Information",
    description: "False or misleading information",
  },
  {
    value: FlagReason.COPYRIGHT_VIOLATION,
    label: "Copyright Violation",
    description: "Violates copyright or intellectual property",
  },
  {
    value: FlagReason.PROHIBITED_ITEM,
    label: "Prohibited Item",
    description: "Item is not allowed on the platform",
  },
  {
    value: FlagReason.OTHER,
    label: "Other",
    description: "Other reason not listed above",
  },
];

export function FlagDialog({
  contentType,
  contentId,
  triggerButton,
}: FlagDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FlagFormValues>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      reason: FlagReason.INAPPROPRIATE_CONTENT,
      description: "",
    },
  });

  const flagMutation = useMutation({
    mutationFn: (data: FlagFormValues) =>
      flagContent({
        contentType,
        contentId,
        reason: data.reason,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "flags"] });
      toast.success("Content flagged for review", {
        description: "Our team will review this shortly.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      logger.apiError("POST", "/moderation/flags", error);
      const message = getErrorMessage(error, "Failed to flag content");
      toast.error("Failed to flag content", { description: message });
    },
  });

  async function onSubmit(data: FlagFormValues) {
    await flagMutation.mutateAsync(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Help us keep SwapBuds safe by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={flagMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FLAG_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          <div>
                            <div className="font-medium">{reason.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {reason.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide more context about why you're reporting this..."
                      className="min-h-[100px] resize-none"
                      disabled={flagMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={flagMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={flagMutation.isPending}>
                {flagMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
