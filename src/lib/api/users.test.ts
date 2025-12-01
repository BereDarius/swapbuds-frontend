/**
 * Users API Client Tests
 */

import type {
  UpdateProfileDto,
  UpdateSettingsDto,
  UserProfile,
  UserSettings,
  UserStatistics,
} from "@/types/user";
import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../api";
import * as usersApi from "./users";

// Mock the api module
vi.mock("../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("Users API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile: UserProfile = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    avatarUrl: null,
    bio: "Test bio",
    location: "Test City",
    reputationScore: 100,
    isVerified: true,
    isBanned: false,
    role: "USER",
    createdAt: "2024-01-01T00:00:00Z",
    itemsCount: 5,
    tradesCount: 10,
  };

  const mockStatistics: UserStatistics = {
    totalTrades: 10,
    completedTrades: 8,
    cancelledTrades: 2,
    averageResponseTime: 3600,
    successRate: 0.8,
    totalCounterOffers: 5,
    pendingAsProposer: 1,
    pendingAsResponder: 2,
  };

  const mockSettings: UserSettings = {
    emailNotifications: true,
    pushNotifications: true,
    tradeNotifications: true,
    messageNotifications: true,
    marketingEmails: false,
    profileVisibility: "PUBLIC",
    showEmail: false,
    showLocation: true,
    language: "en",
    timezone: "UTC",
  };

  describe("getUserProfile", () => {
    it("should fetch user profile by ID", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockProfile,
      } as AxiosResponse);

      const result = await usersApi.getUserProfile("user-1");

      expect(api.get).toHaveBeenCalledWith("/users/user-1");
      expect(result).toEqual(mockProfile);
    });
  });

  describe("updateProfile", () => {
    it("should update current user's profile", async () => {
      const updateDto: UpdateProfileDto = {
        bio: "Updated bio",
        location: "New City",
      };
      const updatedProfile = {
        ...mockProfile,
        bio: "Updated bio",
        location: "New City",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: updatedProfile,
      } as AxiosResponse);

      const result = await usersApi.updateProfile(updateDto);

      expect(api.patch).toHaveBeenCalledWith("/users/profile", updateDto);
      expect(result).toEqual(updatedProfile);
    });
  });

  describe("uploadAvatar", () => {
    it("should upload avatar image", async () => {
      const file = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
      const updatedProfile = {
        ...mockProfile,
        avatarUrl: "https://example.com/avatar.jpg",
      };

      vi.mocked(api.post).mockResolvedValue({
        data: updatedProfile,
      } as AxiosResponse);

      const result = await usersApi.uploadAvatar(file);

      expect(api.post).toHaveBeenCalledWith(
        "/users/avatar",
        expect.any(FormData),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      expect(result).toEqual(updatedProfile);
    });
  });

  describe("getUserStatistics", () => {
    it("should fetch user statistics", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockStatistics,
      } as AxiosResponse);

      const result = await usersApi.getUserStatistics("user-1");

      expect(api.get).toHaveBeenCalledWith("/users/user-1/statistics");
      expect(result).toEqual(mockStatistics);
    });
  });

  describe("getUserSettings", () => {
    it("should fetch current user's settings", async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: mockSettings,
      } as AxiosResponse);

      const result = await usersApi.getUserSettings();

      expect(api.get).toHaveBeenCalledWith("/users/me/settings");
      expect(result).toEqual(mockSettings);
    });
  });

  describe("updateSettings", () => {
    it("should update current user's settings", async () => {
      const updateDto: UpdateSettingsDto = {
        emailNotifications: false,
        language: "ro",
      };
      const updatedSettings = {
        ...mockSettings,
        emailNotifications: false,
        language: "ro",
      };

      vi.mocked(api.patch).mockResolvedValue({
        data: updatedSettings,
      } as AxiosResponse);

      const result = await usersApi.updateSettings(updateDto);

      expect(api.patch).toHaveBeenCalledWith("/users/me/settings", updateDto);
      expect(result).toEqual(updatedSettings);
    });
  });

  describe("resetSettings", () => {
    it("should reset settings to defaults", async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: mockSettings,
      } as AxiosResponse);

      const result = await usersApi.resetSettings();

      expect(api.post).toHaveBeenCalledWith("/users/me/settings/reset");
      expect(result).toEqual(mockSettings);
    });
  });
});
