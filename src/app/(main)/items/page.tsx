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
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ItemsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [condition, setCondition] = useState<string>("ALL");
  const [page, setPage] = useState(() => {
    // Initialize page from URL query param
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const limit = 12;

  // Derive page from URL query params
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum > 0 && pageNum !== page) {
        setPage(pageNum);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [searchParams, page]);

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
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="items-page-title"
          >
            Browse Items
          </h1>
          <p
            className="mt-2 text-muted-foreground"
            data-testid="items-page-description"
          >
            Discover items available for trade
          </p>
        </div>
        <Link href="/items/new">
          <Button className="gap-2" data-testid="items-list-item-button">
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
            data-testid="items-search-input"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="items-category-select">
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
          <SelectTrigger data-testid="items-condition-select">
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
        <div
          className="flex items-center justify-center py-12"
          data-testid="items-loading"
        >
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12" data-testid="items-error">
          <p
            className="text-destructive mb-4"
            data-testid="items-error-message"
          >
            Failed to load items. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            data-testid="items-retry-button"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="text-center py-12" data-testid="items-empty">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3
            className="text-lg font-semibold mb-2"
            data-testid="items-empty-title"
          >
            No items found
          </h3>
          <p
            className="text-muted-foreground mb-6"
            data-testid="items-empty-message"
          >
            Try adjusting your filters or be the first to list an item
          </p>
          <Button asChild data-testid="items-empty-list-button">
            <Link href="/items/new">List Your First Item</Link>
          </Button>
        </div>
      )}

      {/* Items Grid */}
      {!isLoading && !error && items.length > 0 && (
        <>
          <div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            data-testid="items-grid"
          >
            {items.map((item) => {
              const categoryInfo = CATEGORY_INFO[item.category];
              const conditionInfo = CONDITION_INFO[item.condition];
              const firstImage = item.images?.[0];

              return (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card
                    className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                    data-testid={`item-card-${item.id}`}
                  >
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
                      <h3
                        className="line-clamp-2 font-semibold group-hover:text-primary"
                        data-testid={`item-title-${item.id}`}
                      >
                        {item.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs"
                          data-testid={`item-category-${item.id}`}
                        >
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
            <div
              className="mt-8 flex items-center justify-center gap-2"
              data-testid="items-pagination"
            >
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                data-testid="items-previous-button"
              >
                Previous
              </Button>
              <span
                className="text-sm text-muted-foreground"
                data-testid="items-page-info"
              >
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                data-testid="items-next-button"
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
