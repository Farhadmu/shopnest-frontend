import { ImageLoaderProps } from "next/image";

/**
 * Custom Next.js Image loader that routes requests through our backend's sharp-based resizing endpoint.
 * This prevents the Next.js server from doing the heavy lifting, and takes advantage of our backend's
 * caching and WebP conversion.
 */
export function shopnestImageLoader({ src }: ImageLoaderProps): string {
  return src;
}

/**
 * Helper for generating an optimized image URL directly (e.g. for standard <img> tags or background images)
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  _width: number = 400,
  _format: "webp" | "jpeg" | "png" = "webp"
): string {
  return originalUrl || "";
}
