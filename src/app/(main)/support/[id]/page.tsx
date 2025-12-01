"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  closeSupportChat,
  getSupportChatById,
  sendSupportMessage,
} from "@/lib/api/support";
import { useSupportSocket } from "@/lib/socket/support";
import { useAuthStore } from "@/stores/authStore";
import type { SupportMessage } from "@/types/support";
import { SupportChatStatus, SupportPriority } from "@/types/support";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PRIORITY_LABELS = {
  [SupportPriority.LOW]: "Low",
  [SupportPriority.MEDIUM]: "Medium",
  [SupportPriority.HIGH]: "High",
  [SupportPriority.URGENT]: "Urgent",
};

const PRIORITY_COLORS = {
  [SupportPriority.LOW]: "bg-gray-100 text-gray-800",
  [SupportPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [SupportPriority.HIGH]: "bg-orange-100 text-orange-800",
  [SupportPriority.URGENT]: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  [SupportChatStatus.OPEN]: "Open",
  [SupportChatStatus.IN_PROGRESS]: "In Progress",
  [SupportChatStatus.WAITING]: "Waiting",
  [SupportChatStatus.RESOLVED]: "Resolved",
  [SupportChatStatus.CLOSED]: "Closed",
};

export default function SupportChatPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hooks
  const {
    isConnected: isSupportConnected,
    onNewMessage,
    onUserTyping,
    onChatAssigned,
    onChatResolved,
    onChatClosed,
    emitTyping,
    joinChat,
    leaveChat,
  } = useSupportSocket();

  const { data: chat, isLoading } = useQuery({
    queryKey: ["support-chat", chatId],
    queryFn: () => getSupportChatById(chatId),
    enabled: !!chatId,
    staleTime: 0, // Always consider stale
    refetchOnMount: "always", // Always refetch
  });

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendSupportMessage(chatId, { message }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["support-chat", chatId],
      });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const closeChatMutation = useMutation({
    mutationFn: () => closeSupportChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["support-chat", chatId],
      });
      toast.success("Chat closed successfully");
    },
    onError: () => {
      toast.error("Failed to close chat");
    },
  });

  // Join chat room when page loads
  useEffect(() => {
    if (chatId && isSupportConnected) {
      joinChat(chatId);
      return () => {
        leaveChat(chatId);
      };
    }
  }, [chatId, isSupportConnected, joinChat, leaveChat]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    const unsubscribe = onNewMessage((data) => {
      if (data.chatId === chatId) {
        queryClient.setQueryData<{ messages?: SupportMessage[] }>(
          ["support-chat", chatId],
          (old) => {
            if (!old) return old;
            const exists = old.messages?.some((m) => m.id === data.message.id);
            if (exists) return old;
            return {
              ...old,
              messages: [...(old.messages || []), data.message],
            };
          }
        );
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    });
    return unsubscribe;
  }, [chatId, onNewMessage, queryClient]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubscribe = onUserTyping((data) => {
      if (data.chatId === chatId) {
        setTypingAgent(data.username);
        // Clear typing after 3 seconds
        setTimeout(() => setTypingAgent(null), 3000);
      }
    });
    return unsubscribe;
  }, [chatId, onUserTyping]);

  // Listen for chat assigned events
  useEffect(() => {
    const unsubscribe = onChatAssigned((data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ["support-chat", chatId] });
        toast.success("An agent has been assigned to your chat");
      }
    });
    return unsubscribe;
  }, [chatId, onChatAssigned, queryClient]);

  // Listen for chat resolved events
  useEffect(() => {
    const unsubscribe = onChatResolved((data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ["support-chat", chatId] });
        toast.info("This chat has been resolved");
      }
    });
    return unsubscribe;
  }, [chatId, onChatResolved, queryClient]);

  // Listen for chat closed events
  useEffect(() => {
    const unsubscribe = onChatClosed((data) => {
      if (data.chatId === chatId) {
        queryClient.invalidateQueries({ queryKey: ["support-chat", chatId] });
        toast.info("This chat has been closed");
      }
    });
    return unsubscribe;
  }, [chatId, onChatClosed, queryClient]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chat?.messages]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if (
      chat?.messages &&
      chat.messages.length > 0 &&
      messagesContainerRef.current
    ) {
      // Use instant scroll for initial load
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?.messages?.length]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!chatId || !user?.username) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    emitTyping(chatId, user.username);

    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing after 2 seconds
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    sendMutation.mutate(message);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">Chat not found</h2>
        <Button asChild>
          <Link href="/support">Back to Support</Link>
        </Button>
      </div>
    );
  }

  const isClosed =
    chat.status === SupportChatStatus.CLOSED ||
    chat.status === SupportChatStatus.RESOLVED;
  const messages = chat.messages || [];

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 py-4">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/support">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">{chat.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      PRIORITY_COLORS[chat.priority]
                    }`}
                  >
                    {PRIORITY_LABELS[chat.priority]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABELS[chat.status]}
                  </span>
                  {chat.assignedTo && (
                    <span className="text-xs text-muted-foreground">
                      • Agent: {chat.assignedTo}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {!isClosed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => closeChatMutation.mutate()}
                disabled={closeChatMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Close Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="mb-4 flex-1 overflow-hidden">
        <CardContent
          ref={messagesContainerRef}
          className="flex h-full flex-col overflow-y-auto p-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground">
                  A support agent will respond shortly
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                const isAgent = !isOwn && msg.sender?.role !== "USER";

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
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          {isAgent
                            ? "SA"
                            : msg.sender?.username?.slice(0, 2).toUpperCase() ||
                              "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`rounded-lg p-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : isAgent
                                ? "bg-blue-50 text-blue-900"
                                : "bg-muted"
                          }`}
                        >
                          {isAgent && (
                            <p className="text-xs font-semibold mb-1">
                              {msg.sender?.username || "Support Agent"}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap wrap-break-word">
                            {msg.message}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Typing indicator */}
              {typingAgent && (
                <div className="flex justify-start">
                  <div className="flex max-w-[70%] gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SA</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
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
          {isClosed ? (
            <p className="text-center text-sm text-muted-foreground">
              This chat has been {chat.status.toLowerCase()}. You can start a
              new chat if you need further assistance.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim() && !sendMutation.isPending) {
                        // Stop typing indicator
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }

                        // Send message
                        sendMutation.mutate(message);
                      }
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={sendMutation.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sendMutation.isPending || !message.trim()}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              {!isSupportConnected && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Connecting to support chat...
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
