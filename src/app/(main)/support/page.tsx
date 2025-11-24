/**
 * Support Tickets List Page
 *
 * Displays all user's support tickets with status and priority
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMySupportChats } from "@/lib/api/support";
import { SupportChatStatus, SupportPriority } from "@/types/support";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support", "chats"],
    queryFn: getMySupportChats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your support requests
          </p>
        </div>
        <Link href="/support/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      {!tickets || tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Support Tickets</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven&apos;t created any support tickets yet. If you need
              help, create a new ticket and our team will assist you.
            </p>
            <Link href="/support/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 truncate">
                        {ticket.subject}
                      </CardTitle>
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
                        <span className="text-sm text-muted-foreground">
                          {ticket.messages.length}{" "}
                          {ticket.messages.length === 1
                            ? "message"
                            : "messages"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      <div>
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </div>
                      <div>{format(new Date(ticket.createdAt), "h:mm a")}</div>
                    </div>
                  </div>
                </CardHeader>
                {ticket.messages.length > 0 && (
                  <>
                    <Separator />
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.messages[ticket.messages.length - 1].message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated:{" "}
                        {format(new Date(ticket.updatedAt), "PPp")}
                      </p>
                    </CardContent>
                  </>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
