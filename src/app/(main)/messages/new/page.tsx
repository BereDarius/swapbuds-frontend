"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getConversations, sendMessage } from "@/lib/api/messages";
import { useVerification } from "@/lib/hooks/useVerification";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  const [message, setMessage] = useState("");
  const { requireVerification } = useVerification();

  // Check if conversation already exists
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const existingConversation = conversations.find(
    (conv) => conv.otherUser?.id === userId,
  );

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        recipientId: userId!,
        content,
        type: "text",
      }),
    onSuccess: () => {
      toast.success("Message sent!");
      // Navigate to the conversation
      router.push(`/messages`);
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Check verification before sending message
    if (!requireVerification("send messages")) {
      return;
    }

    sendMessageMutation.mutate(message);
  };

  if (!userId || !username) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">Invalid Request</h2>
        <p className="mb-4 text-muted-foreground">
          Missing user information to start a conversation.
        </p>
        <Button asChild>
          <Link href="/messages">Back to Messages</Link>
        </Button>
      </div>
    );
  }

  // Redirect if conversation already exists
  if (existingConversation && conversations.length > 0) {
    router.push(`/messages/${existingConversation.id}`);
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/messages">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Messages
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
          <div className="flex items-center gap-3 pt-4">
            <Avatar>
              <AvatarImage src={undefined} />
              <AvatarFallback>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{username}</p>
              <p className="text-sm text-muted-foreground">
                Write your first message
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                disabled={sendMessageMutation.isPending}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !message.trim()}
              >
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
