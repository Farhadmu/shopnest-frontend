"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  loadGoogleMaps,
  BD_DEFAULT_CENTER,
  SHOPNEST_DARK_MAP_STYLE,
  calculateDrivingRoute,
} from "@/lib/maps/google-maps-loader";
import { LiveTrackingStatus, LiveLocationData } from "@/hooks/delivery/useDeliveryLiveTracking";
import {
  FaMotorcycle,
  FaStore,
  FaHome,
  FaCompass,
  FaLocationArrow,
  FaExclamationTriangle,
  FaRoute,
  FaExpand,
  FaCompress,
  FaCheckCircle,
} from "react-icons/fa";

export interface FleetRiderMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  status?: string;
  activeDeliveryId?: string;
  activeOrderId?: string;
  phone?: string;
  rating?: number;
  vehicleType?: string;
  updatedAt?: string;
}

export interface GoogleDeliveryMapProps {
  riderLocation?: LiveLocationData | null;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
  status?: string;
  orderId?: string;
  deliveryId?: string;
  riderName?: string;
  riderPhone?: string;
  trackingState?: LiveTrackingStatus;
  secondsSinceLastUpdate?: number;
  fleetRiders?: FleetRiderMarkerData[];
  className?: string;
  height?: string;
  showControls?: boolean;
}

export function GoogleDeliveryMap({
  riderLocation,
  pickupAddress = "Merchant Store",
  deliveryAddress = "Customer Destination",
  pickupCoordinates,
  deliveryCoordinates,
  status = "in_transit",
  orderId,
  deliveryId,
  riderName = "Assigned Delivery Partner",
  riderPhone,
  trackingState = "CONNECTING",
  secondsSinceLastUpdate = 0,
  fleetRiders,
  className = "",
  height = "h-80 sm:h-96",
  showControls = true,
}: GoogleDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<{
    pickup?: google.maps.Marker;
    destination?: google.maps.Marker;
    rider?: google.maps.Marker;
    fleet?: Map<string, google.maps.Marker>;
  }>({ fleet: new Map() });
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [mapsLoaded, setMapsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeAvailable, setRouteAvailable] = useState<boolean | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance?: string; duration?: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
          const initialCenter =
            riderLocation?.latitude && riderLocation?.longitude
              ? { lat: riderLocation.latitude, lng: riderLocation.longitude }
              : pickupCoordinates
              ? { lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude }
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
    };
  }, []);

  // ─── 2. Update Pickup & Destination Markers ──────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    // Pickup Marker
    if (pickupCoordinates?.latitude && pickupCoordinates?.longitude) {
      const pos = { lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude };
      if (!markersRef.current.pickup) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Pickup: ${pickupAddress}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="18" y="23" font-size="16" text-anchor="middle" fill="#ffffff">📦</text>
                </svg>`
              ),
            scaledSize: new maps.Size(36, 36),
            anchor: new maps.Point(18, 18),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
              <strong style="font-size: 12px; color: #2563eb;">📦 Pickup Store</strong>
              <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${pickupAddress}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
        });

        markersRef.current.pickup = marker;
      } else {
        markersRef.current.pickup.setPosition(pos);
      }
    }

    // Destination Marker
    if (deliveryCoordinates?.latitude && deliveryCoordinates?.longitude) {
      const pos = { lat: deliveryCoordinates.latitude, lng: deliveryCoordinates.longitude };
      if (!markersRef.current.destination) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Delivery: ${deliveryAddress}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
                  <text x="18" y="23" font-size="16" text-anchor="middle" fill="#ffffff">🏠</text>
                </svg>`
              ),
            scaledSize: new maps.Size(36, 36),
            anchor: new maps.Point(18, 18),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 6px; font-family: sans-serif;">
              <strong style="font-size: 12px; color: #10b981;">🏠 Delivery Destination</strong>
              <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">${deliveryAddress}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
        });

        markersRef.current.destination = marker;
      } else {
        markersRef.current.destination.setPosition(pos);
      }
    }
  }, [mapsLoaded, pickupCoordinates, deliveryCoordinates, pickupAddress, deliveryAddress]);

  // ─── 3. Update Real Rider Marker (Single Delivery Mode) ─────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapInstanceRef.current;

    if (riderLocation?.latitude && riderLocation?.longitude && !isDelivered) {
      const pos = { lat: riderLocation.latitude, lng: riderLocation.longitude };

      if (!markersRef.current.rider) {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: `Rider: ${riderName}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5"/>
                  <circle cx="20" cy="20" r="12" fill="#d97706"/>
                  <text x="20" y="25" font-size="16" text-anchor="middle" fill="#ffffff">🛵</text>
                </svg>`
              ),
            scaledSize: new maps.Size(40, 40),
            anchor: new maps.Point(20, 20),
          },
          zIndex: 999,
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px; font-family: sans-serif; min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 14px;">🛵</span>
                <strong style="font-size: 13px; color: #0f172a;">${riderName}</strong>
              </div>
              <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
                ${orderId ? `<div><strong>Order:</strong> #${orderId}</div>` : ""}
                ${deliveryId ? `<div><strong>Delivery ID:</strong> #${deliveryId.slice(-6)}</div>` : ""}
                <div><strong>Status:</strong> <span style="text-transform: uppercase; color: #2563eb; font-weight: bold;">${status.replace(/_/g, " ")}</span></div>
                ${riderLocation.speed !== undefined ? `<div><strong>Speed:</strong> ${riderLocation.speed} km/h</div>` : ""}
                ${riderLocation.accuracy !== undefined ? `<div><strong>GPS Accuracy:</strong> ±${Math.round(riderLocation.accuracy)}m</div>` : ""}
                <div><strong>Last Update:</strong> ${new Date(riderLocation.updatedAt).toLocaleTimeString()}</div>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
        });

        markersRef.current.rider = marker;
      } else {
        markersRef.current.rider.setPosition(pos);
        markersRef.current.rider.setVisible(true);
      }
    } else if (markersRef.current.rider) {
      if (isDelivered) {
        markersRef.current.rider.setVisible(false);
      }
    }
  }, [mapsLoaded, riderLocation, riderName, orderId, deliveryId, status, isDelivered]);

  // ─── 4. Multi-Rider Fleet Markers (Admin Mode) ──────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    if (!fleetRiders) return;

    const maps = window.google.maps;
    const map = mapInstanceRef.current;
    const currentFleetMap = markersRef.current.fleet || new Map();
    const activeIds = new Set(fleetRiders.map((r) => r.id));

    // Remove markers that are no longer active
    currentFleetMap.forEach((marker, riderId) => {
      if (!activeIds.has(riderId)) {
        marker.setMap(null);
        currentFleetMap.delete(riderId);
      }
    });

    // Add or update markers
    fleetRiders.forEach((rider) => {
      const pos = { lat: rider.latitude, lng: rider.longitude };
      const existing = currentFleetMap.get(rider.id);

      if (existing) {
        existing.setPosition(pos);
      } else {
        const marker = new maps.Marker({
          position: pos,
          map,
          title: rider.name,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
                  <text x="18" y="23" font-size="14" text-anchor="middle" fill="#ffffff">🛵</text>
                </svg>`
              ),
            scaledSize: new maps.Size(36, 36),
            anchor: new maps.Point(18, 18),
          },
        });

        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 8px; font-family: sans-serif; min-width: 170px;">
              <strong style="font-size: 13px; color: #0f172a;">${rider.name}</strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4;">
                ${rider.activeOrderId ? `<div><strong>Active Order:</strong> #${rider.activeOrderId}</div>` : "<div><strong>Status:</strong> Online (Available)</div>"}
                ${rider.speed !== undefined ? `<div><strong>Speed:</strong> ${rider.speed} km/h</div>` : ""}
                ${rider.phone ? `<div><strong>Phone:</strong> ${rider.phone}</div>` : ""}
                ${rider.rating ? `<div><strong>Rating:</strong> ⭐ ${rider.rating.toFixed(1)}</div>` : ""}
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          infoWindow.open(map, marker);
          activeInfoWindowRef.current = infoWindow;
        });

        currentFleetMap.set(rider.id, marker);
      }
    });

    markersRef.current.fleet = currentFleetMap;
  }, [mapsLoaded, fleetRiders]);

  // ─── 5. Auto Fit Bounds ──────────────────────────────────────────────────────
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
    if (pickupCoordinates?.latitude && pickupCoordinates?.longitude) {
      bounds.extend({ lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude });
      count++;
    }
    if (deliveryCoordinates?.latitude && deliveryCoordinates?.longitude) {
      bounds.extend({ lat: deliveryCoordinates.latitude, lng: deliveryCoordinates.longitude });
      count++;
    }

    if (fleetRiders && fleetRiders.length > 0) {
      fleetRiders.forEach((r) => {
        bounds.extend({ lat: r.latitude, lng: r.longitude });
        count++;
      });
    }

    if (count > 1) {
      map.fitBounds(bounds, 50);
    } else if (count === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(14);
    } else {
      map.setCenter(BD_DEFAULT_CENTER);
      map.setZoom(12);
    }
  }, [mapsLoaded, riderLocation, pickupCoordinates, deliveryCoordinates, fleetRiders, isDelivered]);

  useEffect(() => {
    handleFitBounds();
  }, [handleFitBounds]);

  // ─── 6. Real Directions Route Calculation ───────────────────────────────────
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !directionsRendererRef.current) return;
    if (isDelivered) {
      directionsRendererRef.current.setDirections({ routes: [] } as any);
      setRouteAvailable(null);
      return;
    }

    // Origin: Rider location or Pickup location
    const origin =
      riderLocation?.latitude && riderLocation?.longitude
        ? { lat: riderLocation.latitude, lng: riderLocation.longitude }
        : pickupCoordinates
        ? { lat: pickupCoordinates.latitude, lng: pickupCoordinates.longitude }
        : null;

    // Destination: Customer destination
    const destination = deliveryCoordinates
      ? { lat: deliveryCoordinates.latitude, lng: deliveryCoordinates.longitude }
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
  }, [mapsLoaded, riderLocation, pickupCoordinates, deliveryCoordinates, isDelivered]);

  // Fallback Center on User Current Location
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

      {/* Top Status HUD Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto z-20">
        <div className="flex items-center gap-2">
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

          {/* Route Status / Duration HUD */}
          {routeInfo?.duration && (
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700/50 backdrop-blur-sm text-[11px] font-semibold text-emerald-400">
              <FaRoute className="text-xs" />
              <span>{routeInfo.duration} ({routeInfo.distance})</span>
            </div>
          )}

          {routeAvailable === false && (
            <span className="hidden sm:inline-block text-[10px] text-amber-400 bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700/50">
              ROUTE_UNAVAILABLE
            </span>
          )}

          {/* Freshness Timestamp */}
          {isLive && secondsSinceLastUpdate > 0 && (
            <span className="hidden md:inline-block text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-700/50">
              Updated {secondsSinceLastUpdate}s ago
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
              title="Fit Route Bounds"
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

      {/* Bottom Route Summary Bar */}
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
    </div>
  );
}
