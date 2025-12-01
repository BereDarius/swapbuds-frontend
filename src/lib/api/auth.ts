/**
 * Authentication API Client
 *
 * Handles user authentication, registration, and session management
 */

import type {
  AuthResponse,
  LoginDto,
  MFASetupResponse,
  MFAVerifyDto,
  RefreshTokenDto,
  RegisterDto,
  User,
} from "@/types/auth";
import { api } from "../api";

/**
 * Register a new user
 */
export async function register(data: RegisterDto): Promise<AuthResponse> {
  const response = await api.post("/auth/register", data);
  return response.data;
}

/**
 * Login with email and password
 */
export async function login(data: LoginDto): Promise<AuthResponse> {
  const response = await api.post("/auth/login", data);
  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  data: RefreshTokenDto
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await api.post("/auth/refresh", data);
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get("/auth/me");
  return response.data;
}

/**
 * Logout (invalidate token)
 */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(token: string): Promise<AuthResponse> {
  const response = await api.post("/auth/oauth/google", { token });
  return response.data;
}

/**
 * Login with Facebook OAuth
 */
export async function loginWithFacebook(token: string): Promise<AuthResponse> {
  const response = await api.post("/auth/oauth/facebook", { token });
  return response.data;
}

/**
 * Login with Apple OAuth
 */
export async function loginWithApple(token: string): Promise<AuthResponse> {
  const response = await api.post("/auth/oauth/apple", { token });
  return response.data;
}

/**
 * Setup Multi-Factor Authentication
 */
export async function setupMFA(): Promise<MFASetupResponse> {
  const response = await api.post("/auth/mfa/setup");
  return response.data;
}

/**
 * Verify MFA code
 */
export async function verifyMFA(
  data: MFAVerifyDto
): Promise<{ verified: boolean }> {
  const response = await api.post("/auth/mfa/verify", data);
  return response.data;
}

/**
 * Disable MFA
 */
export async function disableMFA(): Promise<void> {
  await api.delete("/auth/mfa");
}
