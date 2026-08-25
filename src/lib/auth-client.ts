import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth React Client Instance
 * Exports authentication hooks and actions for browser-side React components.
 */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : undefined),
});

export const { useSession, signIn, signUp, signOut } = authClient;
