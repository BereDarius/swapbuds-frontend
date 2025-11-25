"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTrades } from "@/lib/api/trades";
import { useAuthStore } from "@/stores/authStore";
import { TRADE_STATUS_INFO, TradeStatus } from "@/types/trade";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function TradesPage() {
  const { user } = useAuthStore();
  const [direction, setDirection] = useState<"all" | "sent" | "received">(
    "all",
  );
  const [status, setStatus] = useState<"all" | TradeStatus>("all");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["trades", { status, page, limit }],
    queryFn: () =>
      getTrades({
        status: status === "all" ? undefined : status,
        page,
        limit,
      }),
  });

  // Filter trades by direction client-side
  const filteredTrades = useMemo(() => {
    if (!data?.trades || !user) return [];

    if (direction === "all") return data.trades;

    return data.trades.filter((trade) => {
      if (direction === "sent") {
        return trade.proposer.id === user.id;
      } else if (direction === "received") {
        return trade.responder.id === user.id;
      }
      return true;
    });
  }, [data, direction, user]);

  const trades = filteredTrades;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Trades</h1>
        <p className="text-muted-foreground">
          Manage your trade proposals and offers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <Tabs
          value={direction}
          onValueChange={(v) => setDirection(v as typeof direction)}
        >
          <TabsList>
            <TabsTrigger value="all">All Trades</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All Status</TabsTrigger>
            <TabsTrigger value={TradeStatus.PENDING}>Pending</TabsTrigger>
            <TabsTrigger value={TradeStatus.ACCEPTED}>Accepted</TabsTrigger>
            <TabsTrigger value={TradeStatus.COMPLETED}>Completed</TabsTrigger>
            <TabsTrigger value={TradeStatus.REJECTED}>Rejected</TabsTrigger>
            <TabsTrigger value={TradeStatus.CANCELLED}>Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load trades</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && trades.length === 0 && (
        <div className="text-center py-12">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trades yet</h3>
          <p className="text-muted-foreground mb-6">
            Start trading by browsing items
          </p>
          <Button asChild>
            <Link href="/items">Browse Items</Link>
          </Button>
        </div>
      )}

      {/* Trades Grid */}
      {!isLoading && !error && trades.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trades.map((trade) => {
              const statusInfo = TRADE_STATUS_INFO[trade.status];

              return (
                <Link key={trade.id} href={`/trades/${trade.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Badge
                          variant={
                            statusInfo.color === "yellow"
                              ? "default"
                              : statusInfo.color === "green"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(trade.createdAt), "MMM d")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            You offer:
                          </p>
                          <p className="font-medium line-clamp-1">
                            {trade.itemOffered?.title || "Item"}
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            You request:
                          </p>
                          <p className="font-medium line-clamp-1">
                            {trade.itemRequested?.title || "Item"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
