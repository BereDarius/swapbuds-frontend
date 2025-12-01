/**
 * Admin API Client Tests
 */

import {
  UserRole,
  type BanUserDto,
  type ChangeUserRoleDto,
  type GetUsersQueryDto,
  type UnbanUserDto,
} from "@/types/admin";
import type { UserProfile } from "@/types/user";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as adminApi from "./admin";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("Admin API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUser: UserProfile = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    avatarUrl: null,
    bio: null,
    location: null,
    reputationScore: 100,
    isVerified: false,
    isBanned: false,
    role: "USER",
    createdAt: "2024-01-01T00:00:00Z",
    itemsCount: 0,
    tradesCount: 0,
  };

  describe("getUsers", () => {
    it("should fetch all users with pagination", async () => {
      const response = {
        users: [mockUser],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const query: GetUsersQueryDto = {
        page: 1,
        limit: 10,
      };

      const result = await adminApi.getUsers(query);

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users")
      );
      expect(result).toEqual(response);
    });

    it("should fetch users with filters", async () => {
      const response = {
        users: [mockUser],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const query: GetUsersQueryDto = {
        role: UserRole.USER,
        isVerified: true,
        isBanned: false,
        page: 1,
        limit: 10,
      };

      const result = await adminApi.getUsers(query);

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users")
      );
      expect(result).toEqual(response);
    });
  });

  describe("banUser", () => {
    it("should ban a user", async () => {
      const banDto: BanUserDto = {
        reason: "Violation of terms",
      };

      vi.mocked(api.post).mockResolvedValue({} as AxiosResponse);

      await adminApi.banUser("user-1", banDto);

      expect(api.post).toHaveBeenCalledWith("/admin/users/user-1/ban", banDto);
    });
  });

  describe("unbanUser", () => {
    it("should unban a user", async () => {
      const unbanDto: UnbanUserDto = {
        reason: "Ban lifted",
      };

      vi.mocked(api.post).mockResolvedValue({} as AxiosResponse);

      await adminApi.unbanUser("user-1", unbanDto);

      expect(api.post).toHaveBeenCalledWith(
        "/admin/users/user-1/unban",
        unbanDto
      );
    });
  });

  describe("changeUserRole", () => {
    it("should change user role", async () => {
      const roleDto: ChangeUserRoleDto = {
        role: UserRole.MODERATOR,
        reason: "Promoted to moderator",
      };

      vi.mocked(api.patch).mockResolvedValue({} as AxiosResponse);

      await adminApi.changeUserRole("user-1", roleDto);

      expect(api.patch).toHaveBeenCalledWith(
        "/admin/users/user-1/role",
        roleDto
      );
    });
  });

  describe("getAdminStats", () => {
    it("should fetch admin dashboard statistics", async () => {
      const stats = {
        users: {
          total: 1000,
          active: 800,
          inactive: 200,
          newLast7Days: 50,
        },
        items: {
          total: 5000,
          available: 3000,
          inTrade: 1000,
          newLast7Days: 200,
        },
        trades: {
          total: 2000,
          active: 500,
          completed: 1500,
          newLast7Days: 100,
        },
        verifications: {
          total: 300,
          pending: 50,
          approved: 250,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: stats,
      } as AxiosResponse);

      const result = await adminApi.getAdminStats();

      expect(api.get).toHaveBeenCalledWith("/admin/stats");
      expect(result).toEqual(stats);
    });
  });

  describe("getAdminLogs", () => {
    it("should fetch admin action logs", async () => {
      const response = {
        logs: [],
        total: 0,
      };

      vi.mocked(api.get).mockResolvedValue({
        data: response,
      } as AxiosResponse);

      const result = await adminApi.getAdminLogs({ page: 1, limit: 20 });

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/admin/logs")
      );
      expect(result).toEqual(response);
    });
  });

  describe("bulk operations", () => {
    it("should bulk ban users", async () => {
      vi.mocked(api.post).mockResolvedValue({} as AxiosResponse);

      await adminApi.bulkBanUsers({
        userIds: ["user-1", "user-2"],
        reason: "Spam",
      });

      expect(api.post).toHaveBeenCalledWith("/admin/users/bulk-ban", {
        userIds: ["user-1", "user-2"],
        reason: "Spam",
      });
    });

    it("should bulk unban users", async () => {
      vi.mocked(api.post).mockResolvedValue({} as AxiosResponse);

      await adminApi.bulkUnbanUsers({
        userIds: ["user-1", "user-2"],
        reason: "Appeal approved",
      });

      expect(api.post).toHaveBeenCalledWith("/admin/users/bulk-unban", {
        userIds: ["user-1", "user-2"],
        reason: "Appeal approved",
      });
    });

    it("should bulk change user roles", async () => {
      vi.mocked(api.post).mockResolvedValue({} as AxiosResponse);

      await adminApi.bulkChangeRole({
        userIds: ["user-1", "user-2"],
        role: UserRole.MODERATOR,
        reason: "Promoted to moderator",
      });

      expect(api.post).toHaveBeenCalledWith("/admin/users/bulk-role", {
        userIds: ["user-1", "user-2"],
        role: UserRole.MODERATOR,
        reason: "Promoted to moderator",
      });
    });
  });
});
