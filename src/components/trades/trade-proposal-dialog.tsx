/**
 * Trade Proposal Dialog Component
 *
 * Modal dialog for proposing a trade with another user.
 * Allows selecting items to offer and adding a message.
 */

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getItems } from "@/lib/api/items";
import { createTrade } from "@/lib/api/trades";
import { useAuthStore } from "@/stores/authStore";
import type { DeliveryMethod, Item } from "@/types/item";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TradeProposalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestedItem: Item; // The item the user wants
}

export function TradeProposalDialog({
  open,
  onOpenChange,
  requestedItem,
}: TradeProposalDialogProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user's available items
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["my-items", user?.id],
    queryFn: () => getItems({ userId: user?.id }),
    enabled: open && !!user?.id,
  });

  const myItems = itemsData?.items || [];

  // Find compatible delivery method between selected item and requested item
  const getCompatibleDeliveryMethod = (
    offeredItem: Item,
  ): DeliveryMethod | null => {
    // Find a delivery method that both items support
    const compatibleMethod = offeredItem.deliveryMethods.find((method) =>
      requestedItem.deliveryMethods.includes(method),
    );
    return compatibleMethod || null;
  };

  const handleSubmit = async () => {
    if (!selectedItemId) {
      toast.error("Please select an item to offer");
      return;
    }

    const offeredItem = myItems.find((item) => item.id === selectedItemId);
    if (!offeredItem) {
      toast.error("Selected item not found");
      return;
    }

    const deliveryMethod = getCompatibleDeliveryMethod(offeredItem);
    if (!deliveryMethod) {
      toast.error(
        "No compatible delivery method between these items. Please choose items with matching delivery options.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createTrade({
        itemOfferedId: selectedItemId,
        itemRequestedId: requestedItem.id,
        deliveryMethod,
        message: message.trim() || undefined,
      });

      toast.success("Trade proposal sent successfully!");
      onOpenChange(false);
      router.push("/trades");
    } catch (error) {
      console.error("Failed to create trade:", error);
      toast.error("Failed to send trade proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Propose Trade</DialogTitle>
          <DialogDescription>
            Select an item from your collection to offer in exchange for{" "}
            <span className="font-semibold">{requestedItem.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requested Item Preview */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">
              You&apos;ll Receive:
            </Label>
            <div className="flex gap-3 items-center">
              <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
                {requestedItem.images?.[0] ? (
                  <Image
                    src={requestedItem.images[0].url}
                    alt={requestedItem.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{requestedItem.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {requestedItem.user?.username}
                </p>
              </div>
            </div>
          </div>

          {/* My Items Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Select Item to Offer:
            </Label>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading your items...</p>
              </div>
            ) : myItems.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-2">
                  You don&apos;t have any items to trade
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/items/new");
                  }}
                >
                  Create an Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {myItems.map((item) => {
                  const isCompatible =
                    getCompatibleDeliveryMethod(item) !== null;
                  const isSelected = selectedItemId === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => isCompatible && setSelectedItemId(item.id)}
                      disabled={!isCompatible}
                      className={`relative flex gap-2 p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : isCompatible
                          ? "border-transparent hover:border-muted-foreground/50"
                          : "border-transparent opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0].url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.condition}
                        </p>
                        {!isCompatible && (
                          <p className="text-xs text-destructive mt-1">
                            Incompatible delivery
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium mb-2 block">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a message to your trade proposal..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-24"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedItemId || isSubmitting || myItems.length === 0}
          >
            {isSubmitting ? "Sending..." : "Send Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
