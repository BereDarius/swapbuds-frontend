import { AxiosError } from "axios";

/**
 * API error response structure
 * Matches NestJS default error format
 */
export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
}

/**
 * Type guard to check if error is an Axios error with API response
 */
export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === "object" &&
    (error as AxiosError).isAxiosError === true &&
    (error as AxiosError).response !== undefined
  );
}

/**
 * Extracts user-friendly error message from API error
 * Handles both single messages and arrays of validation errors
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  // Handle API errors
  if (isApiError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", "); // Join all validation errors
    }

    return message || error.response?.statusText || error.message || fallback;
  }

  // Handle regular Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
