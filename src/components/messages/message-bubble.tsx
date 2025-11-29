/**
 * MessageBubble Component
 *
 * Displays a single message with edit/delete functionality.
 * Shows "Edited" indicator and handles soft delete display.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { deleteMessage, updateMessage } from "@/lib/api/messages";
import { useAuthStore } from "@/stores/authStore";
import type { Message, MessagesResponse } from "@/types/message";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit2, MoreVertical, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MessageVersionHistory } from "./message-version-history";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  conversationId: string;
}

const MAX_LENGTH = 1000;

export function MessageBubble({
  message,
  isOwn,
  conversationId,
}: MessageBubbleProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const isModerator = user?.role === "ADMIN" || user?.role === "MODERATOR";

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: (content: string) => updateMessage(message.id, { content }),
    onSuccess: (updatedMessage: Message) => {
      toast.success("Message updated");
      setIsEditing(false);
      // Update the message in cache
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        ["messages", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) =>
                m.id === message.id ? { ...m, ...updatedMessage } : m,
              ),
            })),
          };
        },
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update message");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteMessage(message.id),
    onSuccess: () => {
      toast.success("Message deleted");
      setShowDeleteDialog(false);
      // Update the message in cache to show as deleted
      queryClient.setQueryData<InfiniteData<MessagesResponse>>(
        ["messages", conversationId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((m: Message) =>
                m.id === message.id
                  ? {
                      ...m,
                      isDeleted: true,
                      deletedAt: new Date(),
                      content: "[deleted]",
                    }
                  : m,
              ),
            })),
          };
        },
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete message");
    },
  });

  const handleEdit = () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    if (editContent.trim().length === 0) {
      toast.error("Message cannot be empty");
      return;
    }
    if (editContent.length > MAX_LENGTH) {
      toast.error(`Message too long (max ${MAX_LENGTH} characters)`);
      return;
    }
    editMutation.mutate(editContent);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <>
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div
          className={`group relative flex max-w-[70%] gap-3 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatarUrl || undefined} />
            <AvatarFallback>
              {message.sender?.username.slice(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  maxLength={MAX_LENGTH}
                  rows={3}
                  className="resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {editContent.length}/{MAX_LENGTH}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={editMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      disabled={editMutation.isPending}
                    >
                      {editMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`relative rounded-lg p-3 ${
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p
                    className={`whitespace-pre-wrap wrap-break-word ${
                      message.isDeleted ? "italic text-muted-foreground" : ""
                    }`}
                  >
                    {message.isDeleted ? "[deleted]" : message.content}
                  </p>

                  {/* Edit/Delete menu - only for own non-deleted messages */}
                  {isOwn && !message.isDeleted && (
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                          {isModerator && (
                            <DropdownMenuItem
                              onClick={() => setShowVersionHistory(true)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              View History
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(message.createdAt), "h:mm a")}</span>
                  {message.isEdited && !message.isDeleted && (
                    <Badge variant="secondary" className="text-xs">
                      Edited
                    </Badge>
                  )}
                  {isOwn && !message.isDeleted && (
                    <span className="ml-1">
                      {message.isRead ? (
                        <span className="text-blue-500" title="Read">
                          ✓✓
                        </span>
                      ) : (
                        <span title="Sent">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone. The message will be replaced with [deleted].
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version history dialog (moderators only) */}
      {isModerator && (
        <MessageVersionHistory
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          messageId={message.id}
          currentContent={message.content}
        />
      )}
    </>
  );
}
