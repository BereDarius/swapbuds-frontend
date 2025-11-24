/**
 * Item Detail Page
 *
 * Displays full details of a single item with image gallery,
 * owner information, and action buttons (edit/delete for owner, trade for others).
 */

"use client";

import { TradeProposalDialog } from "@/components/trades/trade-proposal-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteItem, getItemById, incrementItemView } from "@/lib/api/items";
import { useAuthStore } from "@/stores/authStore";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  DELIVERY_METHOD_INFO,
  DELIVERY_SCOPE_INFO,
  ItemStatus,
} from "@/types/item";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Calendar,
  Edit,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const itemId = params.id as string;
  const { user } = useAuthStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  // Increment view count on mount
  useEffect(() => {
    if (itemId) {
      incrementItemView(itemId).catch(() => {
        // Silently fail if view increment fails
      });
    }
  }, [itemId]);

  const handleDelete = async () => {
    if (!itemId) return;

    try {
      setIsDeleting(true);
      await deleteItem(itemId);

      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ["items"] });

      toast.success("Item deleted successfully");
      router.push("/items");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isOwner = user?.id === item?.userId;
  const conditionInfo = item ? CONDITION_INFO[item.condition] : null;
  const categoryInfo = item ? CATEGORY_INFO[item.category] : null;
  const images = item?.images || [];
  const selectedImage = images[selectedImageIndex];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <p className="text-destructive">
              Item not found or failed to load.
            </p>
            <Button className="mt-4" onClick={() => router.push("/items")}>
              Back to Items
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conditionColor = {
    green: "bg-green-500/10 text-green-700 dark:text-green-400",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
  }[conditionInfo!.color];

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        ← Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {selectedImage || images.length > 0 ? (
              <Image
                src={selectedImage?.url || images[0]?.url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}

            {item.status !== "AVAILABLE" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Badge variant="secondary" className="text-lg">
                  {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/50"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${item.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          {/* Title & Actions */}
          <div>
            <div className="mb-2 flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{item.title}</h1>
              {isOwner && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/items/${item.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this item? This action
                          cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {/* Trade Proposal Button (for non-owners) */}
            {!isOwner && user && item.status === ItemStatus.AVAILABLE && (
              <div className="mb-4">
                <Button
                  onClick={() => setTradeDialogOpen(true)}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  <ArrowLeftRight className="mr-2 h-5 w-5" />
                  Propose Trade
                </Button>
                <TradeProposalDialog
                  open={tradeDialogOpen}
                  onOpenChange={setTradeDialogOpen}
                  requestedItem={item}
                />
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={conditionColor}>
                {conditionInfo!.label}
              </Badge>
              <Badge variant="secondary">
                {categoryInfo!.icon} {categoryInfo!.label}
              </Badge>
              {item.estimatedValue && (
                <Badge variant="outline" className="text-lg">
                  €{item.estimatedValue.toString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {item.description}
            </p>
          </div>

          <Separator />

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Condition:</span>
                <span className="text-muted-foreground">
                  {conditionInfo!.description}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Delivery:</span>
                <div className="flex flex-wrap gap-1">
                  {item.deliveryMethods.map((method) => (
                    <Badge key={method} variant="secondary" className="text-xs">
                      {DELIVERY_METHOD_INFO[method].icon}{" "}
                      {DELIVERY_METHOD_INFO[method].label}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {DELIVERY_SCOPE_INFO[item.deliveryScope].label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Listed:</span>
                <span className="text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {item._count?.likes || 0} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {item._count?.comments || 0} comments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.viewCount} views
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Owner Card */}
          {item.user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Listed by</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/profile/${item.user.id}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={item.user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {item.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{item.user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Reputation: {item.user.reputationScore.toFixed(1)}
                      {item.user.isVerified && " • Verified"}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isOwner && item.status === "AVAILABLE" && (
            <div className="flex gap-3">
              <Button className="flex-1" size="lg">
                Propose Trade
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
