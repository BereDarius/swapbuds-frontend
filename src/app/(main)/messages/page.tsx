"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getConversations } from "@/lib/api/messages";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function MessagesPage() {
  const [search, setSearch] = useState("");

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 0, // Always consider data stale to ensure fresh data when navigating to this page
    refetchOnMount: "always", // Always refetch when page mounts
  });

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with other traders</p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-6">
            {search
              ? "No conversations match your search"
              : "Start a conversation by messaging a user"}
          </p>
          {!search && (
            <Button asChild>
              <Link href="/trades">Browse Trades</Link>
            </Button>
          )}
        </div>
      )}

      {/* Conversations */}
      {!isLoading && filteredConversations.length > 0 && (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            const otherUser = conversation.otherUser;

            return (
              <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                <Card className="cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={otherUser?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {otherUser?.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">{otherUser?.username}</p>
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(conversation.lastMessageAt),
                                "MMM d, h:mm a",
                              )}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessageContent && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessageContent}
                          </p>
                        )}
                        {conversation.trade && (
                          <Badge variant="outline" className="mt-2">
                            Trade: {conversation.trade.itemOffered.title}
                          </Badge>
                        )}
                      </div>
                      {(conversation.unreadCount ?? 0) > 0 && (
                        <Badge variant="destructive">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
