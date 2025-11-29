/**
 * MessageVersionHistory Component
 *
 * Dialog for admins to view message edit history.
 * Shows all previous versions with timestamps and editors.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getMessageVersions } from "@/lib/api/messages";
import type { MessageVersion } from "@/types/message";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, History } from "lucide-react";

interface MessageVersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  currentContent: string;
}

export function MessageVersionHistory({
  open,
  onOpenChange,
  messageId,
  currentContent,
}: MessageVersionHistoryProps) {
  const {
    data: versions,
    isLoading,
    error,
  } = useQuery<MessageVersion[]>({
    queryKey: ["message-versions", messageId],
    queryFn: () => getMessageVersions(messageId),
    enabled: open, // Only fetch when dialog is open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Message Edit History
          </DialogTitle>
          <DialogDescription>
            View all previous versions of this message
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-4">
            {/* Current version */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Current Version</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Latest
                  </span>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm">{currentContent}</p>
            </div>

            {isLoading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">
                  Failed to load version history
                </p>
              </div>
            )}

            {!isLoading && !error && versions && versions.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No edit history available
                </p>
              </div>
            )}

            {!isLoading && !error && versions && versions.length > 0 && (
              <>
                <Separator />
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Previous Versions
                </h3>

                {versions.map((version, index) => (
                  <div key={version.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          Version {versions.length - index} •{" "}
                          {formatDistanceToNow(new Date(version.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <span>
                        {format(
                          new Date(version.createdAt),
                          "MMM d, yyyy h:mm a",
                        )}
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Edited by: {version.editedBy}
                    </p>
                    <p className="whitespace-pre-wrap text-sm">
                      {version.content}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
