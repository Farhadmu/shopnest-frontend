import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy File Convention
 * Replaces deprecated middleware.ts in Next.js 16+.
 * Intercepts requests for early path handling or security headers before rendering.
 */
export function proxy(request: NextRequest) {
  // Placeholder for route protection or custom header passing
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (Better Auth route handler)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
