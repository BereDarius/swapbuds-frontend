/**
 * Support Ticket Detail Page (Live Chat)
 *
 * Real-time chat interface for support tickets with WebSocket support
 */

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getSupportChatById, sendSupportMessage } from "@/lib/api/support";
import { getErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { useSupportSocket } from "@/lib/socket/support";
import { useAuthStore } from "@/stores/authStore";
import {
  SupportChatStatus,
  SupportPriority,
  type SupportMessage,
} from "@/types/support";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function SupportTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState<string | null>(null);

  const {
    joinChat,
    leaveChat,
    emitTyping,
    onNewMessage,
    onUserTyping,
    isConnected: isSupportConnected,
  } = useSupportSocket();

  // Fetch ticket details
  const { data: ticket, isLoading } = useQuery({
    queryKey: ["support", "chat", ticketId],
    queryFn: () => getSupportChatById(ticketId),
    enabled: !!ticketId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText: string) =>
      sendSupportMessage(ticketId, { message: messageText }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["support", "chat", ticketId],
      });
    },
    onError: (error) => {
      logger.apiError("POST", `/support/chats/${ticketId}/messages`, error);
      const errorMessage = getErrorMessage(error, "Failed to send message");
      toast.error("Failed to send message", { description: errorMessage });
    },
  });

  // Join chat on mount
  useEffect(() => {
    if (ticketId && isSupportConnected) {
      joinChat(ticketId);
      return () => {
        leaveChat(ticketId);
      };
    }
  }, [ticketId, joinChat, leaveChat, isSupportConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = onNewMessage((data) => {
      if (data.chatId === ticketId) {
        queryClient.invalidateQueries({
          queryKey: ["support", "chat", ticketId],
        });
      }
    });

    return unsubscribe;
  }, [ticketId, onNewMessage, queryClient]);

  // Listen for typing indicators
  useEffect(() => {
    if (!ticketId) return;

    const unsubscribe = onUserTyping((data) => {
      if (data.chatId === ticketId) {
        setIsTyping(data.username);
        setTimeout(() => setIsTyping(null), 3000);
      }
    });

    return unsubscribe;
  }, [ticketId, onUserTyping]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (user && isSupportConnected) {
      emitTyping(ticketId, user.username);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    await sendMessageMutation.mutateAsync(message.trim());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              This support ticket does not exist or you do not have access to
              it.
            </p>
            <Link href="/support">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: SupportChatStatus) => {
    switch (status) {
      case SupportChatStatus.OPEN:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case SupportChatStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case SupportChatStatus.WAITING:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case SupportChatStatus.RESOLVED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case SupportChatStatus.CLOSED:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: SupportPriority) => {
    switch (priority) {
      case SupportPriority.LOW:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case SupportPriority.MEDIUM:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case SupportPriority.HIGH:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case SupportPriority.URGENT:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: SupportChatStatus) => {
    switch (status) {
      case SupportChatStatus.OPEN:
        return <Clock className="h-4 w-4" />;
      case SupportChatStatus.IN_PROGRESS:
        return <MessageSquare className="h-4 w-4" />;
      case SupportChatStatus.WAITING:
        return <AlertCircle className="h-4 w-4" />;
      case SupportChatStatus.RESOLVED:
        return <CheckCircle2 className="h-4 w-4" />;
      case SupportChatStatus.CLOSED:
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isActive =
    ticket.status === SupportChatStatus.OPEN ||
    ticket.status === SupportChatStatus.IN_PROGRESS ||
    ticket.status === SupportChatStatus.WAITING;

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/support">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      {/* Ticket Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-3">{ticket.subject}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={getStatusColor(ticket.status)}
                >
                  {getStatusIcon(ticket.status)}
                  <span className="ml-1">
                    {ticket.status.replace("_", " ")}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={getPriorityColor(ticket.priority)}
                >
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
              <div>Created</div>
              <div>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</div>
              <div>{format(new Date(ticket.createdAt), "h:mm a")}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-6">
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {ticket.messages.map((msg: SupportMessage) => {
              const isUser = msg.authorId === user?.id;
              const isSupport = msg.author.role !== "USER";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {isSupport
                        ? "S"
                        : msg.author.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 max-w-[70%] ${
                      isUser ? "text-right" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isUser ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                          <span className="text-sm font-medium">You</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium">
                            {isSupport ? "Support Team" : msg.author.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <p className="text-sm text-muted-foreground italic">
                    {isTyping} is typing...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      {isActive && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {!isSupportConnected && (
              <p className="text-xs text-muted-foreground mt-2">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Real-time chat unavailable. Messages will still be delivered.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolution Message */}
      {ticket.status === SupportChatStatus.RESOLVED && ticket.resolution && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Ticket Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{ticket.resolution}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Resolved on {format(new Date(ticket.resolvedAt!), "PPp")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
