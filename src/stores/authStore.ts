import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/auth";

/**
 * User type is imported from auth types to maintain consistency
 * @see {@link User} from @/types/auth
 */

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
  /** Flag to track if store has been hydrated from localStorage */
  _hasHydrated: boolean;
  /** Sets hydration complete flag */
  _setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,
      /**
       * Sets hydration complete flag
       * Called automatically after localStorage data is loaded
       */
      _setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      /**
       * Sets authentication state after successful login/register
       * Updates both Zustand store and localStorage/sessionStorage based on rememberMe preference
       */
      setAuth: (user, accessToken) => {
        const rememberMe = localStorage.getItem("rememberMe") === "true";

        if (rememberMe) {
          // Persist token in localStorage for long-term storage
          localStorage.setItem("accessToken", accessToken);
        } else {
          // Use sessionStorage for temporary storage (cleared when browser closes)
          sessionStorage.setItem("accessToken", accessToken);
        }

        set({ user, accessToken, isAuthenticated: true });
      },
      /**
       * Clears authentication state on logout
       * Removes token from both Zustand store, localStorage, and sessionStorage
       */
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("rememberMe");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);
