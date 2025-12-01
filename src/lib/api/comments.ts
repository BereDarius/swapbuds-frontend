/**
 * Comments API Client
 *
 * API client for item comments functionality
 */

import type {
  Comment,
  CreateCommentDto,
  CreateCommentResponse,
  UpdateCommentDto,
} from "@/types/comment";
import { api } from "../api";

/**
 * Create a comment on an item
 * @returns Comment with updated commentsCount
 */
export async function createComment(
  itemId: string,
  data: CreateCommentDto,
): Promise<CreateCommentResponse> {
  const response = await api.post<CreateCommentResponse>(
    `/items/${itemId}/comments`,
    data,
  );
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
 * Delete a comment (soft delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/items/comments/${commentId}`);
}

/**
 * Like a comment
 * @returns Object containing the updated likes count and hasLiked status
 */
export async function likeComment(
  commentId: string,
): Promise<{ likesCount: number; hasLiked: boolean }> {
  const response = await api.post<{
    message: string;
    likesCount: number;
    hasLiked: boolean;
  }>(`/items/comments/${commentId}/like`);
  return {
    likesCount: response.data.likesCount,
    hasLiked: response.data.hasLiked,
  };
}

/**
 * Unlike a comment
 * @returns Object containing the updated likes count and hasLiked status
 */
export async function unlikeComment(
  commentId: string,
): Promise<{ likesCount: number; hasLiked: boolean }> {
  const response = await api.delete<{ likesCount: number; hasLiked: boolean }>(
    `/items/comments/${commentId}/like`,
  );
  return {
    likesCount: response.data.likesCount,
    hasLiked: response.data.hasLiked,
  };
}

/**
 * Check if current user has liked a comment
 */
export async function checkCommentLiked(commentId: string): Promise<boolean> {
  try {
    const response = await api.get<{ liked: boolean }>(
      `/items/comments/${commentId}/liked`,
    );
    return response.data.liked;
  } catch {
    return false;
  }
}

/**
 * Flag a comment for moderation
 */
export async function flagComment(
  commentId: string,
  data: { reason: string; description?: string },
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    `/moderation/comments/${commentId}/flag`,
    data,
  );
  return response.data;
}

/**
 * Get comment version history (moderators only)
 */
export async function getCommentVersions(
  commentId: string,
): Promise<
  Array<{ id: string; content: string; editedBy: string; createdAt: string }>
> {
  const response = await api.get(`/items/comments/${commentId}/versions`);
  return response.data;
}
