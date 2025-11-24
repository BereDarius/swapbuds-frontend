/**
 * Socket Helper - Configured Socket.IO Client
 *
 * Similar to api.ts, this provides pre-configured socket instances
 * that can be imported and used across the application.
 *
 * Features:
 * - Automatic JWT token attachment via auth option
 * - Consistent base URL configuration
 * - Proper transport configuration (websocket, polling)
 * - Multiple namespace support
 *
 * @example
 * ```typescript
 * import { getSocket, getNotificationsSocket } from '@/lib/socket/socket';
 *
 * const socket = getSocket();
 * socket.emit('joinConversation', conversationId);
 * ```
 */

import { io, type Socket } from "socket.io-client";

/**
 * Base URL for all socket connections
 * Falls back to localhost:4000 in development if env var not set
 */
const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:4000";

/**
 * Singleton socket instances
 */
let mainSocket: Socket | null = null;
let notificationsSocket: Socket | null = null;
let supportSocket: Socket | null = null;

/**
 * Socket configuration options
 */
interface SocketConfig {
  namespace?: string;
  token?: string;
  autoConnect?: boolean;
}

/**
 * Creates a configured socket instance
 *
 * @param config - Socket configuration options
 * @returns Configured Socket.IO client instance
 */
function createSocket(config: SocketConfig = {}): Socket {
  const { namespace = "", token, autoConnect = true } = config;

  const socketUrl = namespace ? `${SOCKET_URL}${namespace}` : SOCKET_URL;

  return io(socketUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: token ? { token } : undefined,
    autoConnect,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}

/**
 * Get or create the main socket instance (default namespace - messages)
 *
 * @param token - Optional JWT token for authentication
 * @returns Main socket instance
 */
export function getSocket(token?: string): Socket {
  if (!mainSocket || !mainSocket.connected) {
    mainSocket = createSocket({ token });
  }
  return mainSocket;
}

/**
 * Get or create the notifications socket instance (/notifications namespace)
 *
 * @param token - Optional JWT token for authentication
 * @returns Notifications socket instance
 */
export function getNotificationsSocket(token?: string): Socket {
  if (!notificationsSocket || !notificationsSocket.connected) {
    notificationsSocket = createSocket({ namespace: "/notifications", token });
  }
  return notificationsSocket;
}

/**
 * Get or create the support socket instance (/support namespace)
 *
 * @param token - Optional JWT token for authentication
 * @returns Support socket instance
 */
export function getSupportSocket(token?: string): Socket {
  if (!supportSocket || !supportSocket.connected) {
    supportSocket = createSocket({ namespace: "/support", token });
  }
  return supportSocket;
}

/**
 * Disconnect a specific socket instance
 *
 * @param socketType - Type of socket to disconnect
 */
export function disconnectSocket(
  socketType: "main" | "notifications" | "support" = "main",
): void {
  switch (socketType) {
    case "main":
      if (mainSocket) {
        mainSocket.disconnect();
        mainSocket = null;
      }
      break;
    case "notifications":
      if (notificationsSocket) {
        notificationsSocket.disconnect();
        notificationsSocket = null;
      }
      break;
    case "support":
      if (supportSocket) {
        supportSocket.disconnect();
        supportSocket = null;
      }
      break;
  }
}

/**
 * Disconnect all socket instances
 */
export function disconnectAllSockets(): void {
  disconnectSocket("main");
  disconnectSocket("notifications");
  disconnectSocket("support");
}

/**
 * Check if a socket is connected
 *
 * @param socketType - Type of socket to check
 * @returns Connection status
 */
export function isSocketConnected(
  socketType: "main" | "notifications" | "support" = "main",
): boolean {
  switch (socketType) {
    case "main":
      return mainSocket?.connected ?? false;
    case "notifications":
      return notificationsSocket?.connected ?? false;
    case "support":
      return supportSocket?.connected ?? false;
  }
}

const socketHelper = {
  getSocket,
  getNotificationsSocket,
  getSupportSocket,
  disconnectSocket,
  disconnectAllSockets,
  isSocketConnected,
};

export default socketHelper;
