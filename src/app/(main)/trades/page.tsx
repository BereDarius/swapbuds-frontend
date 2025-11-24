"use client";

import { TradeCard } from "@/components/trades/trade-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTrades } from "@/lib/api/trades";
import { TradeStatus, type Trade } from "@/types/trade";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DirectionFilter = "all" | "sent" | "received";
type StatusFilter = "all" | TradeStatus;

export default function TradesPage() {
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch trades with filters
  const {
    data: tradesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trades", { direction, status, page, limit }],
    queryFn: () =>
      getTrades({
        direction: direction === "all" ? undefined : direction,
        status: status === "all" ? undefined : status,
        page,
        limit,
      }),
  });

  const trades = tradesData?.trades || [];
  const pagination = tradesData
    ? {
        currentPage: tradesData.page,
        totalPages: tradesData.totalPages,
        total: tradesData.total,
      }
    : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Trades</h1>
        <p className="text-muted-foreground">
          Manage your trade proposals and offers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Direction Filter */}
        <Tabs
          value={direction}
          onValueChange={(v) => setDirection(v as DirectionFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All Trades</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Filter */}
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All Status</TabsTrigger>
            <TabsTrigger value={TradeStatus.PENDING}>Pending</TabsTrigger>
            <TabsTrigger value={TradeStatus.ACCEPTED}>Accepted</TabsTrigger>
            <TabsTrigger value={TradeStatus.COMPLETED}>Completed</TabsTrigger>
            <TabsTrigger value={TradeStatus.REJECTED}>Rejected</TabsTrigger>
            <TabsTrigger value={TradeStatus.CANCELLED}>Cancelled</TabsTrigger>
            <TabsTrigger value={TradeStatus.EXPIRED}>Expired</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            Failed to load trades. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && trades.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            {direction === "sent" ? (
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            ) : direction === "received" ? (
              <Package className="h-8 w-8 text-muted-foreground" />
            ) : (
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {direction === "sent"
              ? "No trades sent yet"
              : direction === "received"
              ? "No trades received yet"
              : "No trades yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {direction === "sent"
              ? "Browse items and propose your first trade"
              : direction === "received"
              ? "Share your items to receive trade offers"
              : "Start trading by browsing available items"}
          </p>
          <Button asChild>
            <Link href="/items">Browse Items</Link>
          </Button>
        </div>
      )}

      {/* Trades Grid */}
      {!isLoading && !error && trades.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {trades.map((trade: Trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === pagination.totalPages}
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
