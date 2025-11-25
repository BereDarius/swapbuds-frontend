"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getConversation,
  getMessages,
  markConversationAsRead,
  sendMessage,
} from "@/lib/api/messages";
import { useMessagesSocket } from "@/lib/socket/messages";
import { useAuthStore } from "@/stores/authStore";
import type { Message } from "@/types/message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ConversationPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const conversationId = params.id as string;
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hooks
  const {
    isConnected,
    onMessage,
    onMessageRead,
    onTyping,
    emitTyping,
    joinConversation,
    leaveConversation,
  } = useMessagesSocket();

  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversation(conversationId),
    enabled: !!conversationId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    // Remove polling - using WebSocket for real-time updates
  });

  const sendMutation = useMutation({
    mutationFn: (data: { recipientId: string; content: string }) =>
      sendMessage(data),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Join conversation room when page loads
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected, joinConversation, leaveConversation]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    const unsubscribe = onMessage((newMessage) => {
      // Only add messages for this conversation
      if (newMessage.conversationId === conversationId) {
        queryClient.setQueryData<{ messages: Message[] }>(
          ["messages", conversationId],
          (old) => {
            if (!old) return { messages: [newMessage] };
            // Avoid duplicates
            const exists = old.messages.some((m) => m.id === newMessage.id);
            if (exists) return old;
            return {
              messages: [...old.messages, newMessage],
            };
          },
        );
        // Scroll to bottom
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onMessage, queryClient]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubscribe = onTyping((data) => {
      if (data.conversationId === conversationId) {
        if (data.isTyping) {
          setTypingUser(data.typerUsername);
        } else {
          setTypingUser(null);
        }
      }
    });
    return unsubscribe;
  }, [conversationId, onTyping]);

  // Listen for message read events
  useEffect(() => {
    const unsubscribe = onMessageRead((data) => {
      if (data.conversationId === conversationId) {
        // Update message read status in cache
        queryClient.setQueryData<{ messages: Message[] }>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            return {
              messages: old.messages.map((m) =>
                m.id === data.messageId
                  ? { ...m, isRead: true, readAt: new Date() }
                  : m,
              ),
            };
          },
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onMessageRead, queryClient]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId && messagesData?.messages) {
      // Check if there are unread messages from other user
      const hasUnreadMessages = messagesData.messages.some(
        (msg) => !msg.isRead && msg.sender?.id !== user?.id,
      );

      if (hasUnreadMessages) {
        // Mark all messages in conversation as read
        markConversationAsRead(conversationId).catch(() => {
          // Silently fail - not critical
        });
      }
    }
  }, [conversationId, messagesData?.messages, user?.id]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData?.messages]);

  // Handle typing indicator with debounce
  const handleTyping = () => {
    if (!conversationId || !user?.username) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing started
    emitTyping(conversationId, true, user.username);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, false, user.username);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversation?.otherUser?.id) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping(conversationId, false, user?.username || "");

    sendMutation.mutate({
      recipientId: conversation.otherUser.id,
      content: message,
    });
  };

  const isLoading = conversationLoading || messagesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">Conversation not found</h2>
        <Button asChild>
          <Link href="/messages">Back to Messages</Link>
        </Button>
      </div>
    );
  }

  const otherUser = conversation?.otherUser;
  const messages = messagesData?.messages || [];

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 py-4">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar>
              <AvatarImage src={otherUser?.avatarUrl || undefined} />
              <AvatarFallback>
                {otherUser?.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link
                href={`/profile/${otherUser?.username}`}
                className="font-semibold hover:underline"
              >
                {otherUser?.username}
              </Link>
              {conversation.trade && (
                <p className="text-xs text-muted-foreground">
                  Trade: {conversation.trade.itemOffered.title}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="mb-4 flex-1 overflow-hidden">
        <CardContent className="flex h-full flex-col overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  Start the conversation below
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: Message) => {
                const isOwn = msg.sender?.id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[70%] gap-3 ${
                        isOwn ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {msg.sender?.username.slice(0, 2).toUpperCase() ||
                            "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap wrap-break-word">
                            {msg.content}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                          {isOwn && (
                            <span className="ml-1">
                              {msg.isRead ? (
                                <span className="text-blue-500" title="Read">
                                  ✓✓
                                </span>
                              ) : (
                                <span title="Sent">✓</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Typing indicator */}
              {typingUser && (
                <div className="flex justify-start">
                  <div className="flex max-w-[70%] gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={otherUser?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {otherUser?.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              disabled={sendMutation.isPending || !isConnected}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                sendMutation.isPending || !message.trim() || !isConnected
              }
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          {!isConnected && (
            <p className="mt-2 text-xs text-muted-foreground">
              Connecting to chat...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
