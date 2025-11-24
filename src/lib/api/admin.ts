/**
 * Admin API Client
 *
 * API functions for admin operations (user management, moderation).
 * Requires ADMIN or MODERATOR role.
 */

import type {
  AdminActionLog,
  BanUserDto,
  BulkBanUsersDto,
  BulkChangeRoleDto,
  BulkUnbanUsersDto,
  ChangeUserRoleDto,
  GetUsersQueryDto,
  UnbanUserDto,
} from "@/types/admin";
import type { UserProfile } from "@/types/user";
import { api } from "../api";

/**
 * Get all users (admin view)
 */
export async function getUsers(
  query?: GetUsersQueryDto,
): Promise<{ users: UserProfile[]; total: number }> {
  const params = new URLSearchParams();
  if (query?.role) params.append("role", query.role);
  if (query?.isVerified !== undefined)
    params.append("isVerified", query.isVerified.toString());
  if (query?.isBanned !== undefined)
    params.append("isBanned", query.isBanned.toString());
  if (query?.page) params.append("page", query.page.toString());
  if (query?.limit) params.append("limit", query.limit.toString());

  const response = await api.get(`/admin/users?${params.toString()}`);
  return response.data;
}

/**
 * Ban a user
 */
export async function banUser(userId: string, data: BanUserDto): Promise<void> {
  await api.post(`/admin/users/${userId}/ban`, data);
}

/**
 * Unban a user
 */
export async function unbanUser(
  userId: string,
  data: UnbanUserDto,
): Promise<void> {
  await api.post(`/admin/users/${userId}/unban`, data);
}

/**
 * Change user role
 */
export async function changeUserRole(
  userId: string,
  data: ChangeUserRoleDto,
): Promise<void> {
  await api.patch(`/admin/users/${userId}/role`, data);
}

/**
 * Bulk ban users
 */
export async function bulkBanUsers(data: BulkBanUsersDto): Promise<void> {
  await api.post("/admin/users/bulk-ban", data);
}

/**
 * Bulk unban users
 */
export async function bulkUnbanUsers(data: BulkUnbanUsersDto): Promise<void> {
  await api.post("/admin/users/bulk-unban", data);
}

/**
 * Bulk change user roles
 */
export async function bulkChangeRole(data: BulkChangeRoleDto): Promise<void> {
  await api.post("/admin/users/bulk-role", data);
}

/**
 * Get admin action logs
 */
export async function getAdminLogs(params?: {
  page?: number;
  limit?: number;
}): Promise<{ logs: AdminActionLog[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await api.get(`/admin/logs?${queryParams.toString()}`);
  return response.data;
}
