const IMGBB_UPLOAD_ENDPOINT = "https://api.imgbb.com/1/upload";

export const MAX_IMGBB_FILE_SIZE_MB = 32;

export interface ImgBBUploadResult {
  url: string;
  displayUrl: string;
  deleteUrl?: string;
}

function getImgBBApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;

  if (!apiKey) {
    throw new Error("ImgBB API key is not configured.");
  }

  return apiKey;
}

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

  let data;

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
    displayUrl: data.data?.display_url || data.data?.url,
    deleteUrl: data.data?.delete_url,
  };
}

export async function uploadImagesToImgBB(files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map((file) => uploadImageToImgBB(file)));

  return results.map((result) => result.url);
}
