"use client";

import { useAuthStore } from "@/stores/authStore";
import type { Message } from "@/types/message";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextType {
  isConnected: boolean;
  // Message events
  onMessage: (callback: (message: Message) => void) => () => void;
  onMessageRead: (
    callback: (data: { messageId: string; conversationId: string }) => void,
  ) => () => void;
  onConversationRead: (
    callback: (data: { conversationId: string; count: number }) => void,
  ) => () => void;
  onMessageDeleted: (
    callback: (data: { messageId: string; conversationId: string }) => void,
  ) => () => void;
  // Typing events
  onTyping: (
    callback: (data: {
      conversationId: string;
      isTyping: boolean;
      typerUsername: string;
    }) => void,
  ) => () => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { user, accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !accessToken) {
      // Cleanup existing connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:4000",
      {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        auth: {
          token: accessToken,
        },
        autoConnect: true,
      },
    );

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("WebSocket connected:", newSocket.id);
      setIsConnected(true);

      // Subscribe to user's notification room
      if (user?.id) {
        newSocket.emit("subscribe", user.id);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;

    // Cleanup on unmount or user change
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user, accessToken]);

  // Message event listeners - use socketRef to avoid stale closure
  const onMessage = (callback: (message: Message) => void) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return () => {};
    currentSocket.on("message", callback);
    return () => {
      currentSocket.off("message", callback);
    };
  };

  const onMessageRead = (
    callback: (data: { messageId: string; conversationId: string }) => void,
  ) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return () => {};
    currentSocket.on("messageRead", callback);
    return () => {
      currentSocket.off("messageRead", callback);
    };
  };

  const onConversationRead = (
    callback: (data: { conversationId: string; count: number }) => void,
  ) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return () => {};
    currentSocket.on("conversationRead", callback);
    return () => {
      currentSocket.off("conversationRead", callback);
    };
  };

  const onMessageDeleted = (
    callback: (data: { messageId: string; conversationId: string }) => void,
  ) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return () => {};
    currentSocket.on("messageDeleted", callback);
    return () => {
      currentSocket.off("messageDeleted", callback);
    };
  };

  const onTyping = (
    callback: (data: {
      conversationId: string;
      isTyping: boolean;
      typerUsername: string;
    }) => void,
  ) => {
    const currentSocket = socketRef.current;
    if (!currentSocket) return () => {};
    currentSocket.on("typing", callback);
    return () => {
      currentSocket.off("typing", callback);
    };
  };

  const emitTyping = (conversationId: string, isTyping: boolean) => {
    const currentSocket = socketRef.current;
    if (currentSocket && user) {
      currentSocket.emit("typing", {
        conversationId,
        isTyping,
        username: user.username,
      });
    }
  };

  const value: SocketContextType = {
    isConnected,
    onMessage,
    onMessageRead,
    onConversationRead,
    onMessageDeleted,
    onTyping,
    emitTyping,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
