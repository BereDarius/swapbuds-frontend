/**
 * Comment Types
 *
 * Type definitions for item comments and replies.
 * Matches backend comments module DTOs.
 */

/**
 * Create comment DTO
 */
export interface CreateCommentDto {
  content: string; // max 1000 chars
  parentId?: string; // For nested replies
}

/**
 * Update comment DTO
 */
export interface UpdateCommentDto {
  content: string; // max 1000 chars
}

/**
 * Comment author (minimal user data)
 */
export interface CommentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

/**
 * Comment entity
 */
export interface Comment {
  id: string;
  content: string;
  itemId: string;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  replies?: Comment[]; // Nested replies
  createdAt: string;
  updatedAt: string;
}

/**
 * Comment count response
 */
export interface CommentCountResponse {
  count: number;
}
