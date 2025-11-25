"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getItems } from "@/lib/api/items";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  ItemCategory,
  ItemCondition,
} from "@/types/item";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Package, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [condition, setCondition] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ["items", { search, category, condition, page, limit }],
    queryFn: () =>
      getItems({
        search: search || undefined,
        category: category !== "ALL" ? (category as ItemCategory) : undefined,
        condition:
          condition !== "ALL" ? (condition as ItemCondition) : undefined,
        page,
        limit,
      }),
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
          <p className="mt-2 text-muted-foreground">
            Discover items available for trade
          </p>
        </div>
        <Link href="/items/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            List Item
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                {info.icon} {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger>
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Conditions</SelectItem>
            {Object.entries(CONDITION_INFO).map(([key, info]) => (
              <SelectItem key={key} value={key}>
                {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            Failed to load items. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or be the first to list an item
          </p>
          <Button asChild>
            <Link href="/items/new">List Your First Item</Link>
          </Button>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const categoryInfo = CATEGORY_INFO[item.category];
              const conditionInfo = CONDITION_INFO[item.condition];
              const firstImage = item.images?.[0];

              return (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {item.status !== "AVAILABLE" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Badge variant="secondary">
                            {item.status === "IN_TRADE" ? "In Trade" : "Traded"}
                          </Badge>
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className={`absolute right-2 top-2 bg-${conditionInfo.color}-500/10`}
                      >
                        {conditionInfo.label}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="line-clamp-2 font-semibold group-hover:text-primary">
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryInfo.icon} {categoryInfo.label}
                        </Badge>
                        {item.estimatedValue && (
                          <span className="text-sm font-medium">
                            €{item.estimatedValue}
                          </span>
                        )}
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
