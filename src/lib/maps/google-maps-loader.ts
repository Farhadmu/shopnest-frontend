import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export const BD_DEFAULT_CENTER = {
  lat: 23.8103,
  lng: 90.4125,
};

export const BD_BOUNDS = {
  north: 26.634,
  south: 20.743,
  west: 88.010,
  east: 92.673,
};

// Premium dark mode map theme matching ShopNest interface aesthetics
export const SHOPNEST_DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#162e2a" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#34d399" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f8fafc" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0f172a" }],
  },
];

let isOptionsConfigured = false;
let googleMapsPromise: Promise<typeof google.maps | null> | null = null;

export function getGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    (typeof window !== "undefined" && (window as any).__GOOGLE_MAPS_API_KEY__) ||
    ""
  );
}

export function loadGoogleMaps(): Promise<typeof google.maps | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    // Return null so the UI can gracefully show the interactive fallback cockpit
    return Promise.resolve(null);
  }

  if (!isOptionsConfigured) {
    setOptions({
      key: apiKey,
      v: "weekly",
    });
    isOptionsConfigured = true;
  }

  googleMapsPromise = Promise.all([
    importLibrary("maps"),
    importLibrary("routes"),
    importLibrary("marker"),
  ])
    .then(() => {
      return window.google?.maps ?? null;
    })
    .catch((err: any) => {
      console.warn("Failed to load Google Maps JS API:", err?.message || err);
      return null;
    });

  return googleMapsPromise;
}

/**
 * Fetch real driving route between two points using Google Directions API
 */
export async function calculateDrivingRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints?: Array<{ location: { lat: number; lng: number }; stopover: boolean }>
): Promise<google.maps.DirectionsResult | null> {
  const maps = await loadGoogleMaps();
  if (!maps) return null;

  const directionsService = new maps.DirectionsService();

  return new Promise((resolve) => {
    directionsService.route(
      {
        origin,
        destination,
        waypoints: waypoints || [],
        travelMode: maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result: any, status: any) => {
        if (status === "OK" && result) {
          resolve(result as google.maps.DirectionsResult);
        } else {
          resolve(null);
        }
      }
    );
  });
}
