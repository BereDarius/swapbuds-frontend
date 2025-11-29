import type {
  Conversation,
  GetMessagesDto,
  Message,
  MessagesResponse,
  SendMessageDto,
} from "@/types/message";
import api from "../api";

// Get all conversations for the current user
export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get("/messages/conversations");
  return response.data;
}

// Get a single conversation with metadata
export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  // Fetch from the conversations list and find the matching one
  const conversations = await getConversations();
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }
  return conversation;
}

// Get messages in a conversation
export async function getMessages(
  conversationId: string,
  params?: GetMessagesDto,
): Promise<MessagesResponse> {
  const response = await api.get(`/messages/conversations/${conversationId}`, {
    params,
  });
  return response.data;
}

// Send a message
export async function sendMessage(data: SendMessageDto): Promise<Message> {
  const response = await api.post("/messages", data);
  return response.data;
}

// Mark a specific message as read
export async function markMessageAsRead(messageId: string): Promise<Message> {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(
  conversationId: string,
): Promise<{ count: number }> {
  const response = await api.patch(
    `/messages/conversations/${conversationId}/read`,
  );
  return response.data;
}

// Get unread message count
export async function getMessageUnreadCount(): Promise<number> {
  const response = await api.get("/messages/unread/count");
  return response.data.count;
}

// Update a message
export async function updateMessage(
  messageId: string,
  data: { content: string },
): Promise<Message> {
  const response = await api.patch(`/messages/${messageId}`, data);
  return response.data;
}

// Delete a message (soft delete)
export async function deleteMessage(
  messageId: string,
): Promise<{ message: string }> {
  const response = await api.delete(`/messages/${messageId}`);
  return response.data;
}

// Get message version history (admins only)
export async function getMessageVersions(messageId: string): Promise<any[]> {
  const response = await api.get(`/messages/${messageId}/versions`);
  return response.data;
}
