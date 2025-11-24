/**
 * TradeCard Component
 *
 * Displays a trade summary card in list views.
 * Shows both items, participants, status, and timestamp.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { TRADE_STATUS_INFO, type Trade } from "@/types/trade";
import { ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TradeCardProps {
  trade: Trade;
}

export function TradeCard({ trade }: TradeCardProps) {
  const { user } = useAuthStore();

  // Determine if current user is proposer or responder
  const isProposer = user?.id === trade.proposer.id;
  const otherUser = isProposer ? trade.responder : trade.proposer;
  const direction = isProposer ? "Sent" : "Received";

  // Get status info
  const statusInfo = TRADE_STATUS_INFO[trade.status];
  const statusColor = {
    yellow:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    green:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    gray: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  }[statusInfo.color];

  // Get items (support both single and multi-item trades)
  const offeredItems =
    trade.itemsOffered || (trade.itemOffered ? [trade.itemOffered] : []);
  const requestedItems =
    trade.itemsRequested || (trade.itemRequested ? [trade.itemRequested] : []);

  return (
    <Link href={`/trades/${trade.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Header: Status and Direction */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={statusColor}>
                  {statusInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {direction}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(trade.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Trade Items */}
            <div className="flex items-center gap-4">
              {/* Offered Items */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {isProposer ? "You offer:" : "They offer:"}
                </p>
                <div className="flex gap-2">
                  {offeredItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-16 rounded-md overflow-hidden bg-muted"
                    >
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {offeredItems.length > 3 && (
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-muted text-sm font-medium">
                      +{offeredItems.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Requested Items */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {isProposer ? "You get:" : "They get:"}
                </p>
                <div className="flex gap-2">
                  {requestedItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-16 w-16 rounded-md overflow-hidden bg-muted"
                    >
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {requestedItems.length > 3 && (
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-muted text-sm font-medium">
                      +{requestedItems.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Other User Info */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUser.avatarUrl || undefined} />
                <AvatarFallback>
                  {otherUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{otherUser.username}</p>
                <p className="text-xs text-muted-foreground">
                  {otherUser.isVerified && "✓ "}
                  Reputation: {otherUser.reputationScore.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
