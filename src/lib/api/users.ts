/**
 * Users API Client
 *
 * API functions for user profile management, statistics, and settings.
 */

import type {
  UpdateProfileDto,
  UpdateSettingsDto,
  UserProfile,
  UserSettings,
  UserStatistics,
} from "@/types/user";
import { api } from "../api";

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/users/${userId}`);
  return response.data;
}

/**
 * Update current user's profile
 */
export async function updateProfile(
  data: UpdateProfileDto
): Promise<UserProfile> {
  const response = await api.patch<UserProfile>("/users/profile", data);
  return response.data;
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UserProfile>("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Get user statistics
 */
export async function getUserStatistics(
  userId: string
): Promise<UserStatistics> {
  const response = await api.get<UserStatistics>(`/users/${userId}/statistics`);
  return response.data;
}

/**
 * Get current user's settings
 */
export async function getUserSettings(): Promise<UserSettings> {
  const response = await api.get<UserSettings>("/users/me/settings");
  return response.data;
}

/**
 * Update current user's settings
 */
export async function updateSettings(
  data: UpdateSettingsDto
): Promise<UserSettings> {
  const response = await api.patch<UserSettings>("/users/me/settings", data);
  return response.data;
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(): Promise<UserSettings> {
  const response = await api.post<UserSettings>("/users/me/settings/reset");
  return response.data;
}
