/**
 * Authentication Types
 *
 * Type definitions for authentication, registration, OAuth, and MFA.
 * Matches backend auth module DTOs.
 */

/**
 * OAuth provider enum
 */
export enum OAuthProvider {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
}

/**
 * User registration DTO
 */
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  recaptchaToken?: string;
  dateOfBirth?: string; // YYYY-MM-DD format
  firstName?: string;
  lastName?: string;
  location?: string;
}

/**
 * Login credentials DTO
 */
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string; // 6-digit code
  mfaToken?: string; // Temporary MFA token
}

/**
 * Authentication response
 */
export interface AuthResponse {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  reputationScore?: number;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * MFA setup response
 */
export interface MFASetupResponse {
  qrCode: string; // Data URL for QR code
  secret: string; // Manual entry key
  backupCodes: string[];
}

/**
 * MFA verification DTO
 */
export interface MFAVerifyDto {
  code: string; // 6-digit code
}

/**
 * Enable MFA DTO
 */
export interface EnableMFADto {
  code: string;
}

/**
 * Verify MFA setup DTO
 */
export interface VerifyMFASetupDto {
  code: string; // 6 digits
}

/**
 * Disable MFA DTO
 */
export interface DisableMFADto {
  password: string;
  code: string; // 6 digits
}

/**
 * MFA required response
 */
export interface MFARequiredResponse {
  mfaToken: string;
  mfaRequired: boolean;
  expiresAt: string;
}

/**
 * Regenerate backup codes DTO
 */
export interface RegenerateBackupCodesDto {
  password: string;
  code: string; // 6 digits
}

/**
 * OAuth callback DTO
 */
export interface OAuthCallbackDto {
  provider: OAuthProvider;
  code: string;
  state?: string;
  redirectUri?: string;
  codeVerifier?: string;
  idToken?: string;
  accessToken?: string;
}

/**
 * OAuth account response
 */
export interface OAuthAccountResponse {
  id: string;
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  linkedAt: string;
}

/**
 * Link OAuth account DTO
 */
export interface LinkOAuthAccountDto {
  token: string;
}

/**
 * Unlink OAuth account DTO
 */
export interface UnlinkOAuthAccountDto {
  provider: OAuthProvider;
  password: string;
}

/**
 * Authenticated user (minimal profile)
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  reputationScore?: number;
  role?: string;
}
