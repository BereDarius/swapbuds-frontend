"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Conversation } from "@/types/message";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ConversationCardProps {
  conversation: Conversation;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const { otherUser, lastMessageContent, lastMessageAt, unreadCount, trade } =
    conversation;

  if (!otherUser) {
    return null;
  }

  const timeAgo = lastMessageAt
    ? formatDistanceToNow(new Date(lastMessageAt), { addSuffix: true })
    : null;

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatarUrl || undefined} />
              <AvatarFallback>
                {otherUser.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Message Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">
                    {otherUser.username}
                  </h3>
                  {!otherUser.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                {timeAgo && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo}
                  </span>
                )}
              </div>

              {/* Last Message Preview */}
              {lastMessageContent && (
                <p
                  className={`text-sm text-muted-foreground truncate ${
                    unreadCount && unreadCount > 0 ? "font-medium" : ""
                  }`}
                >
                  {lastMessageContent}
                </p>
              )}

              {/* Trade Context */}
              {trade && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Trade: {trade.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {trade.itemOffered.title} ⇄ {trade.itemRequested.title}
                  </span>
                </div>
              )}

              {/* Unread Count */}
              {unreadCount && unreadCount > 0 && (
                <div className="mt-2">
                  <Badge className="text-xs">{unreadCount} new</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
