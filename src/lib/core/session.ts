import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server Session Utility
 * Retrieves authenticated user session from Better Auth on the server side.
 */
export async function getServerSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session;
}

/**
 * Helper to forward incoming request cookies to Express backend HTTP calls.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const reqHeaders = await headers();
  const cookieHeader = reqHeaders.get("cookie");

  if (cookieHeader) {
    return {
      cookie: cookieHeader,
    };
  }
  return {};
}
