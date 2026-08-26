import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

/**
 * Server-side Better Auth Instance
 * Configures authentication provider, database adapter, and server credentials.
 */
const client = new MongoClient(
  process.env.MONGODB_URI || "mongodb://localhost:27017/shopnest"
);
const db = client.db();

const rawBaseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "https://shopnest-frontend-six.vercel.app";

const baseURL = rawBaseURL.replace(/\/$/, "");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [
    "https://shopnest-frontend-six.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    baseURL,
  ].filter((v): v is string => Boolean(v)),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      shopName: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});
