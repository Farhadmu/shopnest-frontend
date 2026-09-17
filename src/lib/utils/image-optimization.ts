import { ImageLoaderProps } from "next/image";

/**
 * Custom Next.js Image loader that routes requests through our backend's sharp-based resizing endpoint.
 * This prevents the Next.js server from doing the heavy lifting, and takes advantage of our backend's
 * caching and WebP conversion.
 */
export function shopnestImageLoader({ src, width }: ImageLoaderProps): string {
  // If the image is a data URL, relative path, or SVG, don't proxy it
  if (src.startsWith("data:") || src.startsWith("/") || src.endsWith(".svg")) {
    return src;
  }

  // Route through the Next.js rewrite -> Backend /api/v1/images/resize endpoint
  return `/api/v1/images/resize?url=${encodeURIComponent(src)}&width=${width}&format=webp`;
}

/**
 * Helper for generating an optimized image URL directly (e.g. for standard <img> tags or background images)
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width: number = 400,
  format: "webp" | "jpeg" | "png" = "webp"
): string {
  if (!originalUrl) return "";
  
  if (originalUrl.startsWith("data:") || originalUrl.startsWith("/") || originalUrl.endsWith(".svg")) {
    return originalUrl;
  }
  
  return `/api/v1/images/resize?url=${encodeURIComponent(originalUrl)}&width=${width}&format=${format}`;
}
