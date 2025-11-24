/**
 * Support API Client
 *
 * API functions for support tickets and live chat.
 * Handles creating tickets, sending messages, and resolving issues.
 */

import type {
  CreateChatDto,
  ResolveChatDto,
  SendSupportMessageDto,
  SupportChat,
  SupportMessage,
} from "@/types/support";
import { api } from "../api";

/**
 * Get all support chats for the current user
 */
export async function getMySupportChats(): Promise<SupportChat[]> {
  const response = await api.get<SupportChat[]>("/support/chats/me");
  return response.data;
}

/**
 * Get a specific support chat by ID
 */
export async function getSupportChatById(chatId: string): Promise<SupportChat> {
  const response = await api.get<SupportChat>(`/support/chats/${chatId}`);
  return response.data;
}

/**
 * Create a new support chat/ticket
 */
export async function createSupportChat(
  data: CreateChatDto,
): Promise<SupportChat> {
  const response = await api.post<SupportChat>("/support/chats", data);
  return response.data;
}

/**
 * Send a message in a support chat
 */
export async function sendSupportMessage(
  chatId: string,
  data: SendSupportMessageDto,
): Promise<SupportMessage> {
  const response = await api.post<SupportMessage>(
    `/support/chats/${chatId}/messages`,
    data,
  );
  return response.data;
}

/**
 * Resolve a support chat (mark as resolved)
 */
export async function resolveSupportChat(
  chatId: string,
  data: ResolveChatDto,
): Promise<SupportChat> {
  const response = await api.patch<SupportChat>(
    `/support/chats/${chatId}/resolve`,
    data,
  );
  return response.data;
}

/**
 * Close a support chat
 */
export async function closeSupportChat(chatId: string): Promise<SupportChat> {
  const response = await api.patch<SupportChat>(
    `/support/chats/${chatId}/close`,
  );
  return response.data;
}

/**
 * Reopen a closed support chat
 */
export async function reopenSupportChat(chatId: string): Promise<SupportChat> {
  const response = await api.patch<SupportChat>(
    `/support/chats/${chatId}/reopen`,
  );
  return response.data;
}

/**
 * Get all support chats (support staff only)
 */
export async function getAllSupportChats(params?: {
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ chats: SupportChat[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.priority) queryParams.append("priority", params.priority);
  if (params?.assignedTo) queryParams.append("assignedTo", params.assignedTo);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/support/chats?${queryParams.toString()}`);
  return response.data;
}

/**
 * Assign a support chat to a staff member (support staff only)
 */
export async function assignSupportChat(
  chatId: string,
  staffId: string,
): Promise<SupportChat> {
  const response = await api.patch<SupportChat>(
    `/support/chats/${chatId}/assign`,
    { staffId },
  );
  return response.data;
}
