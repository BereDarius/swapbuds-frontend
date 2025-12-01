"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { acceptTrade, getTradeById, rejectTrade } from "@/lib/api/trades";
import { useAuthStore } from "@/stores/authStore";
import { TRADE_STATUS_INFO } from "@/types/trade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeftRight, Loader2, MessageSquare, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const tradeId = params.id as string;

  const { data: trade, isLoading } = useQuery({
    queryKey: ["trade", tradeId],
    queryFn: () => getTradeById(tradeId),
    enabled: !!tradeId,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptTrade,
    onSuccess: () => {
      toast.success("Trade accepted");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
    },
    onError: () => {
      toast.error("Failed to accept trade");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectTrade,
    onSuccess: () => {
      toast.success("Trade rejected");
      router.push("/trades");
    },
    onError: () => {
      toast.error("Failed to reject trade");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ArrowLeftRight className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Trade not found</h2>
        <Button onClick={() => router.push("/trades")}>Back to Trades</Button>
      </div>
    );
  }

  const statusInfo = TRADE_STATUS_INFO[trade.status];
  const isReceiver = user?.id === trade.responder.id;
  const canAccept = isReceiver && trade.status === "PENDING";
  const canReject = isReceiver && trade.status === "PENDING";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trade Details</h1>
          <Badge
            variant={
              statusInfo.color === "green"
                ? "default"
                : statusInfo.color === "red"
                  ? "destructive"
                  : "secondary"
            }
          >
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Created {format(new Date(trade.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      {/* Trade Items */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Offered by {trade.proposer.username}
            </p>
            <Link
              href={`/items/${trade.itemOffered?.id || "#"}`}
              className="block hover:opacity-80"
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                {trade.itemOffered?.images &&
                trade.itemOffered.images.length > 0 ? (
                  <Image
                    src={trade.itemOffered.images[0]}
                    alt={trade.itemOffered.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {trade.itemOffered?.title || "Item"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Details available on item page
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Requested from {trade.responder.username}
            </p>
            <Link
              href={`/items/${trade.itemRequested?.id || "#"}`}
              className="block hover:opacity-80"
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                {trade.itemRequested?.images &&
                trade.itemRequested.images.length > 0 ? (
                  <Image
                    src={trade.itemRequested.images[0]}
                    alt={trade.itemRequested.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {trade.itemRequested?.title || "Item"}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Details available on item page
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {(canAccept || canReject) && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="mb-4 font-medium">You received this trade proposal</p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => acceptMutation.mutate(tradeId)}
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Accept Trade
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => rejectMutation.mutate(tradeId)}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Trade Chat</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Discuss trade details with{" "}
            {isReceiver ? trade.proposer.username : trade.responder.username}
          </p>
          <Button asChild>
            <Link href={`/messages/${trade.id}`}>Open Chat</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
