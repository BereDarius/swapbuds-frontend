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
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Extracts user-friendly error message from API error
 * Handles both single messages and arrays of validation errors
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An error occurred",
): string {
  if (!isApiError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0]; // Return first validation error
  }

  return message || fallback;
}
