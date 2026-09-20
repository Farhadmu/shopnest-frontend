import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, emailOTPClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

/**
 * Client-side Better Auth React Client Instance
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "https://shopnest-frontend-six.vercel.app",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient(),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;