"use client";

import { ItemForm } from "@/components/items/item-form";
import { getItemById, updateItem } from "@/lib/api/items";
import type { Item, UpdateItemDto } from "@/types/item";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null,
  );

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;

    const loadItem = async () => {
      try {
        setIsLoading(true);
        const data = await getItemById(resolvedParams.id);
        setItem(data);
      } catch (err) {
        console.error("Failed to load item:", err);
        setError("Failed to load item. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [resolvedParams]);

  const handleSubmit = async (data: UpdateItemDto) => {
    if (!resolvedParams) return;
    await updateItem(resolvedParams.id, data);
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="text-center">
          <p className="text-destructive">{error || "Item not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-primary hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Item</h1>
        <p className="text-muted-foreground mt-2">
          Update your item listing details
        </p>
      </div>

      <ItemForm item={item} onSubmit={handleSubmit} submitLabel="Update Item" />
    </div>
  );
}
