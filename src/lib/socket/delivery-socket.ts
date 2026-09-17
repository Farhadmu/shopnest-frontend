import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocketUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL;
    }
    // Default to Express backend port on 5000
    const hostname = window.location.hostname || "localhost";
    return `http://${hostname}:5000`;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://127.0.0.1:5000";
}

export function getDeliverySocket(): Socket {
  if (!socketInstance && typeof window !== "undefined") {
    const url = getSocketUrl();
    socketInstance = io(url, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      console.log("🟢 [ShopNest Socket] Connected to realtime logistics server:", socketInstance?.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 [ShopNest Socket] Disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("⚠️ [ShopNest Socket] Connection warning:", error.message);
    });
  }

  return socketInstance!;
}

export function disconnectDeliverySocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
