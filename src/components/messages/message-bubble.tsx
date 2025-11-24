"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/types/message";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
}: MessageBubbleProps) {
  const { content, sender, createdAt, isRead } = message;
  const timestamp = format(new Date(createdAt), "HH:mm");

  return (
    <div
      className={`flex gap-2 mb-4 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      {showAvatar && sender ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender.avatarUrl || undefined} />
          <AvatarFallback>
            {sender.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Message Bubble */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {/* Sender Name (for other user's messages) */}
        {!isOwnMessage && sender && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {sender.username}
          </span>
        )}

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap wrap-break-word">
            {content}
          </p>
        </div>

        {/* Timestamp and Read Status */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isOwnMessage && (
            <span className="text-muted-foreground">
              {isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
