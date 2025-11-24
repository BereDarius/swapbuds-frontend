/**
 * Create Dispute Page
 *
 * Form to create a dispute for a specific trade.
 * Allows user to report problems with completed trades.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createDispute } from "@/lib/api/disputes";
import { getTradeById } from "@/lib/api/trades";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { useAuthStore } from "@/stores/authStore";
import { DisputeReason } from "@/types/dispute";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DISPUTE_REASON_OPTIONS = [
  {
    value: DisputeReason.ITEM_NOT_RECEIVED,
    label: "Item not received",
    description: "The item was never delivered",
  },
  {
    value: DisputeReason.ITEM_NOT_AS_DESCRIBED,
    label: "Item not as described",
    description: "Item doesn't match the description or photos",
  },
  {
    value: DisputeReason.ITEM_DAMAGED,
    label: "Item damaged",
    description: "Item arrived damaged or broken",
  },
  {
    value: DisputeReason.WRONG_ITEM_SENT,
    label: "Wrong item sent",
    description: "Received a different item than agreed",
  },
  {
    value: DisputeReason.COMMUNICATION_ISSUES,
    label: "Communication issues",
    description: "Unable to reach the other party",
  },
  {
    value: DisputeReason.SAFETY_CONCERNS,
    label: "Safety concerns",
    description: "Concerns about safety or legitimacy",
  },
  {
    value: DisputeReason.OTHER,
    label: "Other",
    description: "Other issues not listed above",
  },
];

const disputeSchema = z.object({
  reason: z.nativeEnum(DisputeReason).refine((val) => val !== undefined, {
    message: "Please select a reason",
  }),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be at most 2000 characters"),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

export default function CreateDisputePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const tradeId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch trade details
  const {
    data: trade,
    isLoading: tradeLoading,
    error: tradeError,
  } = useQuery({
    queryKey: ["trade", tradeId],
    queryFn: () => getTradeById(tradeId),
    enabled: !!tradeId,
  });

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      reason: undefined,
      description: "",
    },
  });

  const createDisputeMutation = useMutation({
    mutationFn: createDispute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      toast.success("Dispute created", {
        description:
          "Our support team will review your case within 24-48 hours.",
      });
      router.push("/disputes");
    },
    onError: (error) => {
      logger.apiError("POST", "/disputes", error);
      const message = getErrorMessage(error, "Failed to create dispute");
      toast.error("Failed to create dispute", { description: message });
    },
  });

  async function onSubmit(data: DisputeFormValues) {
    if (!trade || !user) return;

    setIsSubmitting(true);
    try {
      // Determine respondent (the other party in the trade)
      const respondentId =
        trade.proposer.id === user.id ? trade.responder.id : trade.proposer.id;

      await createDisputeMutation.mutateAsync({
        tradeId: trade.id,
        respondentId,
        reason: data.reason,
        description: data.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (tradeLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tradeError || !trade) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Trade not found</p>
              <p className="text-muted-foreground mb-6">
                Unable to load trade details
              </p>
              <Link href="/trades">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trades
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/trades/${tradeId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trade
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Report a Problem</h1>
        <p className="text-muted-foreground mt-2">
          Trade #{trade.id.slice(0, 8)}
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          Disputes help us maintain a safe trading environment. Our support team
          will review your case and work to resolve the issue fairly.
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dispute Details</CardTitle>
          <CardDescription>
            Provide information about the issue you&apos;re experiencing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for dispute *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISPUTE_REASON_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
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
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide detailed information about the issue..."
                        className="min-h-[150px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/2000 characters (minimum 20)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Dispute"}
                </Button>
                <Link href={`/trades/${tradeId}`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
