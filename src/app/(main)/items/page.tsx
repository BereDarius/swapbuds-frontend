/**
 * Items Listing Page
 *
 * Browse all available items with filtering, search, and pagination.
 * Features grid/list view toggle, category filters, and sorting options.
 */

"use client";

import { ItemCard } from "@/components/items/item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getItems } from "@/lib/api/items";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  ItemCategory,
  ItemCondition,
  ItemFilters,
  ItemStatus,
} from "@/types/item";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ItemsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<ItemFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: ItemStatus.AVAILABLE,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: itemsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items", filters],
    queryFn: () => getItems(filters),
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 3 || value.trim().length === 0) {
      setFilters((prev) => ({
        ...prev,
        search: value.trim() || undefined,
        page: 1,
      }));
    }
  };

  const handleFilterChange = (key: keyof ItemFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Items</h1>
          <p className="mt-2 text-muted-foreground">
            Discover items available for trade
          </p>
        </div>
        <Link href="/items/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            List Item
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <Label>Category</Label>
            <Select
              value={filters.category || "ALL"}
              onValueChange={(value) =>
                handleFilterChange("category", value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {Object.values(ItemCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_INFO[category].icon}{" "}
                    {CATEGORY_INFO[category].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition Filter */}
          <div className="flex-1 min-w-[200px]">
            <Label>Condition</Label>
            <Select
              value={filters.condition || "ALL"}
              onValueChange={(value) =>
                handleFilterChange("condition", value === "ALL" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any condition</SelectItem>
                {Object.values(ItemCondition).map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {CONDITION_INFO[condition].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[200px]">
            <Label>Sort by</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                setFilters((prev) => ({
                  ...prev,
                  sortBy: sortBy as ItemFilters["sortBy"],
                  sortOrder: sortOrder as ItemFilters["sortOrder"],
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest first</SelectItem>
                <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="viewCount-desc">Most viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Results Count */}
      {!isLoading && itemsData && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {itemsData.items.length} of {itemsData.total} items
        </p>
      )}

      {/* Items Grid/List */}
      {isLoading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className={viewMode === "grid" ? "h-[350px]" : "h-[200px] w-full"}
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">
            Failed to load items. Please try again later.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : itemsData && itemsData.items.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-4"
          }
        >
          {itemsData.items.map((item) => (
            <ItemCard key={item.id} item={item} variant={viewMode} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            {filters.search
              ? "No items found matching your search."
              : "No items available yet. Be the first to list one!"}
          </p>
          <Link href="/items/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              List Your First Item
            </Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {itemsData && itemsData.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page! - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {itemsData.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={filters.page === itemsData.totalPages}
            onClick={() => handlePageChange(filters.page! + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
