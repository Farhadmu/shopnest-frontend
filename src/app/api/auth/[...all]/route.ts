import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth Next.js App Router Route Handler
 * Handles all requests at /api/auth/*
 */
export const { GET, POST } = toNextJsHandler(auth);
