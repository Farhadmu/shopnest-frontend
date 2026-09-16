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

/** Approximate coordinates for key districts/divisions/thanas in Bangladesh */
export const BD_DIVISION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // Divisions & Major Cities
  dhaka: { latitude: 23.8103, longitude: 90.4125 },
  chattogram: { latitude: 22.3569, longitude: 91.7832 },
  chittagong: { latitude: 22.3569, longitude: 91.7832 },
  sylhet: { latitude: 24.8949, longitude: 91.8687 },
  rajshahi: { latitude: 24.3745, longitude: 88.6042 },
  khulna: { latitude: 22.8456, longitude: 89.5403 },
  barishal: { latitude: 22.701, longitude: 90.3535 },
  barisal: { latitude: 22.701, longitude: 90.3535 },
  rangpur: { latitude: 25.7439, longitude: 89.2752 },
  mymensingh: { latitude: 24.7471, longitude: 90.4203 },
  cumilla: { latitude: 23.4607, longitude: 91.1809 },
  comilla: { latitude: 23.4607, longitude: 91.1809 },
  gazipur: { latitude: 23.9999, longitude: 90.4203 },
  narayanganj: { latitude: 23.6238, longitude: 90.5000 },
  bogura: { latitude: 24.8465, longitude: 89.3777 },
  bogra: { latitude: 24.8465, longitude: 89.3777 },
  jashore: { latitude: 23.1664, longitude: 89.2081 },
  jessore: { latitude: 23.1664, longitude: 89.2081 },
  coxsbazar: { latitude: 21.4272, longitude: 92.0058 },
  "cox's bazar": { latitude: 21.4272, longitude: 92.0058 },
  savar: { latitude: 23.8475, longitude: 90.2577 },
  tangail: { latitude: 24.2513, longitude: 89.9167 },
  pabna: { latitude: 24.0064, longitude: 89.2372 },
  kushtia: { latitude: 23.9013, longitude: 89.1205 },
  faridpur: { latitude: 23.6071, longitude: 89.8429 },
  dinajpur: { latitude: 25.6217, longitude: 88.6355 },

  // Dhaka Thanas & Major Hubs
  dhanmondi: { latitude: 23.7465, longitude: 90.376 },
  gulshan: { latitude: 23.7925, longitude: 90.4078 },
  banani: { latitude: 23.7937, longitude: 90.4066 },
  uttara: { latitude: 23.8759, longitude: 90.3795 },
  mirpur: { latitude: 23.8223, longitude: 90.3654 },
  motijheel: { latitude: 23.733, longitude: 90.4175 },
  mohammadpur: { latitude: 23.7658, longitude: 90.3584 },
  bashundhara: { latitude: 23.8164, longitude: 90.4373 },
  badda: { latitude: 23.7805, longitude: 90.4267 },
  farmgate: { latitude: 23.7561, longitude: 90.3872 },
  tejgaon: { latitude: 23.7598, longitude: 90.3923 },
  rampura: { latitude: 23.7612, longitude: 90.4208 },
  keraniganj: { latitude: 23.6828, longitude: 90.3428 },
};

/** Get approximate coordinates from address text if available */
export function getApproxCoordinatesFromAddress(addressText?: string): { latitude: number; longitude: number } | null {
  if (!addressText || typeof addressText !== "string") return null;
  const lower = addressText.toLowerCase();

  const sortedKeys = Object.keys(BD_DIVISION_COORDINATES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      return BD_DIVISION_COORDINATES[key];
    }
  }
  return null;
}


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
