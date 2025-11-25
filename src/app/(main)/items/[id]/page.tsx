"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getItemById } from "@/lib/api/items";
import { useAuthStore } from "@/stores/authStore";
import { CATEGORY_INFO, CONDITION_INFO, DeliveryMethod } from "@/types/item";
import { useQuery } from "@tanstack/react-query";
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

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const itemId = params.id as string;

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

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
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
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
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
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
            <Button size="icon" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline">
              <Flag className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{item.likesCount || 0} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{item.commentsCount || 0} comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
