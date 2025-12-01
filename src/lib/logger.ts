import * as Sentry from "@sentry/nextjs";

/**
 * Frontend logging utility
 * Logs errors to console in development and sends to Sentry in production
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Formats log entry with timestamp and context
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context) {
      formatted += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      const err = error as Error & { response?: { data?: unknown } };
      formatted += `\nError: ${err.message || String(error)}`;
      if (err.stack) {
        formatted += `\nStack: ${err.stack}`;
      }
      if (err.response) {
        formatted += `\nResponse: ${JSON.stringify(
          err.response.data,
          null,
          2
        )}`;
      }
    }

    return formatted;
  }

  /**
   * Sends log to console and optionally to external service
   */
  private log(entry: LogEntry) {
    const formatted = this.formatLog(entry);

    // Always log to console in development
    if (this.isDevelopment) {
      switch (entry.level) {
        case "error":
          console.error(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "info":
          console.info(formatted);
          break;
        case "debug":
          console.debug(formatted);
          break;
      }
    }

    // In production, send errors to Sentry for monitoring
    if (!this.isDevelopment && entry.level === "error") {
      if (entry.error) {
        // Send error to Sentry with context
        Sentry.captureException(entry.error, {
          level: "error",
          contexts: {
            custom: entry.context,
          },
          tags: {
            logMessage: entry.message,
          },
        });
      } else {
        // Send message to Sentry if no error object
        Sentry.captureMessage(entry.message, {
          level: "error",
          contexts: {
            custom: entry.context,
          },
        });
      }
      console.error(formatted); // Still log to console in production
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>) {
    this.log({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>) {
    this.log({
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Log error with full details
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    });
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log({
        level: "debug",
        message,
        timestamp: new Date().toISOString(),
        context,
      });
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: unknown) {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, { data });
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, data?: unknown) {
    this.debug(`API Response: ${method.toUpperCase()} ${url} - ${status}`, {
      data,
    });
  }

  /**
   * Log API error with full details
   */
  apiError(method: string, url: string, error: unknown) {
    const err = error as Error & {
      response?: { status?: number; statusText?: string };
    };
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error, {
      url,
      method,
      status: err.response?.status,
      statusText: err.response?.statusText,
    });
  }
}

export const logger = new Logger();
