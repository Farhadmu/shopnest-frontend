/**
 * Persistent, browser-scoped device identifier.
 *
 * Stored in a long-lived first-party cookie so it survives logouts, browser
 * restarts, cookie-preserving session refreshes and network/IP changes, while
 * a genuinely different browser or device always starts with a different id
 * (separate cookie jars).
 *
 * It is deliberately NOT a credential: it grants nothing on its own, and the
 * backend only ever uses it as a lookup key scoped to the *authenticated*
 * user's own device list.
 */

const DEVICE_ID_COOKIE = "shopnest_device_id";
const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // ~13 months
const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{16,128}$/;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

/** Cryptographically random id. Returns undefined if Web Crypto is unavailable. */
function generateDeviceId(): string | undefined {
  const webCrypto = globalThis.crypto;
  if (typeof webCrypto?.randomUUID === "function") return webCrypto.randomUUID();
  if (typeof webCrypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    webCrypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return undefined;
}

/**
 * Returns this browser's device id, creating and persisting one on first use.
 *
 * Returns undefined during SSR and when no secure random source exists — in
 * that case callers must omit it, and the backend simply skips device
 * detection rather than guessing.
 */
export function getDeviceId(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const existing = readCookie(DEVICE_ID_COOKIE);
  if (existing && DEVICE_ID_PATTERN.test(existing)) return existing;

  const deviceId = generateDeviceId();
  if (!deviceId) return undefined;

  writeCookie(DEVICE_ID_COOKIE, deviceId, DEVICE_ID_MAX_AGE_SECONDS);
  return deviceId;
}
