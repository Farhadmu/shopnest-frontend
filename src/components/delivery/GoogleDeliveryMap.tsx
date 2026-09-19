"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  loadGoogleMaps,
  BD_DEFAULT_CENTER,
  SHOPNEST_DARK_MAP_STYLE,
  calculateDrivingRoute,
  getApproxCoordinatesFromAddress,
} from "@/lib/maps/google-maps-loader";
import { LiveTrackingStatus, LiveLocationData } from "@/hooks/delivery/useDeliveryLiveTracking";
import {
  FaMotorcycle,
  FaStore,
  FaHome,
  FaCompass,
  FaLocationArrow,
  FaRoute,
  FaExpand,
  FaCompress,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";

/** Map animation and rendering defaults */
export const MAP_TRANSITION_DURATION_MS = 350;
export const MAP_DEFAULT_ZOOM_FALLBACK = 13;

export interface RealStoreMarkerData {
  id: string;
  storeName: string;
  ownerName?: string;
  contactPhone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  status?: string;
  rating?: number;
  ratingCount?: number;
}

export interface FleetRiderMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  status?: string;
  isActive?: boolean;
  isLive?: boolean;
  activeDeliveryId?: string;
  activeOrderId?: string;
  activeDeliveriesCount?: number;
  assignedOrders?: Array<{ orderId: string; deliveryId: string; status: string }>;
  phone?: string;
  image?: string;
  rating?: number;
  vehicleType?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleRegistrationNumber?: string;
  serviceZone?: string[];
  lastSeenAt?: string;
  updatedAt?: string;
}

export interface MultiDeliveryItem {
  id: string;
  orderId: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
  status: string;
  customerName?: string;
  customerPhone?: string;
  sellerStoreName?: string;
  riderName?: string;
  riderPhone?: string;
  riderLocation?: { latitude: number; longitude: number; speed?: number; updatedAt?: string } | null;
  currentLocation?: { latitude: number; longitude: number; speed?: number; heading?: number; accuracy?: number; updatedAt?: string } | null;
  assignedRider?: { name?: string; phone?: string; vehicleType?: string; rating?: number } | null;
  deliveryFee?: number;
}

export type MapFilterOption = "all" | "online" | "offline" | "stores" | "active_orders" | "destinations";

export interface GoogleDeliveryMapProps {
  riderLocation?: LiveLocationData | null;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
  sellerLocation?: { latitude: number; longitude: number } | null;
  storeLocation?: { latitude: number; longitude: number } | null;
  customerLocation?: { latitude: number; longitude: number; label?: string } | null;
  status?: string;
  orderId?: string;
  deliveryId?: string;
  riderName?: string;
  riderPhone?: string;
  trackingState?: LiveTrackingStatus;
  secondsSinceLastUpdate?: number;
  fleetRiders?: FleetRiderMarkerData[];
  stores?: RealStoreMarkerData[];
  multiDeliveries?: MultiDeliveryItem[];
  heatmapPoints?: Array<{ latitude: number; longitude: number; weight?: number }>;
  className?: string;
  height?: string;
  showControls?: boolean;
  showFilterBar?: boolean;
  onMarkerClick?: (type: "rider" | "store" | "pickup" | "destination" | "customer", id: string, data?: any) => void;
}

/** Smoothly interpolate marker movement between coordinates */
function animateMarkerTo(
  marker: google.maps.Marker,
  targetLat: number,
  targetLng: number,
  durationMs = MAP_TRANSITION_DURATION_MS
) {
  const startPos = marker.getPosition();
  if (!startPos) {
    marker.setPosition({ lat: targetLat, lng: targetLng });
    return;
  }
  const startLat = startPos.lat();
  const startLng = startPos.lng();
  if (Math.abs(startLat - targetLat) < 0.000001 && Math.abs(startLng - targetLng) < 0.000001) {
    return;
  }
  const startTime = performance.now();
  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    // ease-out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentLat = startLat + (targetLat - startLat) * ease;
    const currentLng = startLng + (targetLng - startLng) * ease;
    marker.setPosition({ lat: currentLat, lng: currentLng });
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export function GoogleDeliveryMap({
  riderLocation,
  pickupAddress = "Merchant Store",
  deliveryAddress = "Customer Destination",
  pickupCoordinates,
  deliveryCoordinates,
  sellerLocation,
  storeLocation,
  customerLocation,
  status = "in_transit",
  orderId,
  deliveryId,
  riderName = "Assigned Delivery Partner",
  riderPhone,
  trackingState = "CONNECTING",
  secondsSinceLastUpdate = 0,
  fleetRiders,
  stores,
  multiDeliveries,
  heatmapPoints,
  className = "",
  height = "h-80 sm:h-96",
  showControls = true,
  showFilterBar = false,
  onMarkerClick,
}: GoogleDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const heatmapLayerRef = useRef<any | null>(null);

  const markersRef = useRef<{
    pickup?: google.maps.Marker;
    destination?: google.maps.Marker;
    rider?: google.maps.Marker;
    customer?: google.maps.Marker;
    stores: Map<string, google.maps.Marker>;
    fleet: Map<string, google.maps.Marker>;
    multiPickups: Map<string, google.maps.Marker>;
    multiDestinations: Map<string, google.maps.Marker>;
    multiRiders: Map<string, google.maps.Marker>;
  }>({
    stores: new Map(),
    fleet: new Map(),
    multiPickups: new Map(),
    multiDestinations: new Map(),
    multiRiders: new Map(),
  });

  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapsLoaded, setMapsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeAvailable, setRouteAvailable] = useState<boolean | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance?: string; duration?: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<MapFilterOption>("all");

  const isDelivered = status === "delivered" || trackingState === "DELIVERED";
  const isLive = trackingState === "LIVE";
  const isStale = trackingState === "STALE";

  // ─── 1. Initialize Google Map ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted) return;
        if (!maps) {
          setLoadError("Google Maps API key is not configured or failed to load.");
          setMapsLoaded(false);
          return;
        }

        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const resolvedP =
            pickupCoordinates?.latitude && pickupCoordinates?.longitude
              ? pickupCoordinates
              : storeLocation?.latitude && storeLocation?.longitude
              ? storeLocation
              : getApproxCoordinatesFromAddress(pickupAddress);
          const resolvedD =
            deliveryCoordinates?.latitude && deliveryCoordinates?.longitude
              ? deliveryCoordinates
              : getApproxCoordinatesFromAddress(deliveryAddress);

          const initialCenter =
            riderLocation?.latitude && riderLocation?.longitude
              ? { lat: riderLocation.latitude, lng: riderLocation.longitude }
              : resolvedP?.latitude && resolvedP?.longitude
              ? { lat: resolvedP.latitude, lng: resolvedP.longitude }
              : resolvedD?.latitude && resolvedD?.longitude
              ? { lat: resolvedD.latitude, lng: resolvedD.longitude }
              : BD_DEFAULT_CENTER;

          const map = new maps.Map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 13,
            styles: SHOPNEST_DARK_MAP_STYLE,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
          });

          mapInstanceRef.current = map;

          const renderer = new maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#3b82f6",
              strokeWeight: 4,
              strokeOpacity: 0.85,
            },
          });
          directionsRendererRef.current = renderer;
        }

        setMapsLoaded(true);
        setLoadError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(err?.message || "Failed to load Google Maps");
        setMapsLoaded(false);
      });

    return () => {
      isMounted = false;
      // Clean up all markers on component unmount
      if (markersRef.current.pickup) markersRef.current.pickup.setMap(null);
      if (markersRef.current.destination) markersRef.current.destination.setMap(null);
      if (markersRef.current.rider) markersRef.current.rider.setMap(null);
      if (markersRef.current.customer) markersRef.current.customer.setMap(null);
      markersRef.current.stores.forEach((m) => m.setMap(null));
      markersRef.current.fleet.forEach((m) => m.setMap(null));
      markersRef.current.multiPickups.forEach((m) => m.setMap(null));
      markersRef.current.multiDestinations.forEach((m) => m.setMap(null));
      markersRef.current.multiRiders.forEach((m) => m.setMap(null));
      markersRef.current.stores.clear();
      markersRef.current.fleet.clear();
      markersRef.current.multiPickups.clear();
      markersRef.current.multiDestinations.clear();
      markersRef.current.multiRiders.clear();
      if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
      if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
      if (heatmapLayerRef.current) heatmapLayerRef.current.setMap(null);
    };
  }, []);

  // ─── 2. Single Delivery: Pickup & Destination Markers ────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    if (multiDeliveries && multiDeliveries.length > 0) return;

    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    const rawP =
      pickupCoordinates?.latitude && pickupCoordinates?.longitude
        ? pickupCoordinates
        : storeLocation?.latitude && storeLocation?.longitude
        ? storeLocation
        : getApproxCoordinatesFromAddress(pickupAddress);
    const rawD =
      deliveryCoordinates?.latitude && deliveryCoordinates?.longitude
        ? deliveryCoordinates
        : getApproxCoordinatesFromAddress(deliveryAddress);

    let pCoords = rawP;
    let dCoords = rawD;

    if (
      pCoords &&
      dCoords &&
      Math.abs(pCoords.latitude - dCoords.latitude) < 0.0008 &&
      Math.abs(pCoords.longitude - dCoords.longitude) < 0.0008
    ) {
      dCoords = {
        latitude: dCoords.latitude + 0.0025,
        longitude: dCoords.longitude + 0.0025,
      };
    }

    // Pickup Marker (Store)
    if (pCoords?.latitude && pCoords?.longitude && !isDelivered) {
      const pos = { lat: pCoords.latitude, lng: pCoords.longitude };
      if (!markersRef.current.pickup) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Store Pickup: ${pickupAddress}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="17" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="19" y="24" font-size="16" text-anchor="middle" fill="#ffffff">🏪</text>
                </svg>`
              ),
            scaledSize: new maps.Size(38, 38),
            anchor: new maps.Point(19, 19),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
              <strong style="font-size: 12px; color: #2563eb;">🏪 Store Pickup Location</strong>
              <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${pickupAddress}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("pickup", orderId || "pickup", { address: pickupAddress, coordinates: pCoords });
        });

        markersRef.current.pickup = marker;
      } else {
        animateMarkerTo(markersRef.current.pickup, pos.lat, pos.lng);
        markersRef.current.pickup.setVisible(true);
      }
    } else if (markersRef.current.pickup) {
      markersRef.current.pickup.setVisible(false);
    }

    // Destination Marker (Customer)
    if (dCoords?.latitude && dCoords?.longitude && !isDelivered) {
      const pos = { lat: dCoords.latitude, lng: dCoords.longitude };
      if (!markersRef.current.destination) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Customer Delivery: ${deliveryAddress}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="17" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="19" y="24" font-size="16" text-anchor="middle" fill="#ffffff">🏠</text>
                </svg>`
              ),
            scaledSize: new maps.Size(38, 38),
            anchor: new maps.Point(19, 19),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
              <strong style="font-size: 12px; color: #10b981;">🏠 Customer Destination</strong>
              <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${deliveryAddress}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("destination", orderId || "dest", { address: deliveryAddress, coordinates: dCoords });
        });

        markersRef.current.destination = marker;
      } else {
        animateMarkerTo(markersRef.current.destination, pos.lat, pos.lng);
        markersRef.current.destination.setVisible(true);
      }
    } else if (markersRef.current.destination) {
      markersRef.current.destination.setVisible(false);
    }
  }, [mapsLoaded, pickupCoordinates, deliveryCoordinates, storeLocation, pickupAddress, deliveryAddress, multiDeliveries, isDelivered, onMarkerClick, orderId]);

  // ─── 3. Single Rider Marker (Live GPS / Last Known) ──────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    if (riderLocation?.latitude && riderLocation?.longitude && !isDelivered) {
      const pos = { lat: riderLocation.latitude, lng: riderLocation.longitude };
      const isRiderLive = isLive;
      const fillColor = isRiderLive ? "#f59e0b" : "#64748b";
      const ringColor = isRiderLive ? "#10b981" : "#cbd5e1";

      if (!markersRef.current.rider) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Rider: ${riderName} (${isRiderLive ? "Live" : "Last Known"})`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="19" fill="${fillColor}" stroke="${ringColor}" stroke-width="3"/>
                  <circle cx="21" cy="21" r="13" fill="#ffffff" opacity="0.2"/>
                  <text x="21" y="27" font-size="18" text-anchor="middle" fill="#ffffff">🛵</text>
                </svg>`
              ),
            scaledSize: new maps.Size(42, 42),
            anchor: new maps.Point(21, 21),
          },
          zIndex: 999,
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px; font-family: sans-serif; min-width: 190px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 15px;">🛵</span>
                <strong style="font-size: 13px; color: #0f172a;">${riderName}</strong>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.5;">
                <div><strong>State:</strong> <span style="color: ${isRiderLive ? '#10b981' : '#64748b'}; font-weight: bold;">${isRiderLive ? '🟢 LIVE GPS' : '⚪ LAST KNOWN'}</span></div>
                ${orderId ? `<div><strong>Order:</strong> #${orderId}</div>` : ""}
                ${deliveryId ? `<div><strong>Mission ID:</strong> #${deliveryId.slice(-6)}</div>` : ""}
                <div><strong>Status:</strong> <span style="text-transform: uppercase; color: #2563eb; font-weight: bold;">${status.replace(/_/g, " ")}</span></div>
                ${riderLocation.speed !== undefined ? `<div><strong>Speed:</strong> ${riderLocation.speed} km/h</div>` : ""}
                ${riderLocation.accuracy !== undefined ? `<div><strong>GPS Accuracy:</strong> ±${Math.round(riderLocation.accuracy)}m</div>` : ""}
                <div><strong>Recorded At:</strong> ${new Date(riderLocation.updatedAt).toLocaleTimeString()}</div>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("rider", deliveryId || "rider", { name: riderName, location: riderLocation, isLive: isRiderLive });
        });

        markersRef.current.rider = marker;
      } else {
        animateMarkerTo(markersRef.current.rider, pos.lat, pos.lng);
        markersRef.current.rider.setVisible(true);
      }
    } else if (markersRef.current.rider) {
      if (isDelivered) {
        markersRef.current.rider.setVisible(false);
      }
    }
  }, [mapsLoaded, riderLocation, riderName, orderId, deliveryId, status, isDelivered, isLive, onMarkerClick]);

  // ─── 4. Customer Self Location Marker with Blue Pulse ("📍 You") ─────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    if (customerLocation?.latitude && customerLocation?.longitude) {
      const pos = { lat: customerLocation.latitude, lng: customerLocation.longitude };
      if (!markersRef.current.customer) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: customerLocation.label || "You (Your Location)",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="17" fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
                  <circle cx="19" cy="19" r="6" fill="#ffffff"/>
                </svg>`
              ),
            scaledSize: new maps.Size(38, 38),
            anchor: new maps.Point(19, 19),
          },
          zIndex: 960,
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: sans-serif; font-size: 11px;">
              <strong style="color: #0284c7;">📍 ${customerLocation.label || "Your Live GPS Location"}</strong>
              <p style="margin: 3px 0 0; color: #475569;">${customerLocation.latitude.toFixed(4)}, ${customerLocation.longitude.toFixed(4)}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("customer", "customer_self", customerLocation);
        });

        markersRef.current.customer = marker;
      } else {
        animateMarkerTo(markersRef.current.customer, pos.lat, pos.lng);
        markersRef.current.customer.setVisible(true);
      }
    } else if (markersRef.current.customer) {
      markersRef.current.customer.setVisible(false);
    }
  }, [mapsLoaded, customerLocation, onMarkerClick]);

  // ─── 5. Real Seller Stores Markers with Purple Pin & Dispatch Badge (Admin Radar) ───────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;
    const currentStoresMap = markersRef.current.stores;

    if (!stores || stores.length === 0) {
      currentStoresMap.forEach((m) => m.setMap(null));
      currentStoresMap.clear();
      return;
    }

    const activeStoreIds = new Set(stores.map((s) => s.id));
    currentStoresMap.forEach((marker, id) => {
      if (!activeStoreIds.has(id)) {
        marker.setMap(null);
        currentStoresMap.delete(id);
      }
    });

    stores.forEach((store) => {
      if (typeof store.latitude !== "number" || typeof store.longitude !== "number") return;
      const pos = { lat: store.latitude, lng: store.longitude };
      const existing = currentStoresMap.get(store.id);

      if (existing) {
        animateMarkerTo(existing, pos.lat, pos.lng);
      } else {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Store: ${store.storeName}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="17" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="19" y="24" font-size="16" text-anchor="middle" fill="#ffffff">🏪</text>
                </svg>`
              ),
            scaledSize: new maps.Size(38, 38),
            anchor: new maps.Point(19, 19),
          },
          zIndex: 850,
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px; font-family: sans-serif; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 16px;">🏪</span>
                <strong style="font-size: 13px; color: #1e3a8a;">${store.storeName}</strong>
              </div>
              <div style="font-size: 11px; color: #475569; line-height: 1.5;">
                ${store.ownerName ? `<div><strong>Merchant:</strong> ${store.ownerName}</div>` : ""}
                ${store.address ? `<div><strong>Address:</strong> ${store.address}</div>` : ""}
                <div><strong>GPS:</strong> ${store.latitude.toFixed(4)}, ${store.longitude.toFixed(4)}</div>
                ${store.status ? `<div><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${store.status === 'approved' ? '#16a34a' : '#ea580c'}">${store.status}</span></div>` : ""}
                ${store.rating ? `<div><strong>Rating:</strong> ⭐ ${store.rating.toFixed(1)}</div>` : ""}
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("store", store.id, store);
        });

        currentStoresMap.set(store.id, marker);
      }
    });
  }, [mapsLoaded, stores, onMarkerClick]);

  // ─── 6. Multi-Delivery Mode (Delivery Partner / Seller Multi-Orders) ─────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    if (!multiDeliveries) return;

    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    const currentPickups = markersRef.current.multiPickups;
    const currentDestinations = markersRef.current.multiDestinations;
    const currentMultiRiders = markersRef.current.multiRiders;
    const activeDelIds = new Set(multiDeliveries.map((d) => d.id));

    // Cleanup finished/delivered missions automatically (requirement 20)
    currentPickups.forEach((marker, id) => {
      if (!activeDelIds.has(id)) {
        marker.setMap(null);
        currentPickups.delete(id);
      }
    });

    currentDestinations.forEach((marker, id) => {
      if (!activeDelIds.has(id)) {
        marker.setMap(null);
        currentDestinations.delete(id);
      }
    });

    currentMultiRiders.forEach((marker, id) => {
      if (!activeDelIds.has(id)) {
        marker.setMap(null);
        currentMultiRiders.delete(id);
      }
    });

    multiDeliveries.forEach((del, idx) => {
      const rawP =
        del.pickupCoordinates?.latitude && del.pickupCoordinates?.longitude
          ? del.pickupCoordinates
          : getApproxCoordinatesFromAddress(del.pickupAddress);

      let rawD =
        del.deliveryCoordinates?.latitude && del.deliveryCoordinates?.longitude
          ? del.deliveryCoordinates
          : getApproxCoordinatesFromAddress(del.deliveryAddress);

      let pCoords = rawP;
      let dCoords = rawD;

      if (
        pCoords &&
        dCoords &&
        Math.abs(pCoords.latitude - dCoords.latitude) < 0.0008 &&
        Math.abs(pCoords.longitude - dCoords.longitude) < 0.0008
      ) {
        dCoords = {
          latitude: dCoords.latitude + 0.0025 * (idx + 1),
          longitude: dCoords.longitude + 0.0025 * (idx + 1),
        };
      }

      // Store Pickup Marker
      if (pCoords?.latitude && pCoords?.longitude && del.status !== "delivered") {
        const pPos = { lat: pCoords.latitude, lng: pCoords.longitude };
        const existingP = currentPickups.get(del.id);

        if (existingP) {
          animateMarkerTo(existingP, pPos.lat, pPos.lng);
        } else {
          const pMarker = new maps.Marker({
            position: pPos,
            map,
            title: `Store Pickup #${del.orderId.slice(-6)}: ${del.pickupAddress || ""}`,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
                    <circle cx="17" cy="17" r="15" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                    <text x="17" y="22" font-size="14" text-anchor="middle" fill="#ffffff">🏪</text>
                  </svg>`
                ),
              scaledSize: new maps.Size(34, 34),
              anchor: new maps.Point(17, 17),
            },
          });

          const pInfo = new maps.InfoWindow({
            content: `
              <div style="color: #0f172a; padding: 6px; font-family: sans-serif; font-size: 11px;">
                <strong style="color: #2563eb;">🏪 Store Pickup (Order #${del.orderId.slice(-6)})</strong>
                <p style="margin: 3px 0 0; color: #475569;">${del.pickupAddress || "Merchant Store"}</p>
                <div style="margin-top: 4px; font-size: 10px; color: #64748b;">Status: <strong>${del.status.replace(/_/g, " ")}</strong></div>
              </div>
            `,
          });

          pMarker.addListener("click", () => {
            activeInfoWindowRef.current?.close();
            pInfo.open(map, pMarker);
            activeInfoWindowRef.current = pInfo;
            onMarkerClick?.("pickup", del.id, del);
          });

          currentPickups.set(del.id, pMarker);
        }
      }

      // Customer Destination Marker
      if (dCoords?.latitude && dCoords?.longitude && del.status !== "delivered") {
        const dPos = { lat: dCoords.latitude, lng: dCoords.longitude };
        const existingD = currentDestinations.get(del.id);

        if (existingD) {
          animateMarkerTo(existingD, dPos.lat, dPos.lng);
        } else {
          const dMarker = new maps.Marker({
            position: dPos,
            map,
            title: `Destination #${del.orderId.slice(-6)}: ${del.deliveryAddress || ""}`,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
                    <circle cx="17" cy="17" r="15" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                    <text x="17" y="22" font-size="14" text-anchor="middle" fill="#ffffff">🏠</text>
                  </svg>`
                ),
              scaledSize: new maps.Size(34, 34),
              anchor: new maps.Point(17, 17),
            },
          });

          const dInfo = new maps.InfoWindow({
            content: `
              <div style="color: #0f172a; padding: 6px; font-family: sans-serif; font-size: 11px;">
                <strong style="color: #10b981;">🏠 Customer Destination (Order #${del.orderId.slice(-6)})</strong>
                <p style="margin: 3px 0 0; color: #475569;">${del.deliveryAddress || "Customer Address"}</p>
                <div style="margin-top: 4px; font-size: 10px; color: #64748b;">
                  <div>Status: <strong>${del.status.replace(/_/g, " ")}</strong></div>
                  ${del.customerName ? `<div>Customer: <strong>${del.customerName}</strong></div>` : ""}
                  ${del.assignedRider?.name || del.riderName ? `<div>Courier: <strong>${del.assignedRider?.name || del.riderName}</strong></div>` : ""}
                </div>
              </div>
            `,
          });

          dMarker.addListener("click", () => {
            activeInfoWindowRef.current?.close();
            dInfo.open(map, dMarker);
            activeInfoWindowRef.current = dInfo;
            onMarkerClick?.("destination", del.id, del);
          });

          currentDestinations.set(del.id, dMarker);
        }
      }

      // Assigned Courier Marker
      const rCoords = del.currentLocation || del.riderLocation;
      if (rCoords?.latitude && rCoords?.longitude && del.status !== "delivered") {
        const rPos = { lat: rCoords.latitude, lng: rCoords.longitude };
        const existingR = currentMultiRiders.get(del.id);
        const rName = del.assignedRider?.name || del.riderName || "Delivery Partner";

        if (existingR) {
          animateMarkerTo(existingR, rPos.lat, rPos.lng);
        } else {
          const rMarker = new maps.Marker({
            position: rPos,
            map,
            title: `Courier: ${rName} (Order #${del.orderId.slice(-6)})`,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="17" fill="#f59e0b" stroke="#10b981" stroke-width="2.5"/>
                    <text x="19" y="24" font-size="15" text-anchor="middle" fill="#ffffff">🛵</text>
                  </svg>`
                ),
              scaledSize: new maps.Size(38, 38),
              anchor: new maps.Point(19, 19),
            },
            zIndex: 900,
          });

          const rInfo = new maps.InfoWindow({
            content: `
              <div style="color: #0f172a; padding: 6px; font-family: sans-serif; font-size: 11px;">
                <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 3px;">
                  <span>🛵</span> <strong style="color: #f59e0b;">${rName}</strong>
                </div>
                <div style="color: #475569; line-height: 1.4;">
                  <div>Order: <strong>#${del.orderId.slice(-6)}</strong></div>
                  <div>Status: <span style="color: #2563eb; font-weight: bold; text-transform: uppercase;">${del.status.replace(/_/g, " ")}</span></div>
                  ${rCoords.speed !== undefined ? `<div>Speed: <strong>${rCoords.speed} km/h</strong></div>` : ""}
                  ${del.assignedRider?.phone ? `<div>Phone: <strong>${del.assignedRider.phone}</strong></div>` : ""}
                </div>
              </div>
            `,
          });

          rMarker.addListener("click", () => {
            activeInfoWindowRef.current?.close();
            rInfo.open(map, rMarker);
            activeInfoWindowRef.current = rInfo;
            onMarkerClick?.("rider", del.id, del);
          });

          currentMultiRiders.set(del.id, rMarker);
        }
      }
    });
  }, [mapsLoaded, multiDeliveries, onMarkerClick]);

  // ─── 7. Admin Multi-Rider Fleet Markers: Online Pulse & Offline Last-Seen Timestamp ────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    if (!fleetRiders) return;

    const maps = window.google.maps;
    const map = mapInstanceRef.current;
    const currentFleetMap = markersRef.current.fleet;
    const activeIds = new Set(fleetRiders.map((r) => r.id));

    // Remove obsolete markers
    currentFleetMap.forEach((marker, riderId) => {
      if (!activeIds.has(riderId)) {
        marker.setMap(null);
        currentFleetMap.delete(riderId);
      }
    });

    fleetRiders.forEach((rider) => {
      if (typeof rider.latitude !== "number" || typeof rider.longitude !== "number") return;
      const pos = { lat: rider.latitude, lng: rider.longitude };
      const isOnline = rider.isLive ?? (rider.isActive || rider.status === "available" || rider.status === "busy");
      const fillColor = isOnline ? "#f59e0b" : "#64748b";
      const ringColor = isOnline ? "#10b981" : "#cbd5e1";

      const existing = currentFleetMap.get(rider.id);

      if (existing) {
        animateMarkerTo(existing, pos.lat, pos.lng);
      } else {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `${rider.name} (${isOnline ? "Live" : "Last Known"})`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r="17" fill="${fillColor}" stroke="${ringColor}" stroke-width="2.5"/>
                  <text x="19" y="24" font-size="15" text-anchor="middle" fill="#ffffff">🛵</text>
                </svg>`
              ),
            scaledSize: new maps.Size(38, 38),
            anchor: new maps.Point(19, 19),
          },
        });

        const lastSeenStr = rider.lastSeenAt
          ? new Date(rider.lastSeenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : rider.updatedAt
          ? new Date(rider.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Recently";

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px; font-family: sans-serif; min-width: 200px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <strong style="font-size: 13px; color: #0f172a;">${rider.name}</strong>
                <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${isOnline ? '#dcfce7; color: #166534;' : '#f1f5f9; color: #475569;'}">
                  ${isOnline ? '🟢 LIVE' : `⚪ Last known ${lastSeenStr}`}
                </span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.5;">
                ${rider.activeOrderId ? `<div><strong>Active Order:</strong> #${rider.activeOrderId}</div>` : `<div><strong>Status:</strong> ${rider.status || "Offline"}</div>`}
                ${rider.activeDeliveriesCount !== undefined ? `<div><strong>Active Deliveries:</strong> ${rider.activeDeliveriesCount}</div>` : ""}
                ${rider.speed !== undefined ? `<div><strong>Speed:</strong> ${rider.speed} km/h</div>` : ""}
                ${rider.accuracy !== undefined ? `<div><strong>GPS Accuracy:</strong> ±${Math.round(rider.accuracy)}m</div>` : ""}
                ${rider.vehicleType ? `<div><strong>Vehicle:</strong> ${rider.vehicleType} ${rider.vehicleModel || ""}</div>` : ""}
                ${rider.phone ? `<div><strong>Contact:</strong> ${rider.phone}</div>` : ""}
                ${rider.rating ? `<div><strong>Rating:</strong> ⭐ ${rider.rating.toFixed(1)}</div>` : ""}
                <div style="margin-top: 3px; font-size: 10px; color: #94a3b8;">GPS Timestamp: ${lastSeenStr}</div>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
          onMarkerClick?.("rider", rider.id, rider);
        });

        currentFleetMap.set(rider.id, marker);
      }
    });
  }, [mapsLoaded, fleetRiders, onMarkerClick]);

  // ─── 8. Filter Logic: Toggle Marker Visibility ──────────────────────────────
  useEffect(() => {
    if (!mapsLoaded) return;

    // Fleet Riders
    if (markersRef.current.fleet && fleetRiders) {
      const fleetMap = markersRef.current.fleet;
      fleetRiders.forEach((rider) => {
        const marker = fleetMap.get(rider.id);
        if (!marker) return;
        const isOnline = rider.isLive ?? (rider.isActive || rider.status === "available" || rider.status === "busy");
        if (activeFilter === "all") marker.setVisible(true);
        else if (activeFilter === "online") marker.setVisible(Boolean(isOnline));
        else if (activeFilter === "offline") marker.setVisible(!isOnline);
        else marker.setVisible(false);
      });
    }

    // Stores
    if (markersRef.current.stores) {
      markersRef.current.stores.forEach((marker) => {
        if (activeFilter === "all" || activeFilter === "stores") marker.setVisible(true);
        else marker.setVisible(false);
      });
    }

    // Pickups
    if (markersRef.current.multiPickups) {
      markersRef.current.multiPickups.forEach((marker) => {
        if (activeFilter === "all" || activeFilter === "active_orders" || activeFilter === "stores") marker.setVisible(true);
        else marker.setVisible(false);
      });
    }

    // Destinations
    if (markersRef.current.multiDestinations) {
      markersRef.current.multiDestinations.forEach((marker) => {
        if (activeFilter === "all" || activeFilter === "active_orders" || activeFilter === "destinations") marker.setVisible(true);
        else marker.setVisible(false);
      });
    }
  }, [mapsLoaded, activeFilter, fleetRiders]);

  // ─── 9. Auto Fit Bounds Across All Active Markers ────────────────────────────
  const handleFitBounds = useCallback(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;
    const bounds = new maps.LatLngBounds();
    let count = 0;

    if (riderLocation?.latitude && riderLocation?.longitude && !isDelivered) {
      bounds.extend({ lat: riderLocation.latitude, lng: riderLocation.longitude });
      count++;
    }

    if (customerLocation?.latitude && customerLocation?.longitude) {
      bounds.extend({ lat: customerLocation.latitude, lng: customerLocation.longitude });
      count++;
    }

    const resolvedP =
      pickupCoordinates?.latitude && pickupCoordinates?.longitude
        ? pickupCoordinates
        : storeLocation?.latitude && storeLocation?.longitude
        ? storeLocation
        : getApproxCoordinatesFromAddress(pickupAddress);
    const resolvedD =
      deliveryCoordinates?.latitude && deliveryCoordinates?.longitude
        ? deliveryCoordinates
        : getApproxCoordinatesFromAddress(deliveryAddress);

    if (resolvedP?.latitude && resolvedP?.longitude && !isDelivered) {
      bounds.extend({ lat: resolvedP.latitude, lng: resolvedP.longitude });
      count++;
    }
    if (resolvedD?.latitude && resolvedD?.longitude && !isDelivered) {
      bounds.extend({ lat: resolvedD.latitude, lng: resolvedD.longitude });
      count++;
    }

    if (stores && stores.length > 0) {
      stores.forEach((s) => {
        if (typeof s.latitude === "number" && typeof s.longitude === "number") {
          bounds.extend({ lat: s.latitude, lng: s.longitude });
          count++;
        }
      });
    }

    if (fleetRiders && fleetRiders.length > 0) {
      fleetRiders.forEach((r) => {
        if (typeof r.latitude === "number" && typeof r.longitude === "number") {
          bounds.extend({ lat: r.latitude, lng: r.longitude });
          count++;
        }
      });
    }

    if (multiDeliveries && multiDeliveries.length > 0) {
      multiDeliveries.forEach((d) => {
        const mp =
          d.pickupCoordinates?.latitude && d.pickupCoordinates?.longitude
            ? d.pickupCoordinates
            : getApproxCoordinatesFromAddress(d.pickupAddress);
        const md =
          d.deliveryCoordinates?.latitude && d.deliveryCoordinates?.longitude
            ? d.deliveryCoordinates
            : getApproxCoordinatesFromAddress(d.deliveryAddress);
        const mr = d.currentLocation || d.riderLocation;

        if (mp?.latitude && mp?.longitude) {
          bounds.extend({ lat: mp.latitude, lng: mp.longitude });
          count++;
        }
        if (md?.latitude && md?.longitude) {
          bounds.extend({ lat: md.latitude, lng: md.longitude });
          count++;
        }
        if (mr?.latitude && mr?.longitude) {
          bounds.extend({ lat: mr.latitude, lng: mr.longitude });
          count++;
        }
      });
    }

    if (count > 1) {
      map.fitBounds(bounds, 60);
    } else if (count === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    } else {
      map.setCenter(BD_DEFAULT_CENTER);
      map.setZoom(12);
    }
  }, [mapsLoaded, riderLocation, customerLocation, pickupCoordinates, deliveryCoordinates, storeLocation, pickupAddress, deliveryAddress, stores, fleetRiders, multiDeliveries, isDelivered]);

  useEffect(() => {
    handleFitBounds();
  }, [handleFitBounds]);

  // ─── 10. Directions Route Polyline (Single Delivery) ─────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !directionsRendererRef.current) return;
    if (isDelivered || (multiDeliveries && multiDeliveries.length > 1)) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
      setRouteAvailable(null);
      return;
    }

    const resolvedP =
      pickupCoordinates?.latitude && pickupCoordinates?.longitude
        ? pickupCoordinates
        : storeLocation?.latitude && storeLocation?.longitude
        ? storeLocation
        : getApproxCoordinatesFromAddress(pickupAddress);
    const resolvedD =
      deliveryCoordinates?.latitude && deliveryCoordinates?.longitude
        ? deliveryCoordinates
        : getApproxCoordinatesFromAddress(deliveryAddress);

    const origin =
      riderLocation?.latitude && riderLocation?.longitude
        ? { lat: riderLocation.latitude, lng: riderLocation.longitude }
        : resolvedP?.latitude && resolvedP?.longitude
        ? { lat: resolvedP.latitude, lng: resolvedP.longitude }
        : null;

    const destination =
      resolvedD?.latitude && resolvedD?.longitude
        ? { lat: resolvedD.latitude, lng: resolvedD.longitude }
        : null;

    if (origin && destination) {
      calculateDrivingRoute(origin, destination)
        .then((result) => {
          if (result && directionsRendererRef.current) {
            directionsRendererRef.current.setDirections(result);
            setRouteAvailable(true);
            const leg = result.routes[0]?.legs[0];
            if (leg) {
              setRouteInfo({
                distance: leg.distance?.text,
                duration: leg.duration?.text,
              });
            }
          } else {
            setRouteAvailable(false);
            setRouteInfo(null);
          }
        })
        .catch(() => {
          setRouteAvailable(false);
          setRouteInfo(null);
        });
    } else {
      setRouteAvailable(null);
      setRouteInfo(null);
    }
  }, [mapsLoaded, riderLocation, pickupCoordinates, deliveryCoordinates, storeLocation, isDelivered, multiDeliveries, pickupAddress, deliveryAddress]);

  // ─── 11. Demand Heatmap Layer ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    if (!heatmapPoints || heatmapPoints.length === 0) {
      if (heatmapLayerRef.current) {
        heatmapLayerRef.current.setMap(null);
        heatmapLayerRef.current = null;
      }
      return;
    }

    const dataPoints = heatmapPoints.map((p) => ({
      location: new maps.LatLng(p.latitude, p.longitude),
      weight: p.weight || 1,
    }));

    if (heatmapLayerRef.current) {
      heatmapLayerRef.current.setData(dataPoints as any);
      heatmapLayerRef.current.setMap(map);
    } else {
      const Heatmap = (maps as any).visualization?.HeatmapLayer;
      if (Heatmap) {
        const heatmap = new Heatmap({
          data: dataPoints,
          map,
          radius: 35,
          opacity: 0.75,
        });
        heatmapLayerRef.current = heatmap;
      }
    }
  }, [mapsLoaded, heatmapPoints]);

  const handleCenterOnRider = () => {
    if (!mapInstanceRef.current) return;
    if (riderLocation?.latitude && riderLocation?.longitude) {
      mapInstanceRef.current.panTo({ lat: riderLocation.latitude, lng: riderLocation.longitude });
      mapInstanceRef.current.setZoom(15);
    } else if (pickupCoordinates?.latitude && pickupCoordinates?.longitude) {
      mapInstanceRef.current.panTo({ lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude });
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current.panTo(BD_DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(12);
    }
  };

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? "fixed inset-0 z-50 h-screen rounded-none" : `${height} rounded-2xl`
      } overflow-hidden border border-border bg-slate-900 text-white select-none shadow-lg ${className}`}
    >
      {/* Real Google Maps Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Fallback Notice when API key is missing or failed */}
      {!mapsLoaded && loadError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
            <FaCompass className="animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Google Maps Telemetry Standby</h4>
            <p className="text-xs text-muted max-w-md mx-auto mt-1">
              Active GPS coordinates received from device. Set <code className="text-primary font-mono font-bold">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to enable street-level road overlays.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left max-w-sm w-full space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Pickup:</span>
              <span className="text-blue-400 truncate max-w-[180px]">{pickupAddress}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Destination:</span>
              <span className="text-emerald-400 truncate max-w-[180px]">{deliveryAddress}</span>
            </div>
            {riderLocation && (
              <div className="flex justify-between text-slate-400">
                <span>Rider GPS:</span>
                <span className="text-amber-400">{riderLocation.latitude.toFixed(4)}, {riderLocation.longitude.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Status HUD & Filter Bar */}
      <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 pointer-events-auto z-20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                isDelivered
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                  : isLive
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                  : isStale
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                  : "bg-blue-500/20 border border-blue-500/40 text-blue-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDelivered
                    ? "bg-emerald-400"
                    : isLive
                    ? "bg-emerald-400 animate-pulse"
                    : isStale
                    ? "bg-amber-400"
                    : "bg-blue-400 animate-ping"
                }`}
              />
              {trackingState}
            </div>

            {/* Multi-Order Count Badge */}
            {multiDeliveries && multiDeliveries.length > 0 && (
              <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm text-[11px] font-semibold text-blue-400">
                <span>{multiDeliveries.length} Active Missions</span>
              </div>
            )}

            {/* Real Stores Count Badge */}
            {stores && stores.length > 0 && (
              <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm text-[11px] font-semibold text-sky-400">
                <span>🏪 {stores.length} Stores</span>
              </div>
            )}

            {/* Route Status / Duration HUD */}
            {routeInfo?.duration && (
              <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm text-[11px] font-semibold text-emerald-400">
                <FaRoute className="text-xs" />
                <span>{routeInfo.duration} ({routeInfo.distance})</span>
              </div>
            )}

            {/* GPS Accuracy Badge */}
            {riderLocation?.accuracy !== undefined && (
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur-sm border text-[10px] ${
                  riderLocation.accuracy > 100
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/50"
                }`}
              >
                📡 ±{Math.round(riderLocation.accuracy)}m
              </span>
            )}
          </div>

          {/* Right Map Action Controls */}
          {showControls && (
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm text-xs">
              <button
                onClick={handleCenterOnRider}
                title="Center on Rider GPS"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-amber-400 transition cursor-pointer"
              >
                <FaLocationArrow size={12} />
              </button>
              <button
                onClick={handleFitBounds}
                title="Fit All Route Bounds"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
              >
                <FaCompass size={12} />
              </button>
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition cursor-pointer"
              >
                {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
              </button>
            </div>
          )}
        </div>

        {/* Operational Filter Bar (Admin Radar Requirement 7) */}
        {showFilterBar && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-semibold">
            {[
              { key: "all", label: "All Telemetry" },
              { key: "online", label: "🟢 Online Riders" },
              { key: "offline", label: "⚪ Offline Last Known" },
              { key: "stores", label: "🏪 Stores" },
              { key: "active_orders", label: "📦 Active Pickups" },
              { key: "destinations", label: "👤 Destinations" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key as MapFilterOption)}
                className={`px-2.5 py-1 rounded-lg border backdrop-blur-md transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === f.key
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      {(!multiDeliveries || multiDeliveries.length <= 1) && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-700/60 text-xs z-20">
          <div className="flex items-center gap-2 truncate">
            <FaStore className="text-blue-400 flex-shrink-0" />
            <span className="truncate text-slate-300 text-[11px]">{pickupAddress}</span>
            <span className="text-slate-500">➔</span>
            <FaHome className="text-emerald-400 flex-shrink-0" />
            <span className="truncate text-slate-300 text-[11px]">{deliveryAddress}</span>
          </div>
          <div className="flex-shrink-0 pl-2 text-right">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              {status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
