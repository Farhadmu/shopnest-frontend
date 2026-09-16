"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getDeliverySocket } from "@/lib/socket/delivery-socket";

export type LiveTrackingStatus =
  | "LIVE"
  | "CONNECTING"
  | "RECONNECTING"
  | "STALE"
  | "LOCATION_UNAVAILABLE"
  | "DELIVERED";

export interface LiveLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  status?: string;
  updatedAt: string;
}

export interface UseDeliveryLiveTrackingOptions {
  deliveryId?: string;
  orderId?: string;
  initialStatus?: string;
  initialLocation?: { latitude: number; longitude: number; updatedAt?: string } | null;
  onStatusChange?: (newStatus: string) => void;
  onGeofenceNear?: (data: { message: string; distanceMeters: number }) => void;
}

export function useDeliveryLiveTracking({
  deliveryId,
  orderId,
  initialStatus,
  initialLocation,
  onStatusChange,
  onGeofenceNear,
}: UseDeliveryLiveTrackingOptions) {
  const [currentLocation, setCurrentLocation] = useState<LiveLocationData | null>(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          updatedAt: initialLocation.updatedAt || new Date().toISOString(),
        }
      : null
  );

  const [deliveryStatus, setDeliveryStatus] = useState<string>(initialStatus || "processing");
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [geofenceAlert, setGeofenceAlert] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial status/location if changed from parent
  useEffect(() => {
    if (initialStatus) setDeliveryStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (initialLocation && !currentLocation) {
      setCurrentLocation({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        updatedAt: initialLocation.updatedAt || new Date().toISOString(),
      });
      setLastHeartbeat(Date.now());
    }
  }, [initialLocation, currentLocation]);

  // Handle Socket Connection & Room Subscription
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!deliveryId && !orderId) return;

    const socket = getDeliverySocket();

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit(
        "join:delivery",
        { deliveryId, orderId },
        (res: { success: boolean; message?: string }) => {
          if (res?.success) {
            setIsJoined(true);
          }
        }
      );
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      setIsJoined(false);
    };

    const onLocationUpdate = (payload: LiveLocationData) => {
      setCurrentLocation(payload);
      setLastHeartbeat(Date.now());
      if (payload.status) {
        setDeliveryStatus(payload.status);
      }
    };

    const onStatusChangePayload = (payload: { status: string; failureReason?: string }) => {
      if (payload?.status) {
        setDeliveryStatus(payload.status);
        onStatusChange?.(payload.status);
      }
    };

    const onGeofenceAlert = (payload: { message: string; distanceMeters: number }) => {
      setGeofenceAlert(payload?.message || "Courier is nearby!");
      onGeofenceNear?.(payload);
    };

    const onDelivered = () => {
      setDeliveryStatus("delivered");
      onStatusChange?.("delivered");
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.on("connect", onConnect);
    }

    socket.on("disconnect", onDisconnect);
    socket.on("delivery:location_update", onLocationUpdate);
    socket.on("delivery:status_change", onStatusChangePayload);
    socket.on("geofence:approaching_customer", onGeofenceAlert);
    socket.on("delivery:delivered", onDelivered);

    return () => {
      socket.emit("leave:delivery", { deliveryId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("delivery:location_update", onLocationUpdate);
      socket.off("delivery:status_change", onStatusChangePayload);
      socket.off("geofence:approaching_customer", onGeofenceAlert);
      socket.off("delivery:delivered", onDelivered);
    };
  }, [deliveryId, orderId, onStatusChange, onGeofenceNear]);

  // Update seconds counter for freshness
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (currentLocation) {
        const diffSec = Math.floor((Date.now() - lastHeartbeat) / 1000);
        setSecondsSinceLastUpdate(diffSec);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastHeartbeat, currentLocation]);

  // Compute live tracking status
  let trackingState: LiveTrackingStatus = "CONNECTING";

  if (deliveryStatus === "delivered") {
    trackingState = "DELIVERED";
  } else if (!socketConnected) {
    trackingState = "RECONNECTING";
  } else if (!currentLocation) {
    trackingState = "LOCATION_UNAVAILABLE";
  } else if (secondsSinceLastUpdate > 60) {
    trackingState = "STALE";
  } else {
    trackingState = "LIVE";
  }

  const clearGeofenceAlert = useCallback(() => {
    setGeofenceAlert(null);
  }, []);

  return {
    currentLocation,
    deliveryStatus,
    trackingState,
    socketConnected,
    isJoined,
    geofenceAlert,
    clearGeofenceAlert,
    secondsSinceLastUpdate,
  };
}
