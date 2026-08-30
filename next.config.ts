import type { NextConfig } from "next";

// Server-only URL for the Express API. Do not expose this as
// NEXT_PUBLIC_API_URL: client-side requests must use the same-origin rewrite
// so the Better Auth cookie is included and can be forwarded to Express.
const rawBackendUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

const backendUrl = rawBackendUrl
  .trim()
  .replace(/\/$/, "")
  .replace(/\/api\/v1$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;