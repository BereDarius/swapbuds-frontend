/**
 * Review Card Component
 *
 * Displays a single review with rating, author, and actions
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteReview } from "@/lib/api/reviews";
import { useAuthStore } from "@/stores/authStore";
import { type Review } from "@/types/review";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  showTarget?: boolean; // Show the person being reviewed
}

export function ReviewCard({
  review,
  onEdit,
  showTarget = false,
}: ReviewCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwnReview = user?.id === review.revieweeId;

  const deleteMutation = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review deleted");
    },
    onError: () => {
      toast.error("Failed to delete review");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this review? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const displayUser = showTarget ? review.reviewee : review.reviewer;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Author/Target Info */}
          <div className="flex items-start gap-3 flex-1">
            <Link href={`/profile/${displayUser?.username}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={displayUser?.avatarUrl || undefined} />
                <AvatarFallback>
                  {displayUser?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile/${displayUser?.username}`}
                  className="font-semibold hover:underline"
                >
                  {displayUser?.username}
                </Link>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {review.rating}.0
                </span>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.comment}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {isOwnReview && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
