import { describe, expect, it, vi } from "vitest";
import { api } from "../api";
import {
  disableMFA,
  getCurrentUser,
  login,
  loginWithApple,
  loginWithFacebook,
  loginWithGoogle,
  logout,
  refreshToken,
  register,
  setupMFA,
  verifyMFA,
} from "./auth";

// Mock the api module
vi.mock("../api");

describe("Auth API", () => {
  describe("login", () => {
    it("should login successfully", async () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
        recaptchaToken: "token",
      };

      const mockResponse = {
        data: {
          user: {
            id: "user1",
            email: "test@example.com",
            username: "testuser",
            role: "USER",
            emailVerified: true,
            isVerified: false,
            isBanned: false,
            reputationScore: 0,
            avatarUrl: null,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          accessToken: "jwt-token",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await login(credentials);

      expect(api.post).toHaveBeenCalledWith("/auth/login", credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle login errors", async () => {
      const credentials = {
        email: "wrong@example.com",
        password: "wrongpassword",
        recaptchaToken: "token",
      };

      vi.mocked(api.post).mockRejectedValue(new Error("Invalid credentials"));

      await expect(login(credentials)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      const registerData = {
        email: "new@example.com",
        username: "newuser",
        password: "password123",
        dateOfBirth: "2000-01-01",
        acceptedTerms: true,
        acceptedPrivacy: true,
        marketingConsent: false,
        recaptchaToken: "token",
      };

      const mockResponse = {
        data: {
          user: {
            id: "user2",
            email: "new@example.com",
            username: "newuser",
            role: "USER",
            emailVerified: false,
            isVerified: false,
            isBanned: false,
            reputationScore: 0,
            avatarUrl: null,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          accessToken: "jwt-token",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await register(registerData);

      expect(api.post).toHaveBeenCalledWith("/auth/register", registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle registration errors", async () => {
      const registerData = {
        email: "existing@example.com",
        username: "existinguser",
        password: "password123",
        dateOfBirth: "2000-01-01",
        acceptedTerms: true,
        acceptedPrivacy: true,
        marketingConsent: false,
        recaptchaToken: "token",
      };

      vi.mocked(api.post).mockRejectedValue(new Error("Email already exists"));

      await expect(register(registerData)).rejects.toThrow(
        "Email already exists",
      );
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      vi.mocked(api.post).mockResolvedValue({ data: undefined });

      await logout();

      expect(api.post).toHaveBeenCalledWith("/auth/logout");
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user", async () => {
      const mockResponse = {
        data: {
          id: "user1",
          email: "test@example.com",
          username: "testuser",
          role: "USER",
          emailVerified: true,
          isVerified: false,
          isBanned: false,
          reputationScore: 0,
          avatarUrl: null,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle unauthorized error", async () => {
      vi.mocked(api.get).mockRejectedValue(new Error("Unauthorized"));

      await expect(getCurrentUser()).rejects.toThrow("Unauthorized");
    });
  });

  describe("refreshToken", () => {
    it("should refresh access token", async () => {
      const tokenData = { refreshToken: "old-refresh-token" };
      const mockResponse = {
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await refreshToken(tokenData);

      expect(api.post).toHaveBeenCalledWith("/auth/refresh", tokenData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("OAuth Login", () => {
    it("should login with Google", async () => {
      const mockResponse = {
        data: {
          user: { id: "user1", email: "test@gmail.com" },
          accessToken: "google-jwt",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await loginWithGoogle("google-oauth-token");

      expect(api.post).toHaveBeenCalledWith("/auth/oauth/google", {
        token: "google-oauth-token",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should login with Facebook", async () => {
      const mockResponse = {
        data: {
          user: { id: "user1", email: "test@facebook.com" },
          accessToken: "facebook-jwt",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await loginWithFacebook("facebook-oauth-token");

      expect(api.post).toHaveBeenCalledWith("/auth/oauth/facebook", {
        token: "facebook-oauth-token",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should login with Apple", async () => {
      const mockResponse = {
        data: {
          user: { id: "user1", email: "test@apple.com" },
          accessToken: "apple-jwt",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await loginWithApple("apple-oauth-token");

      expect(api.post).toHaveBeenCalledWith("/auth/oauth/apple", {
        token: "apple-oauth-token",
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("Multi-Factor Authentication", () => {
    it("should setup MFA", async () => {
      const mockResponse = {
        data: {
          qrCodeUrl: "data:image/png;base64,...",
          secret: "MFA_SECRET",
        },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await setupMFA();

      expect(api.post).toHaveBeenCalledWith("/auth/mfa/setup");
      expect(result).toEqual(mockResponse.data);
    });

    it("should verify MFA code", async () => {
      const mfaData = { code: "123456" };
      const mockResponse = {
        data: { verified: true },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await verifyMFA(mfaData);

      expect(api.post).toHaveBeenCalledWith("/auth/mfa/verify", mfaData);
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle invalid MFA code", async () => {
      const mfaData = { code: "000000" };
      const mockResponse = {
        data: { verified: false },
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await verifyMFA(mfaData);

      expect(result.verified).toBe(false);
    });

    it("should disable MFA", async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });

      await disableMFA();

      expect(api.delete).toHaveBeenCalledWith("/auth/mfa");
    });
  });
});
