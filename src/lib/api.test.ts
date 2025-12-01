/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

// Mock logger
vi.mock("./logger", () => ({
  logger: {
    apiRequest: vi.fn(),
    apiResponse: vi.fn(),
    apiError: vi.fn(),
    error: vi.fn(),
  },
}));

describe("API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // Clear axios interceptors state
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
  });

  describe("Configuration", () => {
    it("should have correct base URL", () => {
      expect(api.defaults.baseURL).toBe("http://localhost:3001/api");
    });

    it("should have withCredentials enabled", () => {
      expect(api.defaults.withCredentials).toBe(true);
    });

    it("should have JSON content-type header", () => {
      expect(api.defaults.headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("Request Interceptor", () => {
    it("should attach token from localStorage to request", async () => {
      localStorage.setItem("accessToken", "test-token");

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
        method: "GET",
        url: "/test",
      } as InternalAxiosRequestConfig;

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.request.handlers[0];
      const result = (await interceptor.fulfilled?.(config)) as any;

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should attach token from sessionStorage if not in localStorage", async () => {
      sessionStorage.setItem("accessToken", "session-token");

      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
        method: "GET",
        url: "/test",
      } as InternalAxiosRequestConfig;

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.request.handlers[0];
      const result = (await interceptor.fulfilled?.(config)) as any;

      expect(result.headers.Authorization).toBe("Bearer session-token");
    });

    it("should not attach token if none exists", async () => {
      const config: InternalAxiosRequestConfig = {
        headers: {} as any,
        method: "GET",
        url: "/test",
      } as InternalAxiosRequestConfig;

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.request.handlers[0];
      const result = (await interceptor.fulfilled?.(config)) as any;

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should handle request errors", async () => {
      const error = new Error("Request setup failed");
      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.request.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow(
        "Request setup failed"
      );
    });
  });

  describe("Response Interceptor", () => {
    it("should pass through successful responses", async () => {
      const response = {
        data: { success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {
          method: "GET",
          url: "/test",
        } as InternalAxiosRequestConfig,
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled?.(response);

      expect(result).toEqual(response);
    });

    it("should handle 401 error and redirect to login", async () => {
      localStorage.setItem("accessToken", "expired-token");
      localStorage.setItem("user", JSON.stringify({ id: "123" }));
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("auth-storage", JSON.stringify({ user: {} }));

      const error: AxiosError = {
        response: {
          status: 401,
          data: {},
          statusText: "Unauthorized",
          headers: {},
          config: {
            url: "/protected",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/protected",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 401",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();

      // Verify all auth data was cleared
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
      expect(localStorage.getItem("rememberMe")).toBeNull();
      expect(localStorage.getItem("auth-storage")).toBeNull();
      expect(window.location.href).toBe("/login");
    });

    it("should not redirect on 401 for login endpoint", async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: {},
          statusText: "Unauthorized",
          headers: {},
          config: {
            url: "/auth/login",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/auth/login",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 401",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();

      // Should not redirect for auth endpoints
      expect(window.location.href).not.toBe("/login");
    });

    it("should not redirect on 401 for register endpoint", async () => {
      const error: AxiosError = {
        response: {
          status: 401,
          data: {},
          statusText: "Unauthorized",
          headers: {},
          config: {
            url: "/auth/register",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/auth/register",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 401",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();

      expect(window.location.href).not.toBe("/login");
    });

    it("should pass through non-401 errors", async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: {},
          statusText: "Internal Server Error",
          headers: {},
          config: {
            url: "/test",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/test",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 500",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();
    });

    it("should not log 404 errors for verification endpoint", async () => {
      const { logger } = await import("./logger");

      const error: AxiosError = {
        response: {
          status: 404,
          data: {},
          statusText: "Not Found",
          headers: {},
          config: {
            url: "/verification/me",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/verification/me",
          method: "GET",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 404",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();

      // Should not log this specific error
      expect(logger.apiError).not.toHaveBeenCalled();
    });

    it("should log other 404 errors", async () => {
      const { logger } = await import("./logger");

      const error: AxiosError = {
        response: {
          status: 404,
          data: {},
          statusText: "Not Found",
          headers: {},
          config: {
            url: "/items/nonexistent",
            method: "GET",
          } as InternalAxiosRequestConfig,
        },
        config: {
          url: "/items/nonexistent",
          method: "GET",
        } as InternalAxiosRequestConfig,
        isAxiosError: true,
        name: "AxiosError",
        message: "Request failed with status code 404",
        toJSON: () => ({}),
      };

      // @ts-expect-error - accessing internal axios handlers
      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected?.(error)).rejects.toThrow();

      expect(logger.apiError).toHaveBeenCalledWith(
        "GET",
        "/items/nonexistent",
        error
      );
    });
  });
});
