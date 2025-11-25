"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createComment, getItemComments } from "@/lib/api/comments";
import { getItemById } from "@/lib/api/items";
import { checkIfLiked, likeItem, unlikeItem } from "@/lib/api/likes";
import { useAuthStore } from "@/stores/authStore";
import { CATEGORY_INFO, CONDITION_INFO, DeliveryMethod } from "@/types/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Flag,
  Heart,
  Loader2,
  MessageSquare,
  Package,
  Send,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const itemId = params.id as string;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

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

  const { data: comments = [] } = useQuery({
    queryKey: ["item", itemId, "comments"],
    queryFn: () => getItemComments(itemId),
    enabled: !!itemId && showComments,
  });

  const likeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikeItem(itemId) : likeItem(itemId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", itemId, "liked"] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      toast.success(isLiked ? "Removed from likes" : "Added to likes");
    },
    onError: () => {
      toast.error("Failed to update like");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(itemId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", itemId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      setCommentText("");
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error("Please login to like items");
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-bold">Item not found</h2>
        <p className="mb-6 text-muted-foreground">
          This item may have been removed or doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/items")}>Back to Items</Button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[item.category];
  const conditionInfo = CONDITION_INFO[item.condition];
  const isOwner = user?.id === item.owner?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted transition-opacity hover:opacity-90"
            onClick={() =>
              item.images &&
              item.images.length > 0 &&
              setSelectedImage(item.images[0])
            }
          >
            {item.images && item.images.length > 0 ? (
              <Image
                src={item.images[0]}
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
          </div>
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-90"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img}
                    alt={`${item.title} ${idx + 2}`}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge>
                {categoryInfo.icon} {categoryInfo.label}
              </Badge>
              <Badge variant="outline">{conditionInfo.label}</Badge>
              {item.status !== "AVAILABLE" && (
                <Badge variant="secondary">
                  {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{item.title}</h1>
            {item.estimatedValue && (
              <p className="mt-2 text-2xl font-semibold text-primary">
                €{item.estimatedValue}
              </p>
            )}
          </div>

          {item.description && (
            <div>
              <h2 className="mb-2 font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          <div>
            <h2 className="mb-2 font-semibold">Details</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Condition:</dt>
                <dd>{conditionInfo.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category:</dt>
                <dd>{categoryInfo.label}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery:</dt>
                <dd>
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
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">Listed by</h3>
                <Link
                  href={`/profile/${item.owner.username}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Avatar>
                    <AvatarImage src={item.owner.avatarUrl || undefined} />
                    <AvatarFallback>
                      {item.owner.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.owner.username}</p>
                    <p className="text-sm text-muted-foreground">
                      View profile
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {!isOwner && item.status === "AVAILABLE" && (
              <Button size="lg" className="flex-1">
                Propose Trade
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push(`/items/${item.id}/edit`)}
                >
                  Edit Item
                </Button>
                <Button size="lg" variant="outline">
                  Delete
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button
                  size="icon"
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setShowComments(true)}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button size="icon" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
            {!isOwner && (
              <Button size="icon" variant="outline">
                <Flag className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div
              className={`flex items-center gap-1 ${
                !isOwner ? "cursor-pointer hover:text-foreground" : ""
              }`}
              onClick={() => !isOwner && handleLike()}
            >
              <Heart className="h-4 w-4" />
              <span>{item.likesCount || 0} likes</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                !isOwner ? "cursor-pointer hover:text-foreground" : ""
              }`}
              onClick={() => !isOwner && setShowComments(true)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{item.commentsCount || 0} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={item.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments ({item.commentsCount || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.avatarUrl || undefined} />
                    <AvatarFallback>
                      {comment.author?.username?.slice(0, 2).toUpperCase() ||
                        "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm font-semibold">
                        {comment.author?.username}
                      </p>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {!isOwner && (
            <div className="flex gap-2 border-t pt-4">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                disabled={commentMutation.isPending}
              />
              <Button
                size="icon"
                onClick={handleComment}
                disabled={commentMutation.isPending || !commentText.trim()}
              >
                {commentMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
