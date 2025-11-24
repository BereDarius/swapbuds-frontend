/**
 * Moderation Dashboard Page
 *
 * Moderator tools for reviewing flagged content
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  approveFlag,
  getFlags,
  rejectFlag,
  removeFlag,
} from "@/lib/api/moderation";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ContentFlag, FlagReason, FlagStatus } from "@/types/moderation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Flag, Loader2, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ModerationDashboardPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("ALL");
  const [selectedFlag, setSelectedFlag] = useState<ContentFlag | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | "remove" | null>(
    null,
  );
  const [actionReason, setActionReason] = useState("");

  // Fetch flags
  const { data: flagsData, isLoading } = useQuery({
    queryKey: ["moderation", "flags", statusFilter, contentTypeFilter],
    queryFn: () =>
      getFlags({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        contentType:
          contentTypeFilter !== "ALL" ? contentTypeFilter : undefined,
        limit: 100,
      }),
  });

  // Approve flag mutation
  const approveMutation = useMutation({
    mutationFn: ({ flagId, reason }: { flagId: string; reason: string }) =>
      approveFlag(flagId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "flags"] });
      toast.success("Flag approved - action taken");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError(
        "PATCH",
        `/moderation/flags/${selectedFlag?.id}/approve`,
        error,
      );
      const message = getErrorMessage(error, "Failed to approve flag");
      toast.error("Failed to approve", { description: message });
    },
  });

  // Reject flag mutation
  const rejectMutation = useMutation({
    mutationFn: ({ flagId, reason }: { flagId: string; reason: string }) =>
      rejectFlag(flagId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "flags"] });
      toast.success("Flag rejected - no action taken");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError(
        "PATCH",
        `/moderation/flags/${selectedFlag?.id}/reject`,
        error,
      );
      const message = getErrorMessage(error, "Failed to reject flag");
      toast.error("Failed to reject", { description: message });
    },
  });

  // Remove content mutation
  const removeMutation = useMutation({
    mutationFn: ({ flagId, reason }: { flagId: string; reason: string }) =>
      removeFlag(flagId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "flags"] });
      toast.success("Content removed successfully");
      closeDialog();
    },
    onError: (error) => {
      logger.apiError(
        "PATCH",
        `/moderation/flags/${selectedFlag?.id}/remove`,
        error,
      );
      const message = getErrorMessage(error, "Failed to remove content");
      toast.error("Failed to remove", { description: message });
    },
  });

  const closeDialog = () => {
    setAction(null);
    setSelectedFlag(null);
    setActionReason("");
  };

  const handleAction = () => {
    if (!selectedFlag || !actionReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    const data = { flagId: selectedFlag.id, reason: actionReason.trim() };

    switch (action) {
      case "approve":
        approveMutation.mutate(data);
        break;
      case "reject":
        rejectMutation.mutate(data);
        break;
      case "remove":
        removeMutation.mutate(data);
        break;
    }
  };

  const flags = flagsData?.flags || [];

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    removeMutation.isPending;

  const getStatusColor = (status: FlagStatus) => {
    switch (status) {
      case FlagStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case FlagStatus.APPROVED:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case FlagStatus.REJECTED:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case FlagStatus.REMOVED:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReasonLabel = (reason: FlagReason) => {
    return reason.replace(/_/g, " ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Moderation Dashboard</h2>
        <p className="text-muted-foreground">
          Review and moderate flagged content
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={FlagStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={FlagStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={FlagStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={FlagStatus.REMOVED}>Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={contentTypeFilter}
                onValueChange={setContentTypeFilter}
              >
                <SelectTrigger id="contentType" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="ITEM">Items</SelectItem>
                  <SelectItem value="COMMENT">Comments</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                  <SelectItem value="TRADE">Trades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flags List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Flag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Flags Found</h3>
            <p className="text-muted-foreground text-center">
              No content has been flagged with these filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(flag.status)}
                      >
                        {flag.status}
                      </Badge>
                      <Badge variant="outline">{flag.contentType}</Badge>
                      <Badge variant="outline" className="text-orange-600">
                        {getReasonLabel(flag.reason)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported {format(new Date(flag.createdAt), "PPp")}
                    </p>
                  </div>
                  {flag.status === FlagStatus.PENDING && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFlag(flag);
                          setAction("approve");
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFlag(flag);
                          setAction("reject");
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedFlag(flag);
                          setAction("remove");
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              {flag.description && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <p className="text-sm">{flag.description}</p>
                    {flag.reviewedBy && flag.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed {format(new Date(flag.reviewedAt), "PPp")}
                      </p>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={action !== null} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === "approve" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  Approve Flag
                </>
              )}
              {action === "reject" && (
                <>
                  <XCircle className="h-5 w-5 text-gray-500" />
                  Reject Flag
                </>
              )}
              {action === "remove" && (
                <>
                  <Trash2 className="h-5 w-5 text-red-500" />
                  Remove Content
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" &&
                "This will mark the flag as valid and take appropriate action."}
              {action === "reject" &&
                "This will dismiss the flag without taking action."}
              {action === "remove" &&
                "This will permanently remove the flagged content from the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-reason">Reason *</Label>
              <Textarea
                id="action-reason"
                placeholder="Explain your decision..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="mt-1.5"
                rows={4}
              />
            </div>
            {selectedFlag && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-1">Flag Details:</p>
                <p className="text-muted-foreground">
                  {selectedFlag.contentType} #{selectedFlag.contentId}
                </p>
                <p className="text-muted-foreground">
                  Reason: {getReasonLabel(selectedFlag.reason)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={action === "remove" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={!actionReason.trim() || isPending}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
