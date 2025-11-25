"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteItem, getItemById, updateItem } from "@/lib/api/items";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  DeliveryMethod,
  ItemCategory,
  ItemCondition,
  type UpdateItemDto,
} from "@/types/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const itemId = params.id as string;

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => getItemById(itemId),
    enabled: !!itemId,
  });

  const getInitialFormData = () => {
    if (item) {
      return {
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        estimatedValue: item.estimatedValue?.toString() || "",
        deliveryMethods: item.deliveryMethods || [],
      };
    }
    return {
      title: "",
      description: "",
      category: "" as ItemCategory,
      condition: "" as ItemCondition,
      estimatedValue: "",
      deliveryMethods: [] as DeliveryMethod[],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Update form when item data loads
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        estimatedValue: item.estimatedValue?.toString() || "",
        deliveryMethods: item.deliveryMethods || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemDto }) =>
      updateItem(id, data),
    onSuccess: () => {
      toast.success("Item updated successfully");
      queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      router.push(`/items/${itemId}`);
    },
    onError: () => {
      toast.error("Failed to update item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      toast.success("Item deleted successfully");
      router.push("/items");
    },
    onError: () => {
      toast.error("Failed to delete item");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateMutation.mutate({
      id: itemId,
      data: {
        ...formData,
        estimatedValue: formData.estimatedValue
          ? parseFloat(formData.estimatedValue)
          : undefined,
      },
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this item? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate(itemId);
    }
  };

  const toggleDeliveryMethod = (method: DeliveryMethod) => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter((m) => m !== method)
        : [...prev.deliveryMethods, method],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">Item not found</h2>
        <Button onClick={() => router.push("/items")}>Back to Items</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Item</h1>
        <p className="text-muted-foreground">Update your item details</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Vintage Nintendo Game Boy"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your item..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v as ItemCategory })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.icon} {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condition">
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(v) =>
                    setFormData({ ...formData, condition: v as ItemCondition })
                  }
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDITION_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="value">Estimated Value (€)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedValue: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <Label className="mb-3 block">Delivery Methods</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="physical"
                    checked={formData.deliveryMethods.includes(
                      DeliveryMethod.PHYSICAL,
                    )}
                    onCheckedChange={() =>
                      toggleDeliveryMethod(DeliveryMethod.PHYSICAL)
                    }
                  />
                  <Label htmlFor="physical" className="cursor-pointer">
                    In-person exchange
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mail"
                    checked={formData.deliveryMethods.includes(
                      DeliveryMethod.MAIL,
                    )}
                    onCheckedChange={() =>
                      toggleDeliveryMethod(DeliveryMethod.MAIL)
                    }
                  />
                  <Label htmlFor="mail" className="cursor-pointer">
                    Shipping
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
