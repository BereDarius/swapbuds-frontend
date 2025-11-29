/**
 * CommentForm Component
 *
 * Form for creating or replying to comments.
 * Handles validation, character count, and submission.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/lib/api/comments";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface CommentFormProps {
  itemId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_LENGTH = 1000;

export function CommentForm({
  itemId,
  parentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      createComment(itemId, data),
    onSuccess: () => {
      toast.success(parentId ? "Reply posted" : "Comment posted");
      setContent("");
      onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: ["comments", itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (content.length > MAX_LENGTH) {
      toast.error(`Comment too long (max ${MAX_LENGTH} characters)`);
      return;
    }

    createMutation.mutate({
      content: content.trim(),
      parentId: parentId || undefined,
    });
  };

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Please log in to comment
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder={
          parentId
            ? "Write a reply..."
            : "Share your thoughts about this item..."
        }
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        className="resize-none"
        disabled={createMutation.isPending}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/{MAX_LENGTH}
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || createMutation.isPending}
          >
            {createMutation.isPending
              ? "Posting..."
              : parentId
              ? "Reply"
              : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
}
