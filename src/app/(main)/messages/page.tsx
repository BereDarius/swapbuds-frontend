"use client";

import { ConversationCard } from "@/components/messages/conversation-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getConversations, sendMessage } from "@/lib/api/messages";
import { useSocket } from "@/lib/socket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Search, Send } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onMessage, onConversationRead } = useSocket();

  // Get compose parameters from URL
  const compose = searchParams.get("compose") === "true";
  const recipientId = searchParams.get("recipientId");
  const recipientUsername = searchParams.get("recipientUsername");

  const [showComposeDialog, setShowComposeDialog] = useState(
    compose && !!recipientId,
  );

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  // WebSocket: Listen for new messages to update conversation list
  useEffect(() => {
    const cleanup = onMessage(() => {
      // Refresh conversations list when any message is received
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    return cleanup;
  }, [onMessage, queryClient]);

  // WebSocket: Listen for conversation read updates
  useEffect(() => {
    const cleanup = onConversationRead(() => {
      // Refresh conversations list when messages are marked as read
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    return cleanup;
  }, [onConversationRead, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: async (data) => {
      toast.success("Message sent!");
      setMessageText("");
      setShowComposeDialog(false);
      // Refetch conversations to ensure new conversation is in cache before navigating
      await queryClient.refetchQueries({ queryKey: ["conversations"] });
      router.push(`/messages/${data.conversationId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !recipientId) return;

    sendMessageMutation.mutate({
      recipientId,
      content: messageText.trim(),
      type: "text",
    });
  };

  // Filter conversations based on search query
  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return conv.otherUser?.username.toLowerCase().includes(query);
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load conversations
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "An error occurred while loading your messages"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Compose Message Dialog */}
      <Dialog
        open={showComposeDialog}
        onOpenChange={(open) => {
          setShowComposeDialog(open);
          if (!open) {
            // Clear URL params when dialog closes
            router.push("/messages");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send message to @{recipientUsername || "user"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowComposeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessageMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            View and manage your conversations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        {!filteredConversations || filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try searching with a different username"
                  : "Start a conversation by messaging a user from a trade or their profile"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/trades">Browse Trades</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
