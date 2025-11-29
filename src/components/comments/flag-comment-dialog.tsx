/**
 * FlagCommentDialog Component
 *
 * Dialog for flagging/reporting comments for moderation.
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { flagComment } from "@/lib/api/comments";
import { FlagReason } from "@/types/moderation";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface FlagCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentId: string;
  commentContent: string;
}

const FLAG_REASONS = [
  { value: "INAPPROPRIATE", label: "Inappropriate Content" },
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "HATE_SPEECH", label: "Hate Speech" },
  { value: "OTHER", label: "Other" },
];

export function FlagCommentDialog({
  open,
  onOpenChange,
  commentId,
  commentContent,
}: FlagCommentDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [description, setDescription] = useState("");

  const flagMutation = useMutation({
    mutationFn: () =>
      flagComment(commentId, {
        reason: reason as FlagReason,
        description: description || undefined,
      }),
    onSuccess: () => {
      toast.success("Comment reported successfully");
      onOpenChange(false);
      // Reset form
      setReason("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to report comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    flagMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Report this comment for review by our moderation team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Show preview of comment */}
            <div className="rounded-md bg-muted p-3">
              <p className="line-clamp-3 text-sm">{commentContent}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {FLAG_REASONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide any additional information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={flagMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!reason || flagMutation.isPending}>
              {flagMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
