"use client";

import { MessageBubble } from "@/components/messages/message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversations,
  getMessages,
  markConversationAsRead,
  sendMessage,
} from "@/lib/api/messages";
import { useAuthStore } from "@/stores/authStore";
import type { Message } from "@/types/message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ConversationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const conversationId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversation details
  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const conversation = conversations?.find((c) => c.id === conversationId);

  // Get messages
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversation,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Mark messages as read
  useEffect(() => {
    if (conversation && messagesData?.messages) {
      markConversationAsRead(conversationId);
    }
  }, [conversation, conversationId, messagesData?.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !conversation?.otherUser) return;

    sendMessageMutation.mutate({
      recipientId: conversation.otherUser.id,
      content: messageText.trim(),
      tradeId: conversation.tradeId || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (conversationsLoading || messagesLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (conversationsError || messagesError || !conversation) {
    if (!conversation) {
      notFound();
    }
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Failed to load conversation
            </h3>
            <p className="text-muted-foreground mb-6">
              {conversationsError instanceof Error
                ? conversationsError.message
                : messagesError instanceof Error
                ? messagesError.message
                : "An error occurred"}
            </p>
            <Button onClick={() => router.push("/messages")}>
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { otherUser, trade } = conversation;
  const messages = messagesData?.messages || [];

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser?.avatarUrl || undefined} />
              <AvatarFallback>
                {otherUser?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="font-semibold">{otherUser?.username}</h2>
              {!otherUser?.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>

            {otherUser && (
              <Button variant="outline" asChild>
                <Link href={`/profile/${otherUser.username}`}>
                  View Profile
                </Link>
              </Button>
            )}
          </div>

          {/* Trade Context */}
          {trade && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Trade Context</Badge>
                <Badge>{trade.status}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {trade.itemOffered.title} ⇄ {trade.itemRequested.title}
                </span>
                <Link
                  href={`/trades/${trade.id}`}
                  className="text-primary hover:underline ml-auto"
                >
                  View Trade
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="mb-4">
        <CardContent className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Start the conversation by sending a message below
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .slice()
                .reverse()
                .map((message: Message, index: number, arr: Message[]) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const prevMessage = arr[index - 1];
                  const showAvatar =
                    !prevMessage || prevMessage.senderId !== message.senderId;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                    />
                  );
                })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-20 resize-none"
              maxLength={5000}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {messageText.length}/5000 characters
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
