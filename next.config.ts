import type { NextConfig } from "next";

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

