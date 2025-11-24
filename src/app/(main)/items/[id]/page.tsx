/**
 * Item Detail Page
 *
 * Displays full details of a single item with image gallery,
 * owner information, and action buttons (edit/delete for owner, trade for others).
 */

"use client";

import { FlagDialog } from "@/components/moderation/flag-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createComment,
  deleteComment as deleteCommentApi,
  getItemComments,
} from "@/lib/api/comments";
import { deleteItem, getItemById } from "@/lib/api/items";
import { checkIfLiked, likeItem, unlikeItem } from "@/lib/api/likes";
import { useAuthStore } from "@/stores/authStore";
import { type Comment } from "@/types/comment";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  DELIVERY_METHOD_INFO,
  DELIVERY_SCOPE_INFO,
  ItemStatus,
} from "@/types/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeftRight,
  Calendar,
  Edit,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Send,
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
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", "item", itemId],
    queryFn: () => getItemComments(itemId),
    enabled: !!itemId,
  });

  // Check if item is liked
  const { data: isLiked = false } = useQuery({
    queryKey: ["like", "item", itemId],
    queryFn: () => checkIfLiked(itemId),
    enabled: !!itemId && !!user,
  });

  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: () => likeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["like", "item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      toast.success("Item liked");
    },
    onError: () => {
      toast.error("Failed to like item");
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["like", "item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      toast.success("Item unliked");
    },
    onError: () => {
      toast.error("Failed to unlike item");
    },
  });

  // Comment mutations
  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentCommentId?: string }) =>
      createComment(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      setCommentText("");
      setReplyTo(null);
      toast.success("Comment posted");
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "item", itemId] });
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  // Increment view count on mount
  useEffect(() => {
    // View tracking would go here if backend supports it
    // For now, views are tracked server-side when the item is fetched
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

  const handleLikeToggle = () => {
    if (!user) {
      toast.error("Please log in to like items");
      return;
    }
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleCommentSubmit = () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    createCommentMutation.mutate({
      content: commentText,
      parentCommentId: replyTo ?? undefined,
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const isOwner = user?.id === item?.owner.id;
  const conditionInfo = item ? CONDITION_INFO[item.condition] : null;
  const categoryInfo = item ? CATEGORY_INFO[item.category] : null;
  const images = item?.images || [];
  const selectedImage = images[selectedImageIndex];

  if (isLoading) {
    return (
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
    );
  }

  if (error || !item) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Item not found or failed to load.</p>
          <Button className="mt-4" onClick={() => router.push("/items")}>
            Back to Items
          </Button>
        </CardContent>
      </Card>
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
    <>
      {/* Back Button */}
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        ← Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {selectedImage || images[0] ? (
              <Image
                src={selectedImage || images[0] || "/placeholder.png"}
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
              {images
                .filter((image) => image && image.trim() !== "")
                .map((image, index) => (
                  <button
                    key={`image-${index}`}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                  >
                    <Image
                      src={image}
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
              <div className="mb-4 flex gap-2">
                <Button
                  onClick={() => setTradeDialogOpen(true)}
                  className="flex-1 sm:flex-none"
                  size="lg"
                >
                  <ArrowLeftRight className="mr-2 h-5 w-5" />
                  Propose Trade
                </Button>
                <FlagDialog
                  contentType="ITEM"
                  contentId={item.id}
                  triggerButton={
                    <Button variant="outline" size="lg">
                      Report
                    </Button>
                  }
                />
                <TradeProposalDialog
                  open={tradeDialogOpen}
                  onOpenChange={setTradeDialogOpen}
                  requestedItem={item}
                />
              </div>
            )}

            {/* Report Button (for non-owners when item not available) */}
            {!isOwner && user && item.status !== ItemStatus.AVAILABLE && (
              <div className="mb-4">
                <FlagDialog contentType="ITEM" contentId={item.id} />
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
                  {item.deliveryMethods?.map((method) => (
                    <Badge key={method} variant="secondary" className="text-xs">
                      {DELIVERY_METHOD_INFO[method].icon}{" "}
                      {DELIVERY_METHOD_INFO[method].label}
                    </Badge>
                  ))}
                  {item.deliveryScope && (
                    <Badge variant="outline" className="text-xs">
                      {DELIVERY_SCOPE_INFO[item.deliveryScope].label}
                    </Badge>
                  )}
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
                  {item.likesCount} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {item.commentsCount} comments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {item.viewCount} views
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Owner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Listed by</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/profile/${item.owner.id}`}
                className="flex items-center gap-3 transition-colors hover:text-primary"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={item.owner.avatarUrl || undefined} />
                  <AvatarFallback>
                    {item.owner.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.owner.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Reputation: {(item.owner.reputationScore || 0).toFixed(1)}
                    {item.owner.isVerified && " • Verified"}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isOwner && item.status === "AVAILABLE" && user && (
            <div className="flex gap-3">
              <Button
                onClick={() => setTradeDialogOpen(true)}
                className="flex-1"
                size="lg"
              >
                <ArrowLeftRight className="mr-2 h-5 w-5" />
                Propose Trade
              </Button>
              <Button
                variant={isLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLikeToggle}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          {user && (
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  {replyTo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyTo(null);
                        setCommentText("");
                      }}
                    >
                      Cancel Reply
                    </Button>
                  )}
                  <Button
                    onClick={handleCommentSubmit}
                    disabled={
                      !commentText.trim() || createCommentMutation.isPending
                    }
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {createCommentMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-4 text-muted-foreground">
              <p>
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>{" "}
                to comment
              </p>
            </div>
          )}

          <Separator />

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDelete={handleDeleteComment}
                  onReply={(commentId) => {
                    setReplyTo(commentId);
                    setCommentText(`@${comment.author.username} `);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment on this item</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// Comment Card Component
interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
}

function CommentCard({
  comment,
  currentUserId,
  onDelete,
  onReply,
}: CommentCardProps) {
  const isOwner = currentUserId === comment.authorId;

  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.author.username}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.avatarUrl || undefined} />
          <AvatarFallback>
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/profile/${comment.author.username}`}
            className="font-semibold hover:underline"
          >
            {comment.author.username}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onReply(comment.id)}
          >
            Reply
          </Button>
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-4 space-y-4 border-l-2 border-muted pl-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onDelete={onDelete}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
