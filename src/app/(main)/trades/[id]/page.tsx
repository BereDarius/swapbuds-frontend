"use client";

import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getConversations } from "@/lib/api/messages";
import { getTradeReviews } from "@/lib/api/reviews";
import {
  acceptTrade,
  cancelTrade,
  completeTrade,
  getTradeById,
  rejectTrade,
} from "@/lib/api/trades";
import { useAuthStore } from "@/stores/authStore";
import type { Review } from "@/types/review";
import { TRADE_STATUS_INFO, TradeStatus } from "@/types/trade";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Package,
  Star,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);

  // Fetch trade details
  const {
    data: trade,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trade", tradeId],
    queryFn: () => getTradeById(tradeId),
    enabled: !!tradeId,
  });

  // Fetch conversations to check if one exists with the other user
  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!trade && !!user,
  });

  // Fetch reviews for this trade
  const { data: reviews } = useQuery({
    queryKey: ["reviews", "trade", tradeId],
    queryFn: () => getTradeReviews(tradeId),
    enabled: !!tradeId && !!trade && trade.status === TradeStatus.COMPLETED,
  });

  // Handle trade actions
  const handleAccept = async () => {
    if (!trade) return;

    try {
      await acceptTrade(trade.id);
      toast.success("Trade accepted successfully!");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    } catch (error) {
      toast.error("Failed to accept trade");
      console.error("Accept trade error:", error);
    }
  };

  const handleReject = async () => {
    if (!trade) return;

    try {
      await rejectTrade(trade.id);
      toast.success("Trade rejected");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    } catch (error) {
      toast.error("Failed to reject trade");
      console.error("Reject trade error:", error);
    }
  };

  const handleCancel = async () => {
    if (!trade) return;

    try {
      await cancelTrade(trade.id);
      toast.success("Trade cancelled");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    } catch (error) {
      toast.error("Failed to cancel trade");
      console.error("Cancel trade error:", error);
    }
  };

  const handleComplete = async () => {
    if (!trade) return;

    try {
      await completeTrade(trade.id);
      toast.success("Trade marked as completed!");
      queryClient.invalidateQueries({ queryKey: ["trade", tradeId] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    } catch (error) {
      toast.error("Failed to complete trade");
      console.error("Complete trade error:", error);
    }
  };

  // Handle messaging the other user
  const handleMessageUser = () => {
    if (!trade) return;
    const otherUserId = isProposer ? trade.responder.id : trade.proposer.id;

    // Check if conversation exists
    const existingConv = conversations?.find(
      (conv) =>
        (conv.user1Id === user?.id && conv.user2Id === otherUserId) ||
        (conv.user2Id === user?.id && conv.user1Id === otherUserId),
    );

    if (existingConv) {
      router.push(`/messages/${existingConv.id}`);
    } else {
      // No existing conversation - navigate to messages and will create on first message
      toast.info(
        "Start a conversation by sending a message to " +
          (isProposer ? trade.responder.username : trade.proposer.username),
      );
      // For now, just show info. To properly create conversation, we'd need to send first message
      // or have a separate endpoint to create empty conversations
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !trade) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load trade details</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isProposer = user?.id === trade.proposer.id;
  const isResponder = user?.id === trade.responder.id;
  const canAccept = isResponder && trade.status === TradeStatus.PENDING;
  const canReject = isResponder && trade.status === TradeStatus.PENDING;
  const canCancel = isProposer && trade.status === TradeStatus.PENDING;
  const canComplete =
    (isProposer || isResponder) && trade.status === TradeStatus.ACCEPTED;

  const statusInfo = TRADE_STATUS_INFO[trade.status];

  // Get items arrays (supporting both single-item and multi-item trades)
  const offeredItems = trade.itemsOffered?.length
    ? trade.itemsOffered
    : trade.itemOffered
    ? [trade.itemOffered]
    : [];

  const requestedItems = trade.itemsRequested?.length
    ? trade.itemsRequested
    : trade.itemRequested
    ? [trade.itemRequested]
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back to Trades
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trade Details</h1>
            <p className="text-muted-foreground">
              Created {format(new Date(trade.createdAt), "PPp")}
            </p>
          </div>
          <Badge
            variant={
              statusInfo.color === "yellow"
                ? "default"
                : statusInfo.color === "green"
                ? "default"
                : statusInfo.color === "red"
                ? "destructive"
                : "secondary"
            }
            className={
              statusInfo.color === "yellow"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : statusInfo.color === "green"
                ? "bg-green-500 hover:bg-green-600"
                : statusInfo.color === "blue"
                ? "bg-blue-500 hover:bg-blue-600"
                : ""
            }
          >
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Participants */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Proposer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Proposed by {isProposer && "(You)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={trade.proposer.avatarUrl || undefined} />
                <AvatarFallback>
                  {trade.proposer.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{trade.proposer.username}</p>
                  {trade.proposer.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Reputation: {trade.proposer.reputationScore.toFixed(1)}
                </p>
              </div>
              {isResponder && (
                <Button variant="outline" size="sm" onClick={handleMessageUser}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Offered to {isResponder && "(You)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={trade.responder.avatarUrl || undefined} />
                <AvatarFallback>
                  {trade.responder.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{trade.responder.username}</p>
                  {trade.responder.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Reputation: {trade.responder.reputationScore.toFixed(1)}
                </p>
              </div>
              {isProposer && (
                <Button variant="outline" size="sm" onClick={handleMessageUser}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Being Traded */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Offered Items */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isProposer ? "You offer:" : "They offer:"}
              </h3>
              <div className="space-y-3">
                {offeredItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="flex gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Arrow Separator */}
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Requested Items */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isProposer ? "You request:" : "They request:"}
              </h3>
              <div className="space-y-3">
                {requestedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="flex gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Delivery Method */}
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Delivery Method:</span>
            <Badge variant="outline">{trade.deliveryMethod}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {trade.message && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Message from {isProposer ? "you" : trade.proposer.username}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{trade.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Created */}
            <div className="flex gap-3">
              <div className="mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Trade Proposed</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(trade.createdAt), "PPp")}
                </p>
              </div>
            </div>

            {/* Accepted */}
            {trade.status === TradeStatus.ACCEPTED && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trade Accepted</p>
                  <p className="text-xs text-muted-foreground">
                    by {trade.responder.username}
                  </p>
                </div>
              </div>
            )}

            {/* Rejected */}
            {trade.status === TradeStatus.REJECTED && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trade Rejected</p>
                  <p className="text-xs text-muted-foreground">
                    by {trade.responder.username}
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled */}
            {trade.status === TradeStatus.CANCELLED && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <XCircle className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trade Cancelled</p>
                  <p className="text-xs text-muted-foreground">
                    by {trade.proposer.username}
                  </p>
                </div>
              </div>
            )}

            {/* Completed */}
            {trade.status === TradeStatus.COMPLETED && (
              <div className="flex gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trade Completed</p>
                  <p className="text-xs text-muted-foreground">
                    Exchange successful!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section (for completed trades) */}
      {trade.status === TradeStatus.COMPLETED && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews
              </CardTitle>
              {/* Show "Leave Review" button if user hasn't reviewed yet */}
              {reviews && !reviews.find((r) => r.reviewerId === user?.id) && (
                <Button
                  onClick={() => {
                    setReviewToEdit(null);
                    setReviewFormOpen(true);
                  }}
                  size="sm"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Leave Review
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showTarget
                    onEdit={
                      review.reviewerId === user?.id
                        ? () => {
                            setReviewToEdit(review);
                            setReviewFormOpen(true);
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No reviews yet</p>
                <p className="text-sm">
                  Be the first to review this trade experience
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Form Dialog */}
      {trade.status === TradeStatus.COMPLETED && (
        <ReviewForm
          tradeId={tradeId}
          existingReview={reviewToEdit ?? undefined}
          open={reviewFormOpen}
          onOpenChange={setReviewFormOpen}
          recipientUsername={
            isProposer ? trade.responder.username : trade.proposer.username
          }
        />
      )}

      {/* Action Buttons */}
      {(canAccept ||
        canReject ||
        canCancel ||
        canComplete ||
        trade.status === TradeStatus.COMPLETED ||
        trade.status === TradeStatus.REJECTED ||
        trade.status === TradeStatus.CANCELLED) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 justify-between">
              {/* Report Problem Button (for completed/rejected/cancelled trades) */}
              <div>
                {(trade.status === TradeStatus.COMPLETED ||
                  trade.status === TradeStatus.REJECTED ||
                  trade.status === TradeStatus.CANCELLED) && (
                  <Link href={`/trades/${tradeId}/dispute`}>
                    <Button variant="outline" className="text-destructive">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Report Problem
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trade Action Buttons */}
              <div className="flex gap-3">
                {canCancel && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel Trade
                  </Button>
                )}
                {canReject && (
                  <Button variant="destructive" onClick={handleReject}>
                    Reject
                  </Button>
                )}
                {canAccept && (
                  <Button onClick={handleAccept}>Accept Trade</Button>
                )}
                {canComplete && (
                  <Button onClick={handleComplete}>Mark as Completed</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
