import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { logger } from "./logger";

/**
 * Base URL for all API requests
 * Falls back to localhost:3001 in development if env var not set
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Configured Axios instance for making API requests
 *
 * Features:
 * - Automatic JWT token attachment via request interceptor
 * - Automatic 401 error handling (token expiry, logout)
 * - withCredentials enabled for cookie-based auth if needed
 * - JSON content-type header by default
 *
 * @example
 * ```typescript
 * // Making a GET request
 * const response = await api.get('/items');
 *
 * // Making a POST request
 * const response = await api.post('/auth/login', { email, password });
 * ```
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Request interceptor - Automatically attaches JWT token to all requests
 *
 * Reads the access token from localStorage and adds it as a Bearer token
 * in the Authorization header for every outgoing request.
 *
 * This ensures authenticated endpoints receive the necessary credentials
 * without manually adding headers to each request.
 *
 * Also logs all API requests in development mode.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log API request
    logger.apiRequest(
      config.method?.toUpperCase() || "GET",
      config.url || "",
      config.data
    );

    // Check both localStorage and sessionStorage for token
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error("API Request Error", error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handles authentication errors globally
 *
 * Intercepts 401 Unauthorized responses (expired/invalid tokens) and:
 * 1. Clears authentication data from localStorage
 * 2. Redirects user to login page
 *
 * This provides a centralized logout mechanism when the backend
 * rejects the JWT token, preventing users from staying on protected
 * pages with invalid credentials.
 *
 * Also logs all API responses and errors.
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful API response
    logger.apiResponse(
      response.config.method?.toUpperCase() || "GET",
      response.config.url || "",
      response.status,
      response.data
    );
    return response;
  },
  async (error: AxiosError) => {
    // Skip logging 404 for verification endpoint (expected when no verification exists)
    const isVerificationNotFound =
      error.response?.status === 404 &&
      error.config?.url?.includes("/verification/me");

    if (!isVerificationNotFound) {
      // Log API error with full details
      logger.apiError(
        error.config?.method?.toUpperCase() || "UNKNOWN",
        error.config?.url || "UNKNOWN",
        error
      );
    }

    if (error.response?.status === 401) {
      // Don't redirect if it's a login or register request failure
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthEndpoint) {
        // Clear ALL auth-related storage including Zustand persist storage
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("auth-storage"); // Clear Zustand persist storage
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
