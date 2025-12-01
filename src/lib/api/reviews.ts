/**
 * Reviews API Client
 *
 * API client for reviews and ratings functionality
 */

import type { CreateReviewDto, Review, UpdateReviewDto } from "@/types/review";
import api from "../api";

/**
 * Create a review for a completed trade
 */
export async function createReview(
  tradeId: string,
  data: CreateReviewDto
): Promise<Review> {
  const response = await api.post(`/reviews/trades/${tradeId}`, data);
  return response.data;
}

/**
 * Get reviews received by a specific user
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  const response = await api.get(`/reviews/users/${userId}`);
  return response.data;
}

/**
 * Get reviews given by the current user
 */
export async function getMyReviewsGiven(): Promise<Review[]> {
  const response = await api.get("/reviews/me/given");
  return response.data;
}

/**
 * Get reviews received by the current user
 */
export async function getMyReviews(): Promise<Review[]> {
  const response = await api.get("/reviews/me");
  return response.data;
}

/**
 * Get a specific review by ID
 */
export async function getReviewById(id: string): Promise<Review> {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
}

/**
 * Update a review
 */
export async function updateReview(
  id: string,
  data: UpdateReviewDto
): Promise<Review> {
  const response = await api.put(`/reviews/${id}`, data);
  return response.data;
}

/**
 * Delete a review
 */
export async function deleteReview(id: string): Promise<void> {
  await api.delete(`/reviews/${id}`);
}

/**
 * Get all reviews for a specific trade
 */
export async function getTradeReviews(tradeId: string): Promise<Review[]> {
  const response = await api.get(`/reviews/trades/${tradeId}/all`);
  return response.data;
}
