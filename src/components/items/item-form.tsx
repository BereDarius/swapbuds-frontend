"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_INFO,
  CONDITION_INFO,
  DELIVERY_METHOD_INFO,
  DELIVERY_SCOPE_INFO,
  DeliveryMethod,
  DeliveryScope,
  ItemCategory,
  ItemCondition,
  type CreateItemDto,
  type Item,
  type UpdateItemDto,
} from "@/types/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "./image-upload";

// Form validation schema
const itemFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.nativeEnum(ItemCategory, {
    message: "Please select a category",
  }),
  condition: z.nativeEnum(ItemCondition, {
    message: "Please select a condition",
  }),
  images: z
    .array(z.string().url())
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
  estimatedValue: z
    .number()
    .min(0, "Value must be 0 or greater")
    .max(1000000, "Value must be less than 1,000,000")
    .nullable()
    .optional(),
  deliveryMethods: z
    .array(z.nativeEnum(DeliveryMethod))
    .min(1, "Select at least one delivery method"),
  deliveryScope: z.nativeEnum(DeliveryScope, {
    message: "Please select a delivery scope",
  }),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item;
  onSubmit: (data: CreateItemDto | UpdateItemDto) => Promise<void>;
  submitLabel?: string;
}

export function ItemForm({
  item,
  onSubmit,
  submitLabel = "Create Item",
}: ItemFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values or existing item data
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      category: item?.category || undefined,
      condition: item?.condition || undefined,
      images: item?.images || [],
      estimatedValue: item?.estimatedValue || null,
      deliveryMethods: item?.deliveryMethods || [],
      deliveryScope: item?.deliveryScope || undefined,
    },
  });

  const handleSubmit = async (values: ItemFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert form values to DTO
      const dto: CreateItemDto | UpdateItemDto = {
        title: values.title,
        description: values.description,
        category: values.category,
        condition: values.condition,
        images: values.images,
        estimatedValue: values.estimatedValue || undefined,
        deliveryMethods: values.deliveryMethods,
        deliveryScope: values.deliveryScope,
      };

      await onSubmit(dto);

      toast.success(
        item ? "Item updated successfully" : "Item created successfully",
      );
      router.push("/items");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        item
          ? "Failed to update item. Please try again."
          : "Failed to create item. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryMethodsValue = form.watch("deliveryMethods");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter item title"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Give your item a clear, descriptive title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your item in detail"
                  className="min-h-32"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Include details about the item&apos;s features, condition, and
                history
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(CATEGORY_INFO).map(([value, info]) => (
                    <SelectItem key={value} value={value}>
                      {info.icon} {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the category that best describes your item
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Condition */}
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(CONDITION_INFO).map(([value, info]) => (
                    <SelectItem key={value} value={value}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Be honest about the condition of your item
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  maxImages={5}
                  maxSizeInMB={5}
                />
              </FormControl>
              <FormDescription>
                Upload up to 5 images. The first image will be the primary
                image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estimated Value */}
        <FormField
          control={form.control}
          name="estimatedValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Value (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter estimated value"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? null : parseFloat(value));
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Estimated value in your local currency (helps find fair trades)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Methods */}
        <FormField
          control={form.control}
          name="deliveryMethods"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Methods</FormLabel>
              <FormDescription>
                Select all delivery methods you can offer
              </FormDescription>
              <div className="space-y-2">
                {Object.entries(DELIVERY_METHOD_INFO).map(([value, info]) => {
                  const isChecked = deliveryMethodsValue?.includes(
                    value as DeliveryMethod,
                  );
                  return (
                    <div key={value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`delivery-${value}`}
                        checked={isChecked}
                        onChange={(e) => {
                          const newValue = e.target.checked
                            ? [...(field.value || []), value as DeliveryMethod]
                            : field.value?.filter((v) => v !== value) || [];
                          field.onChange(newValue);
                        }}
                        disabled={isSubmitting}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`delivery-${value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {info.icon} {info.label} - {info.description}
                      </label>
                    </div>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Delivery Scope */}
        <FormField
          control={form.control}
          name="deliveryScope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Scope</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery scope" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(DELIVERY_SCOPE_INFO).map(([value, info]) => (
                    <SelectItem key={value} value={value}>
                      {info.label} - {info.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                What&apos;s your preferred delivery range?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
