/**
 * ModerationPanel Component
 *
 * Dashboard for moderators to review and manage flagged content.
 * Displays flagged comments with approve/remove actions.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  approveFlaggedComment,
  getFlaggedComments,
  removeFlaggedComment,
  type FlaggedComment,
} from "@/lib/api/moderation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const REASONS = {
  INAPPROPRIATE: "Inappropriate Content",
  SPAM: "Spam",
  SCAM: "Scam",
  DUPLICATE: "Duplicate",
  PROHIBITED: "Prohibited Item",
  MISLEADING: "Misleading Information",
  COPYRIGHT: "Copyright Violation",
  OTHER: "Other",
};

const STATUS_COLORS = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REMOVED: "bg-red-500",
};

interface ModerationPanelProps {
  className?: string;
}

export function ModerationPanel({ className }: ModerationPanelProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedFlag, setSelectedFlag] = useState<FlaggedComment | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [removalReason, setRemovalReason] = useState("");

  // Fetch flagged comments
  const { data, isLoading, error } = useQuery({
    queryKey: ["moderation", "comments", page, statusFilter],
    queryFn: () =>
      getFlaggedComments({
        page,
        limit: 10,
        status: statusFilter as "PENDING" | "APPROVED" | "REMOVED",
      }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (flagId: string) =>
      approveFlaggedComment(flagId, approvalNotes || undefined),
    onSuccess: () => {
      toast.success("Comment approved successfully");
      setShowApproveDialog(false);
      setSelectedFlag(null);
      setApprovalNotes("");
      queryClient.invalidateQueries({ queryKey: ["moderation", "comments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve comment");
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (flagId: string) =>
      removeFlaggedComment(flagId, removalReason, true),
    onSuccess: () => {
      toast.success("Comment removed successfully");
      setShowRemoveDialog(false);
      setSelectedFlag(null);
      setRemovalReason("");
      queryClient.invalidateQueries({ queryKey: ["moderation", "comments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove comment");
    },
  });

  const handleApprove = (flag: FlaggedComment) => {
    setSelectedFlag(flag);
    setShowApproveDialog(true);
  };

  const handleRemove = (flag: FlaggedComment) => {
    setSelectedFlag(flag);
    setShowRemoveDialog(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Moderation Dashboard
          </CardTitle>
          <CardDescription>Loading flagged content...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Moderation Panel
          </CardTitle>
          <CardDescription>{(error as Error).message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { items = [], total = 0, totalPages = 1 } = data || {};

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Moderation Dashboard
              </CardTitle>
              <CardDescription>
                Review and manage flagged comments ({total} total)
              </CardDescription>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REMOVED">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
              <p>No flagged comments to review</p>
              <p className="text-sm">All clear!</p>
            </div>
          ) : (
            <>
              {/* Flagged Comments List */}
              <div className="space-y-3">
                {items.map((flag) => (
                  <div
                    key={flag.id}
                    className="rounded-lg border bg-card p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`${
                              STATUS_COLORS[flag.status]
                            } text-white`}
                          >
                            {flag.status}
                          </Badge>
                          <Badge variant="secondary">
                            {REASONS[flag.reason]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reported{" "}
                          {formatDistanceToNow(new Date(flag.reportedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="rounded-md bg-muted/50 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium">
                          @{flag.comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(flag.comment.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm">{flag.comment.content}</p>
                    </div>

                    {/* Flag Description */}
                    {flag.description && (
                      <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          Report Details:
                        </p>
                        <p className="text-yellow-800 dark:text-yellow-200">
                          {flag.description}
                        </p>
                      </div>
                    )}

                    {/* Review Notes (if reviewed) */}
                    {flag.notes && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Moderator Notes:
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          {flag.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 border-t pt-3">
                      <Link
                        href={`/items/${flag.comment.itemId}#comment-${flag.commentId}`}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        View in context →
                      </Link>

                      {flag.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(flag)}
                            disabled={
                              approveMutation.isPending ||
                              removeMutation.isPending
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(flag)}
                            disabled={
                              approveMutation.isPending ||
                              removeMutation.isPending
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Flagged Comment</DialogTitle>
            <DialogDescription>
              Dismissing this flag will mark the comment as appropriate and keep
              it visible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add notes about why this flag was dismissed..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setApprovalNotes("");
              }}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedFlag && approveMutation.mutate(selectedFlag.id)
              }
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Remove Comment
            </DialogTitle>
            <DialogDescription>
              This will soft-delete the comment and replace it with [deleted].
              The user will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Reason for removal <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Explain why this comment violates the community guidelines..."
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveDialog(false);
                setRemovalReason("");
              }}
              disabled={removeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedFlag && removeMutation.mutate(selectedFlag.id)
              }
              disabled={!removalReason.trim() || removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Remove Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
