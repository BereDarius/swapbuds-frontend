/**
 * CommentsList Component
 *
 * Displays a list of comments with reply functionality.
 * Handles loading, error states, and nested comment threading.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getItemComments } from "@/lib/api/comments";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";

interface CommentsListProps {
  itemId: string;
}

export function CommentsList({ itemId }: CommentsListProps) {
  const [visibleComments, setVisibleComments] = useState(5);

  const {
    data: comments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", itemId],
    queryFn: () => getItemComments(itemId),
  });

  const totalComments = comments?.length || 0;
  const displayedComments = comments?.slice(0, visibleComments) || [];
  const hasMoreComments = totalComments > visibleComments;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-sm text-destructive">
          Failed to load comments. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main comment form */}
      <CommentForm itemId={itemId} onSuccess={refetch} />

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </>
        ) : comments && comments.length > 0 ? (
          <>
            {/* Render visible comments */}
            {displayedComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                itemId={itemId}
                onUpdate={refetch}
              />
            ))}

            {/* Show more comments button */}
            {hasMoreComments && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleComments((prev) => prev + 5)}
                >
                  Show {Math.min(5, totalComments - visibleComments)} more{" "}
                  {totalComments - visibleComments === 1
                    ? "comment"
                    : "comments"}
                </Button>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <MessageCircle className="mb-3 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">No comments yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to comment on this item
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
