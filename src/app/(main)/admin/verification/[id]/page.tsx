"use client";

import { OptimizedImage } from "@/components/optimized-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import {
  approveVerification,
  rejectVerification,
  updateVerificationNotes,
} from "@/lib/api/verification";
import { useAuthStore } from "@/stores/authStore";
import { VerificationRequest } from "@/types/verification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import {
  CalendarIcon,
  CheckCircle,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function VerificationDetailPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const verificationId = params.id as string;
  const queryClient = useQueryClient();

  const { data: verification, isLoading } = useQuery<VerificationRequest>({
    queryKey: ["admin-verification", verificationId],
    queryFn: async () => {
      const response = await api.get(`/verification/admin/${verificationId}`);
      return response.data;
    },
    enabled: user?.role === "ADMIN" && !!verificationId,
  });

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState(verification?.notes || "");
  const [approvalNotes, setApprovalNotes] = useState("");

  const approveMutation = useMutation({
    mutationFn: (data: { id: string; dateOfBirth: string; notes?: string }) =>
      approveVerification(data.id, {
        dateOfBirth: data.dateOfBirth,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success("Verification approved");
      queryClient.invalidateQueries({
        queryKey: ["admin-verifications-pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-verification", verificationId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      router.push("/admin/verification");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to approve verification"
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: {
      id: string;
      rejectionReason: string;
      notes?: string;
    }) =>
      rejectVerification(data.id, {
        rejectionReason: data.rejectionReason,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success("Verification rejected");
      queryClient.invalidateQueries({
        queryKey: ["admin-verifications-pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-verification", verificationId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      router.push("/admin/verification");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error?.response?.data?.message || "Failed to reject verification"
      );
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: (notes: string) =>
      updateVerificationNotes(verificationId, notes),
    onSuccess: () => {
      toast.success("Notes saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["admin-verification", verificationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-verifications-pending"],
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to save notes");
    },
  });

  const submitApproval = () => {
    if (!verification || !dateOfBirth) {
      toast.error("Please select date of birth");
      return;
    }
    // Combine main notes with approval notes
    const combinedNotes = [notes.trim(), approvalNotes.trim()]
      .filter(Boolean)
      .join("\n\n");
    approveMutation.mutate({
      id: verification.id,
      dateOfBirth: format(dateOfBirth, "yyyy-MM-dd"),
      notes: combinedNotes || undefined,
    });
  };

  const submitRejection = () => {
    if (!verification || !rejectionReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }
    rejectMutation.mutate({
      id: verification.id,
      rejectionReason,
      notes: notes.trim() || undefined,
    });
  };

  if (user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Verification not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/verification">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="mb-2 text-3xl font-bold">Review Verification</h1>
          <p className="text-muted-foreground">
            Review and approve or reject this verification request
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Document Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Document Front
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                {verification.documentUrlFront.startsWith("data:") ? (
                  <OptimizedImage
                    src={verification.documentUrlFront}
                    alt="ID Document Front"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {verification.documentUrlBack && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Document Back
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  {verification.documentUrlBack.startsWith("data:") ? (
                    <OptimizedImage
                      src={verification.documentUrlBack}
                      alt="ID Document Back"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Eye className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Selfie Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                {verification.selfieUrl.startsWith("data:") ? (
                  <OptimizedImage
                    src={verification.selfieUrl}
                    alt="Live Selfie"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Eye className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Compare this selfie with the photo on the ID document to verify
                identity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Verification Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Request Details</span>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Document Type</Label>
                <p className="font-medium">
                  {verification.documentType.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-sm">{verification.userId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Submitted</Label>
                <p className="text-sm">
                  {new Date(verification.submittedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this verification (optional, not shown to user)"
                rows={4}
                className="resize-none"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                These notes are for internal use only
              </p>
              <Button
                onClick={() => updateNotesMutation.mutate(notes)}
                disabled={updateNotesMutation.isPending}
                className="mt-3 w-full"
                variant="outline"
              >
                {updateNotesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowApproveDialog(true)}
              className="flex-1"
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              className="flex-1"
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date of Birth (from document)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? (
                      format(dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date()}
                  />
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-sm text-muted-foreground">
                User must be at least 18 years old
              </p>
            </div>
            <div>
              <Label htmlFor="approval-notes">Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={submitApproval}
                disabled={approveMutation.isPending || !dateOfBirth}
                className="flex-1"
              >
                {approveMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Document is blurry, expired, or unreadable"
                rows={3}
              />
              <p className="mt-1 text-sm text-muted-foreground">
                This will be shown to the user
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={submitRejection}
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                className="flex-1"
              >
                {rejectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
