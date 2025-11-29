/**
 * CommentCard Component
 *
 * Displays a comment with nested replies, edit/delete/like/reply/flag functionality.
 * Supports version history viewing for moderators.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
} from "@/lib/api/comments";
import { useAuthStore } from "@/stores/authStore";
import type { Comment } from "@/types/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Flag,
  Heart,
  MessageCircle,
  MoreVertical,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CommentForm } from "./comment-form";
import { CommentVersionHistory } from "./comment-version-history";
import { FlagCommentDialog } from "./flag-comment-dialog";

interface CommentCardProps {
  comment: Comment;
  itemId: string;
  level?: number;
  onUpdate?: () => void;
}

export function CommentCard({
  comment,
  itemId,
  level = 0,
  onUpdate,
}: CommentCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [visibleReplies, setVisibleReplies] = useState(3);

  // Optimistic state for likes (null means use server value)
  const [optimisticLikeState, setOptimisticLikeState] = useState<{
    isLiked: boolean;
    count: number;
  } | null>(null);

  const isOwner = user?.id === comment.userId;
  const isModerator = user?.role === "ADMIN" || user?.role === "MODERATOR";

  // Use optimistic state if available, otherwise use server data
  // Note: comment.hasLiked is undefined for guests, boolean for logged-in users
  const isLiked = optimisticLikeState?.isLiked ?? comment.hasLiked ?? false;
  const likesCount = optimisticLikeState?.count ?? comment.likesCount;

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async (shouldUnlike: boolean) => {
      // Action is decided at button click time and passed here
      return shouldUnlike ? unlikeComment(comment.id) : likeComment(comment.id);
    },
    onMutate: async (shouldUnlike: boolean) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["comments", itemId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(["comments", itemId]);

      // Update optimistic UI based on the action we're about to perform
      const newIsLiked = !shouldUnlike; // If unliking, newIsLiked = false; if liking, newIsLiked = true
      const newCount = shouldUnlike ? likesCount - 1 : likesCount + 1;
      setOptimisticLikeState({ isLiked: newIsLiked, count: newCount });

      // Return context with previous value for rollback
      return { previousComments };
    },
    onSuccess: (data) => {
      // Update local state with server response (includes hasLiked)
      setOptimisticLikeState({
        isLiked: data.hasLiked,
        count: data.likesCount,
      });

      // Invalidate queries to refresh all comments with updated state
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
    },
    onError: (error: unknown, _variables, context) => {
      // Rollback to previous value on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", itemId],
          context.previousComments,
        );
      }

      // Clear optimistic state on error - revert to server data
      setOptimisticLikeState(null);

      // Handle specific errors - silently ignore these, they're race conditions
      const axiosError = error as { response?: { status?: number } };
      if (
        axiosError.response?.status === 404 ||
        axiosError.response?.status === 400
      ) {
        // These errors happen when clicks happen too fast
        // The optimistic update already shows the correct state
        // Just refetch to sync with server
        queryClient.invalidateQueries({ queryKey: ["comments", itemId] });
      } else {
        toast.error("Failed to update like");
      }
    },
  }); // Edit mutation
  const editMutation = useMutation({
    mutationFn: (content: string) => updateComment(comment.id, { content }),
    onSuccess: () => {
      toast.success("Comment updated");
      setIsEditing(false);
      onUpdate?.();
      queryClient.invalidateQueries({
        queryKey: ["comments", itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      toast.success("Comment deleted");
      setShowDeleteDialog(false);
      onUpdate?.();
      queryClient.invalidateQueries({
        queryKey: ["comments", itemId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });

  const handleEdit = () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }
    if (editContent.trim().length === 0) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (editContent.length > 1000) {
      toast.error("Comment too long (max 1000 characters)");
      return;
    }
    editMutation.mutate(editContent);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const maxLevel = 3;
  const canReply = level < maxLevel;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;
  const displayedReplies = comment.replies?.slice(0, visibleReplies) || [];
  const hasMoreReplies = replyCount > visibleReplies;

  // Calculate indentation based on level
  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : "";

  return (
    <>
      <div className={`group ${indentClass}`}>
        <div className="rounded-lg border bg-card transition-colors hover:bg-muted/50">
          <div className="flex gap-3 p-4">
            {/* Avatar */}
            <Link href={`/profile/${comment.userId}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.avatarUrl || undefined} />
                <AvatarFallback>
                  {comment.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${comment.userId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {comment.username}
                  </Link>
                  {comment.isVerified && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Shield className="h-3 w-3 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified user</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {comment.isEdited && (
                    <Badge variant="secondary" className="text-xs">
                      Edited
                    </Badge>
                  )}
                </div>

                {/* Actions menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && !comment.isDeleted && (
                        <>
                          <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isOwner && !comment.isDeleted && (
                        <>
                          {isOwner && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onClick={() => setShowFlagDialog(true)}
                          >
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </>
                      )}
                      {isModerator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowVersionHistory(true)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Content or Edit Form */}
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {editContent.length}/1000
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={editMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleEdit}
                        disabled={editMutation.isPending}
                      >
                        {editMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm">
                  {comment.isDeleted ? (
                    <span className="italic text-muted-foreground">
                      [deleted]
                    </span>
                  ) : (
                    comment.content
                  )}
                </p>
              )}

              {/* Actions */}
              {!comment.isDeleted && !isEditing && (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-1 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (!likeMutation.isPending) {
                        // Decide action based on current state
                        const currentLiked =
                          optimisticLikeState?.isLiked ??
                          comment.hasLiked ??
                          false;
                        likeMutation.mutate(currentLiked);
                      }
                    }}
                    disabled={!user || likeMutation.isPending}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    <span className="text-xs">{likesCount}</span>
                  </Button>

                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto gap-1 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowReplyForm(!showReplyForm)}
                      disabled={!user}
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">Reply</span>
                    </Button>
                  )}

                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto gap-1 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowReplies(!showReplies)}
                    >
                      {showReplies ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="text-xs">
                        {showReplies ? "Hide" : "Show"} {replyCount}{" "}
                        {replyCount === 1 ? "reply" : "replies"}
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <div className="border-t bg-muted/30 px-4 py-3">
              <CommentForm
                itemId={itemId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  setShowReplies(true);
                  onUpdate?.();
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Nested replies - recursively render with CommentCard */}
          {showReplies && hasReplies && (
            <div className="border-t bg-muted/20 pt-3">
              <div className="space-y-3 px-3 pb-3">
                {displayedReplies.map((reply) => (
                  <CommentCard
                    key={reply.id}
                    comment={reply}
                    itemId={itemId}
                    level={level + 1}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>

              {/* Show more replies button */}
              {hasMoreReplies && (
                <div className="border-t bg-muted/10 px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisibleReplies((prev) => prev + 5)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    Show {Math.min(5, replyCount - visibleReplies)} more{" "}
                    {replyCount - visibleReplies === 1 ? "reply" : "replies"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone. The comment will be replaced with [deleted].
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag dialog */}
      <FlagCommentDialog
        open={showFlagDialog}
        onOpenChange={setShowFlagDialog}
        commentId={comment.id}
        commentContent={comment.content}
      />

      {/* Version history dialog (moderators only) */}
      {isModerator && (
        <CommentVersionHistory
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          commentId={comment.id}
          currentContent={comment.content}
        />
      )}
    </>
  );
}
