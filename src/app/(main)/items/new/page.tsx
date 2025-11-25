"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createItem } from "@/lib/api/items";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  DeliveryMethod,
  DeliveryScope,
  ItemCategory,
  ItemCondition,
} from "@/types/item";
import { useMutation } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewItemPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ItemCategory | "",
    condition: "" as ItemCondition | "",
    estimatedValue: "",
    deliveryMethods: [DeliveryMethod.PHYSICAL] as DeliveryMethod[],
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: (data) => {
      toast.success("Item listed successfully!");
      router.push(`/items/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to list item. Please try again.");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).slice(0, 5 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.category || !formData.condition) {
      toast.error("Please select category and condition");
      return;
    }

    // TODO: Upload images to Cloudinary first, then pass URLs
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      category: formData.category as ItemCategory,
      condition: formData.condition as ItemCondition,
      deliveryMethods: formData.deliveryMethods,
      deliveryScope: DeliveryScope.LOCAL,
      estimatedValue: formData.estimatedValue
        ? parseFloat(formData.estimatedValue)
        : undefined,
      images: [], // Images need to be uploaded separately
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">List a New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Upload */}
            <div className="space-y-2">
              <Label>Images (up to 5)</Label>
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Vintage Pokemon Cards Collection"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your item in detail..."
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as ItemCategory })
                }
              >
                <SelectTrigger>
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

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    condition: value as ItemCondition,
                  })
                }
              >
                <SelectTrigger>
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

            {/* Estimated Value */}
            <div className="space-y-2">
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

            {/* Delivery Methods */}
            <div className="space-y-2">
              <Label>Delivery Methods</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods.includes(
                      DeliveryMethod.PHYSICAL,
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          deliveryMethods: [
                            ...formData.deliveryMethods,
                            DeliveryMethod.PHYSICAL,
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          deliveryMethods: formData.deliveryMethods.filter(
                            (m) => m !== DeliveryMethod.PHYSICAL,
                          ),
                        });
                      }
                    }}
                  />
                  <span>In-person</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods.includes(
                      DeliveryMethod.MAIL,
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          deliveryMethods: [
                            ...formData.deliveryMethods,
                            DeliveryMethod.MAIL,
                          ],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          deliveryMethods: formData.deliveryMethods.filter(
                            (m) => m !== DeliveryMethod.MAIL,
                          ),
                        });
                      }
                    }}
                  />
                  <span>Shipping</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Listing..." : "List Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
