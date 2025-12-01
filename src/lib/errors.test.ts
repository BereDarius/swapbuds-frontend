import { type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, isApiError } from "./errors";

describe("Error Utilities", () => {
  describe("getErrorMessage", () => {
    it("should return message from ApiError", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            message: "API error message",
          },
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        toJSON: () => ({}),
        name: "AxiosError",
        message: "Request failed",
      };

      expect(getErrorMessage(error)).toBe("API error message");
    });

    it("should return array of messages from ApiError", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {
            message: ["Error 1", "Error 2"],
          },
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        toJSON: () => ({}),
        name: "AxiosError",
        message: "Request failed",
      };

      expect(getErrorMessage(error)).toBe("Error 1, Error 2");
    });

    it("should return error message from Error instance", () => {
      const error = new Error("Standard error");
      expect(getErrorMessage(error)).toBe("Standard error");
    });

    it("should return string error as-is", () => {
      expect(getErrorMessage("String error")).toBe("String error");
    });

    it("should return default message for unknown error", () => {
      expect(getErrorMessage({})).toBe("An error occurred");
      expect(getErrorMessage(null)).toBe("An error occurred");
      expect(getErrorMessage(undefined)).toBe("An error occurred");
    });

    it("should return statusText if no message in response", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {},
          status: 404,
          statusText: "Not Found",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        toJSON: () => ({}),
        name: "AxiosError",
        message: "Request failed",
      };

      expect(getErrorMessage(error)).toBe("Not Found");
    });

    it("should return generic message for network error", () => {
      const error = {
        isAxiosError: true,
        config: {} as InternalAxiosRequestConfig,
        toJSON: () => ({}),
        name: "AxiosError",
        message: "Network Error",
      };

      // Without response, isApiError returns false, so we get the fallback
      expect(getErrorMessage(error)).toBe("An error occurred");
    });
  });

  describe("isApiError", () => {
    it("should return true for AxiosError", () => {
      const error = {
        isAxiosError: true,
        response: {
          data: {},
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        toJSON: () => ({}),
        name: "AxiosError",
        message: "Request failed",
      };

      expect(isApiError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Regular error");
      expect(isApiError(error)).toBe(false);
    });

    it("should return false for non-error objects", () => {
      expect(isApiError({})).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
      expect(isApiError("string")).toBe(false);
    });

    it("should return false for AxiosError without response", () => {
      const error = {
        isAxiosError: true,
        message: "Network Error",
      };

      expect(isApiError(error)).toBe(false);
    });
  });
});
