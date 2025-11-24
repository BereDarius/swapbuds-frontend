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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export const metadata = {
  title: "Data Management | SwapBuds",
  description: "Export or delete your personal data",
};

/**
 * Data Management Page
 *
 * Allows users to exercise their GDPR data rights:
 * - Export personal data (Right to Data Portability)
 * - Delete account (Right to Erasure)
 *
 * Features:
 * - Data export with download link
 * - Multi-step account deletion confirmation
 * - 30-day grace period explanation
 * - Password verification for deletion
 */
export default function DataManagementPage() {
  // Data Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "processing" | "ready" | "error"
  >("idle");

  // Account Deletion State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle data export request
   */
  const handleDataExport = async () => {
    setIsExporting(true);
    setExportStatus("processing");

    try {
      const response = await api.post("/users/me/data-export");
      logger.info("Data export requested", { response: response.data });

      setExportStatus("ready");
      toast.success("Data export requested", {
        description:
          "You'll receive an email when your data is ready to download (usually within 24 hours).",
      });
    } catch (error) {
      logger.error("Failed to request data export", error);
      setExportStatus("error");
      const message = getErrorMessage(
        error,
        "Failed to request data export. Please try again.",
      );
      toast.error("Export failed", {
        description: message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Open account deletion dialog
   */
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDeleteStep(1);
    setDeleteConfirmText("");
    setDeletePassword("");
  };

  /**
   * Progress to step 2 of deletion
   */
  const handleDeleteStep1Continue = () => {
    if (deleteConfirmText.toUpperCase() === "DELETE") {
      setDeleteStep(2);
      setDeleteConfirmText("");
    } else {
      toast.error("Confirmation text incorrect", {
        description: 'Please type "DELETE" exactly as shown.',
      });
    }
  };

  /**
   * Handle final account deletion
   */
  const handleAccountDeletion = async () => {
    if (!deletePassword) {
      toast.error("Password required", {
        description: "Please enter your password to confirm deletion.",
      });
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete("/users/me", {
        data: { password: deletePassword },
      });

      toast.success("Account deletion scheduled", {
        description:
          "Your account will be deleted in 30 days. You can cancel anytime before then.",
      });

      // Close dialog and redirect to home
      setDeleteDialogOpen(false);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      logger.error("Failed to delete account", error);
      const message = getErrorMessage(
        error,
        "Failed to delete account. Please check your password and try again.",
      );
      toast.error("Deletion failed", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Data Management</h2>
        <p className="text-sm text-muted-foreground">
          Exercise your data rights under GDPR. Learn more in our{" "}
          <Link
            href="/legal/privacy"
            className="underline underline-offset-4 hover:text-primary"
            target="_blank"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <Separator />

      {/* Data Export Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download a copy of all your personal data stored on SwapBuds.
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm">Your data export will include:</p>
              <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                <li>Profile information (username, email, bio)</li>
                <li>Items you&apos;ve posted</li>
                <li>Trade history and messages</li>
                <li>Reviews and ratings</li>
                <li>Legal consent records</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                The export will be provided as a JSON file. You can request one
                export every 24 hours.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDataExport}
              disabled={isExporting || exportStatus === "processing"}
            >
              {isExporting ? "Requesting..." : "Request Data Export"}
            </Button>
            {exportStatus === "ready" && (
              <span className="text-sm text-muted-foreground flex items-center">
                Request sent! Check your email.
              </span>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Deletion Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">
            Delete Account
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-destructive">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground">
                Deleting your account will:
              </p>
              <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                <li>Remove your profile and all personal information</li>
                <li>Delete all your posted items</li>
                <li>Cancel pending trades</li>
                <li>Remove your reviews and messages</li>
                <li>
                  Start a 30-day grace period (you can cancel within this time)
                </li>
              </ul>
              <p className="text-sm font-medium">
                Some data may be retained for legal compliance:
              </p>
              <ul className="list-inside list-disc text-sm text-muted-foreground space-y-1">
                <li>Transaction records (anonymized after 30 days)</li>
                <li>Legal consent logs (required by law)</li>
                <li>Dispute resolution records</li>
              </ul>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleOpenDeleteDialog}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Account Deletion Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account - Step 1 of 2
                </DialogTitle>
                <DialogDescription>
                  This action will permanently delete your account after a
                  30-day grace period. Are you sure you want to continue?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-text">
                    Type <span className="font-mono font-bold">DELETE</span> to
                    confirm:
                  </Label>
                  <Input
                    id="confirm-text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteStep1Continue}
                  disabled={deleteConfirmText.toUpperCase() !== "DELETE"}
                >
                  Continue
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account - Step 2 of 2
                </DialogTitle>
                <DialogDescription>
                  Enter your password to confirm account deletion.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">After deletion:</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                    <li>You have 30 days to cancel</li>
                    <li>Account will be fully deleted after 30 days</li>
                    <li>You can create a new account anytime</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteStep(1);
                    setDeletePassword("");
                  }}
                  disabled={isDeleting}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAccountDeletion}
                  disabled={isDeleting || !deletePassword}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
