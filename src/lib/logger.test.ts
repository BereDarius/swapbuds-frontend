/**
 * Logger Tests
 */

import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Sentry before importing logger
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

// Mock console methods
const mockConsole = {
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
  warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
  info: vi.spyOn(console, "info").mockImplementation(() => {}),
  debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
};

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Development Mode", () => {
    beforeEach(async () => {
      vi.stubEnv("NODE_ENV", "development");
      // Re-import logger to pick up new NODE_ENV
      vi.resetModules();
      await import("./logger");
    });

    it("should log info messages to console in development", async () => {
      const { logger } = await import("./logger");
      logger.info("Test info message");

      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.info.mock.calls[0][0]).toContain("Test info message");
      expect(mockConsole.info.mock.calls[0][0]).toContain("[INFO]");
    });

    it("should log info messages with context", async () => {
      const { logger } = await import("./logger");
      const context = { userId: "123", action: "login" };
      logger.info("User action", context);

      expect(mockConsole.info).toHaveBeenCalled();
      const logOutput = mockConsole.info.mock.calls[0][0];
      expect(logOutput).toContain("User action");
      expect(logOutput).toContain("userId");
      expect(logOutput).toContain("123");
    });

    it("should log warn messages to console in development", async () => {
      const { logger } = await import("./logger");
      logger.warn("Test warning");

      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.warn.mock.calls[0][0]).toContain("Test warning");
      expect(mockConsole.warn.mock.calls[0][0]).toContain("[WARN]");
    });

    it("should log warn messages with context", async () => {
      const { logger } = await import("./logger");
      logger.warn("Performance issue", { loadTime: 5000 });

      expect(mockConsole.warn).toHaveBeenCalled();
      const logOutput = mockConsole.warn.mock.calls[0][0];
      expect(logOutput).toContain("Performance issue");
      expect(logOutput).toContain("loadTime");
    });

    it("should log error messages to console in development", async () => {
      const { logger } = await import("./logger");
      const error = new Error("Test error");
      logger.error("Error occurred", error);

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("Error occurred");
      expect(logOutput).toContain("[ERROR]");
      expect(logOutput).toContain("Test error");
    });

    it("should log error with stack trace", async () => {
      const { logger } = await import("./logger");
      const error = new Error("Test error with stack");
      logger.error("Stack trace test", error);

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("Stack:");
    });

    it("should log error with response data", async () => {
      const { logger } = await import("./logger");
      const error = new Error("API error") as Error & {
        response?: { data?: { message: string } };
      };
      error.response = { data: { message: "Invalid request" } };
      logger.error("API failed", error);

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("Response:");
      expect(logOutput).toContain("Invalid request");
    });

    it("should log debug messages in development", async () => {
      const { logger } = await import("./logger");
      logger.debug("Debug information");

      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.debug.mock.calls[0][0]).toContain("Debug information");
      expect(mockConsole.debug.mock.calls[0][0]).toContain("[DEBUG]");
    });

    it("should log API requests", async () => {
      const { logger } = await import("./logger");
      logger.apiRequest("GET", "/users", { page: 1 });

      expect(mockConsole.debug).toHaveBeenCalled();
      const logOutput = mockConsole.debug.mock.calls[0][0];
      expect(logOutput).toContain("API Request");
      expect(logOutput).toContain("GET");
      expect(logOutput).toContain("/users");
    });

    it("should log API responses", async () => {
      const { logger } = await import("./logger");
      logger.apiResponse("POST", "/auth/login", 200, { token: "abc123" });

      expect(mockConsole.debug).toHaveBeenCalled();
      const logOutput = mockConsole.debug.mock.calls[0][0];
      expect(logOutput).toContain("API Response");
      expect(logOutput).toContain("POST");
      expect(logOutput).toContain("/auth/login");
      expect(logOutput).toContain("200");
    });

    it("should log API errors with details", async () => {
      const { logger } = await import("./logger");
      const error = new Error("Request failed") as Error & {
        response?: { status?: number; statusText?: string };
      };
      error.response = { status: 404, statusText: "Not Found" };
      logger.apiError("GET", "/items/999", error);

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("API Error");
      expect(logOutput).toContain("GET");
      expect(logOutput).toContain("/items/999");
      expect(logOutput).toContain("404");
    });
  });

  describe("Production Mode", () => {
    beforeEach(async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();
      await import("./logger");
    });

    it("should not log info to console in production", async () => {
      const { logger } = await import("./logger");
      logger.info("Production info");

      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it("should not log warn to console in production", async () => {
      const { logger } = await import("./logger");
      logger.warn("Production warning");

      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it("should not log debug in production", async () => {
      const { logger } = await import("./logger");
      logger.debug("Production debug");

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it("should send errors to Sentry in production with error object", async () => {
      const { logger } = await import("./logger");
      const error = new Error("Production error");
      const context = { userId: "123" };
      logger.error("Error in production", error, context);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        level: "error",
        contexts: {
          custom: context,
        },
        tags: {
          logMessage: "Error in production",
        },
      });
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should send message to Sentry when no error object", async () => {
      const { logger } = await import("./logger");
      const context = { action: "checkout" };
      logger.error("Payment failed", undefined, context);

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Payment failed", {
        level: "error",
        contexts: {
          custom: context,
        },
      });
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it("should log errors to console in production", async () => {
      const { logger } = await import("./logger");
      logger.error("Critical error");

      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe("Error Formatting", () => {
    beforeEach(async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.resetModules();
      await import("./logger");
    });

    it("should handle non-Error objects", async () => {
      const { logger } = await import("./logger");
      logger.error("String error", "Something went wrong");

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("Something went wrong");
    });

    it("should format timestamps", async () => {
      const { logger } = await import("./logger");
      logger.info("Timestamp test");

      expect(mockConsole.info).toHaveBeenCalled();
      const logOutput = mockConsole.info.mock.calls[0][0];
      // Should contain ISO timestamp format
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should handle errors without stack traces", async () => {
      const { logger } = await import("./logger");
      const errorWithoutStack = { message: "Error without stack" };
      logger.error("No stack error", errorWithoutStack);

      expect(mockConsole.error).toHaveBeenCalled();
      const logOutput = mockConsole.error.mock.calls[0][0];
      expect(logOutput).toContain("Error without stack");
    });
  });
});
