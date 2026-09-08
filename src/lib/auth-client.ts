import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth React Client Instance
 * Exports authentication hooks and actions for browser-side React components.
 */
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL
});

export const { useSession, signIn, signUp, signOut } = authClient;
