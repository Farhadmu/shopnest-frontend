import type { NextConfig } from "next";

// Server-only URL for the Express API. Do not expose this as
// NEXT_PUBLIC_API_URL: client-side requests must use the same-origin rewrite
// so the Better Auth cookie is included and can be forwarded to Express.
const backendApiUrl = (process.env.API_URL || "http://127.0.0.1:5000/api/v1").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;

