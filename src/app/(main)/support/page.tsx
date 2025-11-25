"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupportChat, getMySupportChats } from "@/lib/api/support";
import type { CreateChatDto, SupportChat } from "@/types/support";
import { SupportChatStatus, SupportPriority } from "@/types/support";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

const STATUS_COLORS = {
  [SupportChatStatus.OPEN]: "bg-yellow-100 text-yellow-800",
  [SupportChatStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [SupportChatStatus.WAITING]: "bg-purple-100 text-purple-800",
  [SupportChatStatus.RESOLVED]: "bg-green-100 text-green-800",
  [SupportChatStatus.CLOSED]: "bg-gray-100 text-gray-800",
};

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateChatDto>({
    subject: "",
    priority: SupportPriority.MEDIUM,
    initialMessage: "",
  });

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["support-chats"],
    queryFn: getMySupportChats,
  });

  const createChatMutation = useMutation({
    mutationFn: createSupportChat,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["support-chats"] });
      setIsDialogOpen(false);
      setFormData({
        subject: "",
        priority: SupportPriority.MEDIUM,
        initialMessage: "",
      });
      toast.success("Support chat created successfully");
      // Navigate to the new chat
      window.location.href = `/support/${newChat.id}`;
    },
    onError: () => {
      toast.error("Failed to create support chat");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.initialMessage.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    createChatMutation.mutate(formData);
  };

  const activeChats = chats.filter(
    (chat) =>
      chat.status !== SupportChatStatus.RESOLVED &&
      chat.status !== SupportChatStatus.CLOSED,
  );
  const resolvedChats = chats.filter(
    (chat) =>
      chat.status === SupportChatStatus.RESOLVED ||
      chat.status === SupportChatStatus.CLOSED,
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support</h1>
          <p className="text-muted-foreground">
            Get help from our support team
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Support Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Start a Support Chat</DialogTitle>
              <DialogDescription>
                Tell us what you need help with and we&apos;ll connect you with
                a support agent.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as SupportPriority,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="initialMessage">Message *</Label>
                <Textarea
                  id="initialMessage"
                  placeholder="Describe your issue in detail..."
                  value={formData.initialMessage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      initialMessage: e.target.value,
                    })
                  }
                  rows={5}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createChatMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createChatMutation.isPending}>
                  {createChatMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Start Chat"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && chats.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Support Chats Yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Start a chat to get help from our support team
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Start Your First Chat
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Chats */}
      {!isLoading && activeChats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Chats</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Chats */}
      {!isLoading && resolvedChats.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resolved Chats</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {resolvedChats.map((chat) => (
              <ChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatCard({ chat }: { chat: SupportChat }) {
  return (
    <Link href={`/support/${chat.id}`}>
      <Card className="cursor-pointer transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-base line-clamp-1">
              {chat.subject}
            </CardTitle>
            <div className="flex gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  PRIORITY_COLORS[chat.priority]
                }`}
              >
                {PRIORITY_LABELS[chat.priority]}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  STATUS_COLORS[chat.status]
                }`}
              >
                {STATUS_LABELS[chat.status]}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Created: {format(new Date(chat.createdAt), "MMM d, yyyy")}</p>
            {chat.assignedTo && <p>Assigned to: {chat.assignedTo}</p>}
            {chat.messages && chat.messages.length > 0 && (
              <p className="mt-2 line-clamp-2">
                {chat.messages[chat.messages.length - 1]?.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
