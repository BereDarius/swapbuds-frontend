import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * User profile data structure
 * Represents the authenticated user's basic information
 */
interface User {
  /** Unique user identifier from database */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  username: string;
  /** Optional profile picture URL (Cloudinary) */
  avatarUrl?: string;
}

/**
 * Authentication store state and actions
 * Manages user authentication state across the application
 */
interface AuthState {
  /** Currently authenticated user, null if not logged in */
  user: User | null;
  /** JWT access token for API authentication */
  accessToken: string | null;
  /** Convenience flag derived from presence of user/token */
  isAuthenticated: boolean;
  /** Sets authenticated state after login/register */
  setAuth: (user: User, accessToken: string) => void;
  /** Clears authenticated state on logout */
  clearAuth: () => void;
}

/**
 * Zustand authentication store with localStorage persistence
 *
 * This store manages the global authentication state and automatically
 * persists user data to localStorage for persistence across page reloads.
 *
 * Features:
 * - Automatic persistence to localStorage (key: "auth-storage")
 * - Synchronized token management between Zustand and localStorage
 * - Type-safe authentication state access throughout the app
 *
 * @example
 * ```typescript
 * // In a component
 * const { user, setAuth, clearAuth } = useAuthStore();
 *
 * // After successful login
 * setAuth(userData, token);
 *
 * // On logout
 * clearAuth();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      /**
       * Sets authentication state after successful login/register
       * Updates both Zustand store and localStorage
       */
      setAuth: (user, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      /**
       * Clears authentication state on logout
       * Removes token from both Zustand store and localStorage
       */
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
