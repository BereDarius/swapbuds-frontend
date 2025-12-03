"use client";

import { CommentsList } from "@/components/comments";
import { FlagDialog } from "@/components/moderation/flag-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getItemById } from "@/lib/api/items";
import { checkIfLiked, likeItem, unlikeItem } from "@/lib/api/likes";
import { useVerification } from "@/lib/hooks/useVerification";
import { useAuthStore } from "@/stores/authStore";
import { CATEGORY_INFO, CONDITION_INFO, DeliveryMethod } from "@/types/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Flag,
  Heart,
  Loader2,
  MessageSquare,
  Package,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Format large numbers (0-999, 1k, 1.1k, 1m, 1.1m, etc.)
function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  const m = count / 1000000;
  return m % 1 === 0 ? `${m}m` : `${m.toFixed(1)}m`;
}

// Get singular or plural form based on count
function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const itemId = params.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<
    number | null
  >(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  const { data: isLiked = false } = useQuery({
    queryKey: ["item", itemId, "liked"],
    queryFn: () => checkIfLiked(itemId),
    enabled: !!itemId && !!user,
  });

  const likeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikeItem(itemId) : likeItem(itemId)),
    onMutate: () => {
      // Optimistic update
      const currentCount = item?.likesCount || 0;
      const newCount = isLiked ? currentCount - 1 : currentCount + 1;
      setOptimisticLikesCount(newCount);
    },
    onSuccess: (data) => {
      // Use the count returned from the backend
      queryClient.setQueryData(["item", itemId], (oldData) => {
        if (oldData && typeof oldData === "object") {
          return { ...oldData, likesCount: data.likesCount };
        }
        return oldData;
      });
      queryClient.invalidateQueries({ queryKey: ["item", itemId, "liked"] });
      setOptimisticLikesCount(null);
      toast.success(isLiked ? "Removed from likes" : "Added to likes");
    },
    onError: () => {
      setOptimisticLikesCount(null);
      toast.error("Failed to update like");
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error("Please login to like items");
      return;
    }
    likeMutation.mutate();
  };

  const { isVerified } = useVerification();

  const handleShare = async () => {
    const url = `${window.location.origin}/items/${itemId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: item?.description,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        data-testid="item-details-loading"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-testid="item-details-error"
      >
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold" data-testid="item-error-title">
          Item not found
        </h2>
        <p
          className="mb-6 text-muted-foreground"
          data-testid="item-error-message"
        >
          This item may have been removed or doesn&apos;t exist.
        </p>
        <Button
          onClick={() => router.push("/items")}
          data-testid="item-error-back-button"
        >
          Back to Items
        </Button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[item.category];
  const conditionInfo = CONDITION_INFO[item.condition];
  const isOwner = user?.id === item.owner?.id;

  // Display counts with optimistic updates
  const displayLikesCount = optimisticLikesCount ?? item.likesCount ?? 0;
  const displayCommentsCount = item.commentsCount ?? 0;

  return (
    <div
      className="container mx-auto px-4 py-8"
      data-testid="item-details-page"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images Carousel */}
        <div className="space-y-4" data-testid="item-images-section">
          {/* Main Image Display */}
          <div
            className="relative aspect-square overflow-hidden rounded-lg bg-muted"
            data-testid="item-main-image"
          >
            {item.images && item.images.length > 0 ? (
              <Image
                src={item.images[selectedImageIndex]}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                loading="eager"
                quality={90}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {item.images && item.images.length > 1 && (
            <div
              className="grid grid-cols-5 gap-2"
              data-testid="item-thumbnails"
            >
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`relative aspect-square overflow-hidden rounded-md bg-muted transition-all cursor-pointer ${
                    idx === selectedImageIndex
                      ? "ring-2 ring-primary opacity-60"
                      : "hover:opacity-80"
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                  type="button"
                  data-testid={`item-thumbnail-${idx}`}
                >
                  <Image
                    src={img}
                    alt={`${item.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="20vw"
                    loading="lazy"
                    quality={80}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6" data-testid="item-details-section">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge data-testid="item-category-badge">
                {categoryInfo.icon} {categoryInfo.label}
              </Badge>
              <Badge variant="outline" data-testid="item-condition-badge">
                {conditionInfo.label}
              </Badge>
              {item.status !== "AVAILABLE" && (
                <Badge variant="secondary" data-testid="item-status-badge">
                  {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold" data-testid="item-title">
              {item.title}
            </h1>
            {item.estimatedValue && (
              <p
                className="mt-2 text-2xl font-semibold text-primary"
                data-testid="item-price"
              >
                €{item.estimatedValue}
              </p>
            )}
          </div>

          {item.description && (
            <div data-testid="item-description-section">
              <h2 className="mb-2 font-semibold">Description</h2>
              <p
                className="text-muted-foreground whitespace-pre-wrap"
                data-testid="item-description"
              >
                {item.description}
              </p>
            </div>
          )}

          <div data-testid="item-details-info">
            <h2 className="mb-2 font-semibold">Details</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Condition:</dt>
                <dd data-testid="item-condition-detail">
                  {conditionInfo.label}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category:</dt>
                <dd data-testid="item-category-detail">{categoryInfo.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery:</dt>
                <dd data-testid="item-delivery-detail">
                  {item.deliveryMethods?.includes(DeliveryMethod.PHYSICAL) &&
                  item.deliveryMethods?.includes(DeliveryMethod.MAIL)
                    ? "In-person or Shipping"
                    : item.deliveryMethods?.includes(DeliveryMethod.PHYSICAL)
                      ? "In-person only"
                      : "Shipping only"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Owner */}
          {item.owner && (
            <Card data-testid="item-owner-card">
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Listed by</h3>
                <Link
                  href={`/profile/${item.owner.username}`}
                  className="flex items-center gap-3 hover:underline"
                  data-testid="item-owner-link"
                >
                  <Avatar data-testid="item-owner-avatar">
                    <AvatarImage src={item.owner.avatarUrl || undefined} />
                    <AvatarFallback>
                      {item.owner.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className="font-medium"
                      data-testid="item-owner-username"
                    >
                      {item.owner.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      View profile
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3" data-testid="item-actions">
            {!isOwner && item.status === "AVAILABLE" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`flex-1 ${
                      !isVerified ? "cursor-not-allowed" : ""
                    }`}
                  >
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!isVerified}
                      data-testid="item-propose-trade-button"
                    >
                      Propose Trade
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isVerified && (
                  <TooltipContent>
                    <p>Verify your identity to propose trades</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
            {isOwner && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push(`/items/${item.id}/edit`)}
                  data-testid="item-edit-button"
                >
                  Edit Item
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  data-testid="item-delete-button"
                >
                  Delete
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={!isVerified ? "cursor-not-allowed" : ""}>
                      <Button
                        size="icon"
                        variant={isLiked ? "default" : "outline"}
                        onClick={handleLike}
                        disabled={likeMutation.isPending || !isVerified}
                        data-testid="item-like-button"
                      >
                        <Heart
                          className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                        />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!isVerified && (
                    <TooltipContent>
                      <p>Verify your identity to like items</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const commentsSection =
                            document.getElementById("comments-section");
                          commentsSection?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        data-testid="item-comment-button"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                </Tooltip>
              </>
            )}
            <Button
              size="icon"
              variant="outline"
              onClick={handleShare}
              data-testid="item-share-button"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            {!isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={!isVerified ? "cursor-not-allowed" : ""}>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={!isVerified}
                      onClick={() => setShowFlagDialog(true)}
                      data-testid="item-flag-button"
                    >
                      <Flag className="h-5 w-5" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isVerified && (
                  <TooltipContent>
                    <p>Verify your identity to report items</p>
                  </TooltipContent>
                )}
              </Tooltip>
            )}
          </div>

          {/* Stats */}
          <div
            className="flex gap-6 text-sm text-muted-foreground"
            data-testid="item-stats"
          >
            <div
              className={`flex items-center gap-1 ${
                !isOwner ? "cursor-pointer hover:text-foreground" : ""
              }`}
              onClick={() => !isOwner && handleLike()}
              data-testid="item-likes-count"
            >
              <Heart className="h-4 w-4" />
              <span>
                {formatCount(displayLikesCount)}{" "}
                {pluralize(displayLikesCount, "like", "likes")}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                !isOwner ? "cursor-pointer hover:text-foreground" : ""
              }`}
              onClick={() => {
                const commentsSection =
                  document.getElementById("comments-section");
                commentsSection?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="item-comments-count"
            >
              <MessageSquare className="h-4 w-4" />
              <span>
                {formatCount(displayCommentsCount)}{" "}
                {pluralize(displayCommentsCount, "comment", "comments")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div
        id="comments-section"
        className="mt-12"
        data-testid="item-comments-section"
      >
        <CommentsList itemId={itemId} />
      </div>

      {/* Flag Dialog */}
      {item && (
        <FlagDialog
          open={showFlagDialog}
          onOpenChange={setShowFlagDialog}
          itemId={item.id}
          itemTitle={item.title}
        />
      )}
    </div>
  );
}
