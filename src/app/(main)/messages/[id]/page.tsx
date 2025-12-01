"use client";

import { MessageBubble } from "@/components/messages";
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
import type { Message, MessagesResponse } from "@/types/message";
import type { InfiniteData } from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function ConversationPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const conversationId = params.id as string;
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const previousScrollHeightRef = useRef<number>(0);

  // WebSocket hooks
  const {
    isConnected,
    onMessage,
    onMessageRead,
    onConversationRead,
    onMessageUpdated,
    onMessageDeleted,
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

  // Use infinite query for pagination
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam = 1 }) =>
      getMessages(conversationId, { page: pageParam, limit: 20 }),
    enabled: !!conversationId,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (sum, page) => sum + page.messages.length,
        0
      );
      return totalFetched < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 0, // Always consider data stale to ensure fresh messages
    refetchOnMount: "always", // Always refetch when page mounts to show latest messages
  });

  // Flatten all messages from pages using useMemo
  // Backend returns messages in DESC order (newest first), but we need ASC (oldest first) for chat
  const allMessages = React.useMemo(
    () => messagesData?.pages.flatMap((page) => page.messages).reverse() || [],
    [messagesData]
  );

  const sendMutation = useMutation({
    mutationFn: (data: { recipientId: string; content: string }) => {
      return sendMessage(data);
    },
    onSuccess: (newMessage) => {
      console.log("✅ Message sent, adding to cache:", newMessage.id);
      setMessage("");
      setShouldScrollToBottom(true);
      // Add the new message to the last page
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        ["messages", conversationId],
        (old) => {
          if (!old) return old;
          const pages = [...old.pages];
          const lastPage = pages[pages.length - 1];
          // Prepend to array since backend stores in desc order (newest first)
          pages[pages.length - 1] = {
            ...lastPage,
            messages: [newMessage, ...lastPage.messages],
            total: lastPage.total + 1,
          };
          return { ...old, pages };
        }
      );
      // Invalidate conversations list so new conversation appears
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Invalidate conversation metadata in case it was created
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: ["messages", "unread-count"],
      });
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
    console.log(
      "🎧 Setting up message listener for conversation:",
      conversationId
    );
    const unsubscribe = onMessage((newMessage) => {
      console.log("📨 Message received via socket:", {
        messageId: newMessage.id,
        conversationId: newMessage.conversationId,
        content: newMessage.content?.substring(0, 20),
        expectedConversationId: conversationId,
        matches: newMessage.conversationId === conversationId,
      });
      // Only add messages for this conversation
      if (newMessage.conversationId === conversationId) {
        setShouldScrollToBottom(true);
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            const pages = [...old.pages];
            const lastPage = pages[pages.length - 1];
            // Avoid duplicates
            const exists = lastPage.messages.some(
              (m: Message) => m.id === newMessage.id
            );
            if (exists) return old;
            // Prepend to array since backend stores in desc order (newest first)
            pages[pages.length - 1] = {
              ...lastPage,
              messages: [newMessage, ...lastPage.messages],
              total: lastPage.total + 1,
            };
            return { ...old, pages };
          }
        );
        // Scroll to bottom of messages container
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
    });
    return unsubscribe;
  }, [conversationId, onMessage, queryClient, isConnected]);

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

  // Listen for message read events (individual message)
  useEffect(() => {
    const unsubscribe = onMessageRead((data) => {
      if (data.conversationId === conversationId) {
        // Update message read status in cache
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) =>
                m.id === data.messageId
                  ? { ...m, isRead: true, readAt: new Date() }
                  : m
              ),
            }));
            return { ...old, pages };
          }
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onMessageRead, queryClient]);

  // Listen for conversation read events (all messages marked as read)
  useEffect(() => {
    console.log("[ConversationPage] Setting up conversationRead listener");
    const unsubscribe = onConversationRead((data) => {
      console.log("[ConversationPage] Received conversationRead event:", data);
      if (data.conversationId === conversationId) {
        console.log(
          "[ConversationPage] Marking all messages as read in conversation:",
          conversationId
        );
        // Mark ALL messages in the conversation as read
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) => ({
                ...m,
                isRead: true,
                readAt: new Date(),
              })),
            }));
            return { ...old, pages };
          }
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onConversationRead, queryClient]);

  // Listen for message updated events
  useEffect(() => {
    const unsubscribe = onMessageUpdated((updatedMessage) => {
      if (updatedMessage.conversationId === conversationId) {
        // Update the message in cache
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) =>
                m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
              ),
            }));
            return { ...old, pages };
          }
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onMessageUpdated, queryClient]);

  // Listen for message deleted events
  useEffect(() => {
    const unsubscribe = onMessageDeleted((data) => {
      if (data.conversationId === conversationId) {
        // Mark message as deleted in cache
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          ["messages", conversationId],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) =>
                m.id === data.messageId
                  ? {
                      ...m,
                      isDeleted: true,
                      deletedAt: new Date(),
                      content: "[deleted]",
                    }
                  : m
              ),
            }));
            return { ...old, pages };
          }
        );
      }
    });
    return unsubscribe;
  }, [conversationId, onMessageDeleted, queryClient]);

  // Mark messages as read when conversation opens
  // Only mark messages that were SENT TO the current user (recipient is current user)
  useEffect(() => {
    if (conversationId && allMessages.length > 0 && user?.id) {
      // Check if there are unread messages where current user is the recipient
      // (i.e., messages sent by the other user)
      const hasUnreadMessagesToMe = allMessages.some(
        (msg) => !msg.isRead && msg.senderId !== user.id
      );

      if (hasUnreadMessagesToMe) {
        // Mark all messages in conversation as read (for current user)
        markConversationAsRead(conversationId)
          .then(() => {
            // Invalidate the global unread count to update navbar badge
            queryClient.invalidateQueries({
              queryKey: ["messages", "unread-count"],
            });
          })
          .catch(() => {
            // Silently fail - not critical
          });
      }
    }
  }, [conversationId, allMessages, user?.id, queryClient]);

  // Handle scroll to detect when user scrolls to top for infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop } = container;

      // Load more messages when scrolled near the top
      if (scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
        previousScrollHeightRef.current = container.scrollHeight;
        fetchNextPage();
      }

      // Disable auto-scroll if user manually scrolls up
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      setShouldScrollToBottom(isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-scroll when messages change (only if user is at bottom)
  useEffect(() => {
    if (messagesContainerRef.current && shouldScrollToBottom) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [allMessages, shouldScrollToBottom]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (isFetchingNextPage || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const newScrollHeight = container.scrollHeight;
    const scrollDiff = newScrollHeight - previousScrollHeightRef.current;

    if (scrollDiff > 0) {
      container.scrollTop += scrollDiff;
    }
  }, [isFetchingNextPage]);

  // Initial scroll to bottom when messages first load
  useEffect(() => {
    if (allMessages.length > 0 && messagesContainerRef.current) {
      // Use instant scroll for initial load
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages.length > 0]);

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

    // Determine the recipient ID (other user in conversation)
    // First try conversation.otherUser.id, then conversation.user1/user2Id,
    // then fall back to finding the other sender from messages
    let recipientId =
      conversation?.otherUser?.id ||
      (user?.id === conversation?.user1Id
        ? conversation?.user2Id
        : conversation?.user1Id);

    // Fallback: if still no recipient, find it from ANY message from the other user
    if (!recipientId && allMessages.length > 0) {
      // Search through all messages to find one from the other user
      const otherUserMessage = allMessages.find(
        (msg) =>
          msg.senderId !== user?.id ||
          (msg.sender?.id && msg.sender.id !== user?.id)
      );

      if (otherUserMessage) {
        recipientId = otherUserMessage.sender?.id || otherUserMessage.senderId;
      }
    }

    if (!message.trim() || !recipientId) {
      return;
    }

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping(conversationId, false, user?.username || "");

    sendMutation.mutate({
      recipientId,
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
        <CardContent
          ref={messagesContainerRef}
          className="flex h-full flex-col overflow-y-auto p-4"
        >
          {allMessages.length === 0 ? (
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
              {/* Loading older messages indicator */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {allMessages.map((msg: Message) => {
                const isOwn = msg.sender?.id === user?.id;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={isOwn}
                    conversationId={conversationId}
                  />
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  let recipientId =
                    conversation?.otherUser?.id ||
                    (user?.id === conversation?.user1Id
                      ? conversation?.user2Id
                      : conversation?.user1Id);

                  // Fallback: find recipient from any message from the other user
                  if (!recipientId && allMessages.length > 0) {
                    const otherUserMessage = allMessages.find(
                      (msg) =>
                        msg.senderId !== user?.id ||
                        (msg.sender?.id && msg.sender.id !== user?.id)
                    );
                    if (otherUserMessage) {
                      recipientId =
                        otherUserMessage.sender?.id ||
                        otherUserMessage.senderId;
                    }
                  }

                  if (
                    message.trim() &&
                    !sendMutation.isPending &&
                    recipientId
                  ) {
                    // Stop typing indicator
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current);
                    }
                    emitTyping(conversationId, false, user?.username || "");

                    // Send message
                    sendMutation.mutate({
                      recipientId,
                      content: message,
                    });
                  }
                }
              }}
              placeholder="Type a message..."
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
