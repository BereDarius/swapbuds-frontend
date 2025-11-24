/**
 * Review Types
 *
 * Type definitions for trade reviews and ratings.
 * Matches backend reviews module DTOs.
 */

/**
 * Create review DTO
 */
export interface CreateReviewDto {
  rating: number; // 1-5
  comment: string;
}

/**
 * Update review DTO
 */
export interface UpdateReviewDto {
  rating?: number; // 1-5
  comment?: string;
}

/**
 * Review author (minimal user data)
 */
export interface ReviewAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Review entity
 */
export interface Review {
  id: string;
  tradeId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  reviewer: ReviewAuthor;
  reviewee: ReviewAuthor;
  createdAt: string;
  updatedAt: string;
}

/**
 * Review statistics (for user profiles)
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
