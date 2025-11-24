/**
 * Disputes List Page
 *
 * Displays all disputes for the current user.
 * Shows dispute status, trade details, and resolution.
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
import { Skeleton } from "@/components/ui/skeleton";
import { getMyDisputes } from "@/lib/api/disputes";
import { DisputeReason, DisputeStatus } from "@/types/dispute";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";
import Link from "next/link";

const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  [DisputeReason.ITEM_NOT_AS_DESCRIBED]: "Item not as described",
  [DisputeReason.ITEM_NOT_RECEIVED]: "Item not received",
  [DisputeReason.ITEM_DAMAGED]: "Item damaged",
  [DisputeReason.WRONG_ITEM_SENT]: "Wrong item sent",
  [DisputeReason.COMMUNICATION_ISSUES]: "Communication issues",
  [DisputeReason.SAFETY_CONCERNS]: "Safety concerns",
  [DisputeReason.OTHER]: "Other",
};

const DISPUTE_STATUS_CONFIG: Record<
  DisputeStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [DisputeStatus.OPEN]: {
    label: "Open",
    variant: "destructive",
    icon: AlertCircle,
  },
  [DisputeStatus.UNDER_REVIEW]: {
    label: "Under Review",
    variant: "default",
    icon: Clock,
  },
  [DisputeStatus.RESOLVED]: {
    label: "Resolved",
    variant: "default",
    icon: CheckCircle2,
  },
  [DisputeStatus.CLOSED]: {
    label: "Closed",
    variant: "secondary",
    icon: FileText,
  },
};

export default function DisputesPage() {
  const {
    data: disputes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["disputes", "me"],
    queryFn: getMyDisputes,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Disputes</h1>
        <p className="text-muted-foreground">
          View and manage your trade disputes
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                Failed to load disputes
              </p>
              <p className="text-muted-foreground">
                Please try again later or contact support
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && disputes?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No disputes</h3>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t filed any disputes. We hope your trades go
                smoothly!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputes List */}
      {!isLoading && !error && disputes && disputes.length > 0 && (
        <div className="space-y-4">
          {disputes.map((dispute) => {
            const statusConfig = DISPUTE_STATUS_CONFIG[dispute.status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={dispute.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {DISPUTE_REASON_LABELS[dispute.reason]}
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Trade #{dispute.tradeId.slice(0, 8)} •{" "}
                        {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <Link href={`/trades/${dispute.tradeId}`}>
                      <Button variant="outline" size="sm">
                        View Trade
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Description:</p>
                      <p className="text-sm text-muted-foreground">
                        {dispute.description}
                      </p>
                    </div>

                    {dispute.resolution && (
                      <div>
                        <p className="text-sm font-medium mb-1 text-green-600">
                          Resolution:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dispute.resolution}
                        </p>
                        {dispute.resolvedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Resolved on{" "}
                            {format(
                              new Date(dispute.resolvedAt),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {dispute.status === DisputeStatus.OPEN && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          Our support team will review your dispute and contact
                          you within 24-48 hours.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
