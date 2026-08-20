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

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
});
