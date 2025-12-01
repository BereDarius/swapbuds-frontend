import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./authStore";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

describe("AuthStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    // Reset store state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  it("should initialize with empty state", () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set user and access token", () => {
    const mockUser = {
      id: "user1",
      email: "test@example.com",
      username: "testuser",
      role: "USER" as const,
      emailVerified: false,
      isVerified: false,
      isBanned: false,
      reputationScore: 0,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = "mock-token";

    // Set rememberMe to test localStorage
    localStorageMock.setItem("rememberMe", "true");
    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear auth state on logout", () => {
    const mockUser = {
      id: "user1",
      email: "test@example.com",
      username: "testuser",
      role: "USER" as const,
      emailVerified: false,
      isVerified: false,
      isBanned: false,
      reputationScore: 0,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.setItem("rememberMe", "true");
    useAuthStore.getState().setAuth(mockUser, "token");
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should persist token to localStorage when rememberMe is true", () => {
    const mockToken = "test-token";
    const mockUser = {
      id: "user1",
      email: "test@example.com",
      username: "testuser",
      role: "USER" as const,
      emailVerified: false,
      isVerified: false,
      isBanned: false,
      reputationScore: 0,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.setItem("rememberMe", "true");
    useAuthStore.getState().setAuth(mockUser, mockToken);

    const storedToken = localStorageMock.getItem("accessToken");
    expect(storedToken).toBe(mockToken);
  });

  it("should persist token to sessionStorage when rememberMe is false", () => {
    const mockToken = "test-token";
    const mockUser = {
      id: "user1",
      email: "test@example.com",
      username: "testuser",
      role: "USER" as const,
      emailVerified: false,
      isVerified: false,
      isBanned: false,
      reputationScore: 0,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Don't set rememberMe or set to false
    useAuthStore.getState().setAuth(mockUser, mockToken);

    const storedToken = sessionStorageMock.getItem("accessToken");
    expect(storedToken).toBe(mockToken);
  });

  it("should remove tokens from storage on logout", () => {
    const mockUser = {
      id: "user1",
      email: "test@example.com",
      username: "testuser",
      role: "USER" as const,
      emailVerified: false,
      isVerified: false,
      isBanned: false,
      reputationScore: 0,
      avatarUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.setItem("rememberMe", "true");
    useAuthStore.getState().setAuth(mockUser, "token");
    useAuthStore.getState().clearAuth();

    const localToken = localStorageMock.getItem("accessToken");
    const sessionToken = sessionStorageMock.getItem("accessToken");
    const rememberMe = localStorageMock.getItem("rememberMe");
    expect(localToken).toBeNull();
    expect(sessionToken).toBeNull();
    expect(rememberMe).toBeNull();
  });
});
