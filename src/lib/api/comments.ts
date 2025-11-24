/**
 * Comments API Client
 *
 * API client for item comments functionality
 */

import type {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from "@/types/comment";
import { api } from "../api";

/**
 * Create a comment on an item
 */
export async function createComment(
  itemId: string,
  data: CreateCommentDto,
): Promise<Comment> {
  const response = await api.post(`/items/${itemId}/comments`, data);
  return response.data;
}

/**
 * Get comments for an item
 */
export async function getItemComments(itemId: string): Promise<Comment[]> {
  const response = await api.get<Comment[]>(`/items/${itemId}/comments`);
  return response.data;
}

/**
 * Get comment count for an item
 */
export async function getCommentsCount(itemId: string): Promise<number> {
  const response = await api.get<{ count: number }>(
    `/items/${itemId}/comments/count`,
  );
  return response.data.count;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentDto,
): Promise<Comment> {
  const response = await api.patch(`/items/comments/${commentId}`, data);
  return response.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/items/comments/${commentId}`);
}
