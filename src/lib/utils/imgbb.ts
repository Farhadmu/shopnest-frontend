/**
 * Shared helper for uploading images to ImgBB (https://api.imgbb.com).
 * Used anywhere in the app that lets a user upload an image file and
 * needs back a hosted URL to store (product galleries, store branding,
 * profile pictures, etc.)
 */

const IMGBB_UPLOAD_ENDPOINT = "https://api.imgbb.com/1/upload";
const FALLBACK_IMGBB_KEY = "6d7007353630f7e44ae70d651786f68c";

export const MAX_IMGBB_FILE_SIZE_MB = 32;

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
}

function getImgBBApiKey(): string {
  return process.env.NEXT_PUBLIC_IMGBB_KEY || FALLBACK_IMGBB_KEY;
}

/**
 * Uploads a single image File to ImgBB and returns the hosted URLs.
 * Throws an Error with a human-readable message on failure.
 */
export async function uploadImageToImgBB(file: File): Promise<ImgBBUploadResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  const maxBytes = MAX_IMGBB_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Image is too large. Max size is ${MAX_IMGBB_FILE_SIZE_MB}MB.`);
  }

  const body = new FormData();
  body.append("image", file);

  const apiKey = getImgBBApiKey();
  const response = await fetch(`${IMGBB_UPLOAD_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    body,
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    throw new Error("Image upload failed: invalid response from ImgBB.");
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.error?.message || "Image upload to ImgBB failed. Please try again.");
  }

  return {
    url: data.data?.url as string,
    displayUrl: (data.data?.display_url as string) || (data.data?.url as string),
    deleteUrl: data.data?.delete_url as string | undefined,
  };
}

/**
 * Uploads multiple image Files to ImgBB in parallel and returns their
 * hosted URLs in the same order as the input files. If any single
 * upload fails, that error propagates (Promise.all semantics) — callers
 * that want partial success should upload sequentially instead.
 */
export async function uploadImagesToImgBB(files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map((file) => uploadImageToImgBB(file)));
  return results.map((r) => r.url);
}
