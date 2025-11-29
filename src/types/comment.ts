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
 * Comment version (edit history)
 */
export interface CommentVersion {
  id: string;
  content: string;
  editedBy: string;
  createdAt: string;
}

/**
 * Comment entity
 * Matches backend CommentDto structure
 */
export interface Comment {
  id: string;
  content: string;
  itemId: string;

  // Author fields (flat structure from backend)
  userId: string;
  username: string;
  avatarUrl: string | null;
  isVerified?: boolean;

  parentId: string | null;
  replies?: Comment[]; // Nested replies

  // Edit tracking
  isEdited: boolean;
  editedAt: string | null;

  // Soft delete tracking
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  deleteReason: string | null;

  // Engagement
  likesCount: number;
  hasLiked?: boolean;

  // Version history (for moderators)
  versions?: CommentVersion[];

  createdAt: string;
  updatedAt: string;
}

/**
 * Comment count response
 */
export interface CommentCountResponse {
  count: number;
}

/**
 * Create comment response (includes updated count)
 */
export interface CreateCommentResponse extends Comment {
  commentsCount: number;
}
