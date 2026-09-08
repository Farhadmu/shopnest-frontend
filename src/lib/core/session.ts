/**
 * Helper to forward incoming request cookies to Express backend HTTP calls.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") return {};
  try {
    const { headers } = await import("next/headers");
    const reqHeaders = await headers();
    const cookieHeader = reqHeaders.get("cookie");

    if (cookieHeader) {
      return {
        cookie: cookieHeader,
      };
    }
  } catch {
    // Non-request context or client fallback
  }
  return {};
}
