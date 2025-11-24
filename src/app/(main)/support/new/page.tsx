/**
 * Create Support Ticket Page
 *
 * Form for creating new support tickets
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupportChat } from "@/lib/api/support";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { SupportPriority } from "@/types/support";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const supportTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be at most 200 characters"),
  priority: z.nativeEnum(SupportPriority),
  initialMessage: z
    .string()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be at most 2000 characters"),
});

type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

export default function NewSupportTicketPage() {
  const router = useRouter();

  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      priority: SupportPriority.MEDIUM,
      initialMessage: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createSupportChat,
    onSuccess: (data) => {
      toast.success("Support ticket created", {
        description: "Our team will respond shortly.",
      });
      router.push(`/support/${data.id}`);
    },
    onError: (error) => {
      logger.apiError("POST", "/support/chats", error);
      const message = getErrorMessage(error, "Failed to create support ticket");
      toast.error("Failed to create ticket", { description: message });
    },
  });

  async function onSubmit(data: SupportTicketFormValues) {
    await createMutation.mutateAsync(data);
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <Link href="/support">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Support Ticket</h1>
        <p className="text-muted-foreground mt-1">
          Describe your issue and our support team will help you
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Ticket Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of your issue"
                        disabled={createMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short summary of what you need help with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={createMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SupportPriority.LOW}>
                          Low - General question
                        </SelectItem>
                        <SelectItem value={SupportPriority.MEDIUM}>
                          Medium - Issue needs attention
                        </SelectItem>
                        <SelectItem value={SupportPriority.HIGH}>
                          High - Urgent issue
                        </SelectItem>
                        <SelectItem value={SupportPriority.URGENT}>
                          Urgent - Critical problem
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How quickly do you need a response?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue in detail..."
                        className="min-h-[200px] resize-none"
                        disabled={createMutation.isPending}
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

              <div className="flex gap-3 justify-end">
                <Link href="/support">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tips for Getting Help</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Be specific about the problem you are experiencing</li>
            <li>Include any error messages or screenshots if relevant</li>
            <li>Mention what you have already tried to resolve the issue</li>
            <li>For trade-related issues, include the trade ID if available</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
