import { createAuthClient } from "better-auth/react";

/**
 * Client-side Better Auth React Client Instance
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://shopnest-frontend-six.vercel.app",
});

export const { useSession, signIn, signUp, signOut } = authClient;