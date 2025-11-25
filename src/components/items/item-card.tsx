/**
 * ItemCard Component
 *
 * Displays an item in a card format for grid/list views.
 * Shows image, title, condition, category, owner info, and engagement stats.
 */

"use client";

import { OptimizedImage } from "@/components/optimized-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CATEGORY_INFO, CONDITION_INFO, Item } from "@/types/item";
import { Eye, Heart, MessageCircle, Package } from "lucide-react";
import Link from "next/link";

const ImagePlaceholder = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted">
    <Package className="h-12 w-12 text-muted-foreground" />
  </div>
);

interface ItemCardProps {
  item: Item;
  variant?: "grid" | "list";
}

/**
 * ItemCard Component
 *
 * @example
 * ```tsx
 * <ItemCard item={item} variant="grid" />
 * ```
 */
export function ItemCard({ item, variant = "grid" }: ItemCardProps) {
  const conditionInfo = CONDITION_INFO[item.condition];
  const categoryInfo = CATEGORY_INFO[item.category];
  const firstImage = item.images?.[0];
  const owner = item.owner;

  const colorMap: Record<string, string> = {
    green: "bg-green-500/10 text-green-700 dark:text-green-400",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    orange: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  const conditionColor = colorMap[conditionInfo.color] || colorMap.green;

  if (variant === "list") {
    return (
      <Link href={`/items/${item.id}`} prefetch={false}>
        <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative h-48 w-full sm:h-auto sm:w-48">
              {firstImage ? (
                <OptimizedImage
                  src={firstImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              ) : (
                <ImagePlaceholder />
              )}
              {item.status !== "AVAILABLE" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Badge variant="secondary" className="text-lg">
                    {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="line-clamp-2 text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={conditionColor}>
                  {conditionInfo.label}
                </Badge>
                <Badge variant="secondary">
                  {categoryInfo.icon} {categoryInfo.label}
                </Badge>
                {item.estimatedValue && (
                  <Badge variant="outline">
                    €{item.estimatedValue.toString()}
                  </Badge>
                )}
              </div>

              {/* Owner & Stats */}
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                {owner && (
                  <Link
                    href={`/profile/${owner.id}`}
                    className="flex items-center gap-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                    prefetch={false}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={owner.avatarUrl || undefined} />
                      <AvatarFallback>
                        {owner.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {owner.username}
                    </span>
                  </Link>
                )}

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {item.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {item.commentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {item.viewCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid variant
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
      {/* Image - clickable area */}
      <Link href={`/items/${item.id}`} prefetch={false} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {firstImage ? (
            <OptimizedImage
              src={firstImage}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <ImagePlaceholder />
          )}
          {item.status !== "AVAILABLE" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="secondary">
                {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
              </Badge>
            </div>
          )}

          {/* Condition badge */}
          <Badge
            variant="secondary"
            className={`absolute right-2 top-2 ${conditionColor}`}
          >
            {conditionInfo.label}
          </Badge>
        </div>
      </Link>

      {/* Content - clickable area */}
      <Link href={`/items/${item.id}`} prefetch={false} className="block">
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
            {item.title}
          </h3>

          {/* Category & Value */}
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryInfo.icon} {categoryInfo.label}
            </Badge>
            {item.estimatedValue && (
              <span className="text-sm font-medium">
                €{item.estimatedValue.toString()}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="flex items-center justify-between border-t p-3">
        {/* Owner */}
        {owner && (
          <Link
            href={`/profile/${owner.id}`}
            className="flex items-center gap-2 hover:underline"
            prefetch={false}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={owner.avatarUrl || undefined} />
              <AvatarFallback>
                {owner.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {owner.username}
            </span>
          </Link>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {item.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {item.commentsCount}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
