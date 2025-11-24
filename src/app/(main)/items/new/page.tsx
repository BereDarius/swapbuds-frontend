"use client";

import { ItemForm } from "@/components/items/item-form";
import { createItem } from "@/lib/api/items";
import type { CreateItemDto, UpdateItemDto } from "@/types/item";

export default function NewItemPage() {
  const handleSubmit = async (data: CreateItemDto | UpdateItemDto) => {
    await createItem(data as CreateItemDto);
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Item</h1>
        <p className="text-muted-foreground mt-2">
          List an item you&apos;d like to trade or swap with others
        </p>
      </div>

      <ItemForm onSubmit={handleSubmit} submitLabel="Create Item" />
    </div>
  );
}
