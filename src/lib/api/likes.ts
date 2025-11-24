/**
 * Likes API Client
 *
 * API client for item likes functionality
 */

import { api } from "../api";

/**
 * Like an item
 */
export async function likeItem(itemId: string): Promise<void> {
  await api.post(`/items/${itemId}/like`);
}

/**
 * Unlike an item
 */
export async function unlikeItem(itemId: string): Promise<void> {
  await api.delete(`/items/${itemId}/like`);
}

/**
 * Get like count for an item
 */
export async function getLikeCount(itemId: string): Promise<number> {
  const response = await api.get<{ count: number }>(
    `/items/${itemId}/likes/count`,
  );
  return response.data.count;
}

/**
 * Check if current user has liked an item
 */
export async function checkIfLiked(itemId: string): Promise<boolean> {
  try {
    const response = await api.get<{ liked: boolean }>(
      `/items/${itemId}/likes/me`,
    );
    return response.data.liked;
  } catch {
    return false;
  }
}

/**
 * Get users who liked an item
 */
export async function getUsersWhoLiked(itemId: string): Promise<
  Array<{
    id: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }>
> {
  const response = await api.get(`/items/${itemId}/likes/users`);
  return response.data;
}
