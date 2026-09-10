import { clientFetch, clientMutation } from "@/lib/core/client";

export interface HeroBanner {
  id: string;
  categoryId: string | null;
  imageUrl: string;
  placement: "hero" | "side" | "bottom";
  eyebrow?: string | null;
  title?: string | null;
  highlight?: string | null;
  subtitle?: string | null;
  description?: string | null;
  price?: string | null;
  buttonText?: string | null;
  targetUrl?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  bgClassName?: string | null;
  textTheme: "light" | "dark";
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RawHeroBanner {
  _id?: string;
  id?: string;
  categoryId?: string | null;
  imageUrl: string;
  placement?: "hero" | "side" | "bottom";
  eyebrow?: string | null;
  highlight?: string | null;
  description?: string | null;
  price?: string | null;
  buttonText?: string | null;
  bgClassName?: string | null;
  textTheme?: "light" | "dark";
  title?: string | null;
  subtitle?: string | null;
  targetUrl?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

function normalize(raw: RawHeroBanner): HeroBanner {
  return {
    id: String(raw._id ?? raw.id),
    categoryId: raw.categoryId ? String(raw.categoryId) : null,
    imageUrl: raw.imageUrl,
    placement: raw.placement ?? "hero",
    eyebrow: raw.eyebrow ?? null,
    title: raw.title ?? null,
    highlight: raw.highlight ?? null,
    subtitle: raw.subtitle ?? null,
    description: raw.description ?? null,
    price: raw.price ?? null,
    buttonText: raw.buttonText ?? null,
    targetUrl: raw.targetUrl ?? null,
    overlayColor: raw.overlayColor ?? null,
    overlayOpacity: raw.overlayOpacity ?? null,
    bgClassName: raw.bgClassName ?? null,
    textTheme: raw.textTheme ?? "light",
    isActive: Boolean(raw.isActive),
    displayOrder: Number(raw.displayOrder ?? 0),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function payload(response: unknown): unknown {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function listFrom(response: unknown): HeroBanner[] {
  const list = payload(response);
  return Array.isArray(list) ? list.map((item) => normalize(item as RawHeroBanner)) : [];
}

function oneFrom(response: unknown): HeroBanner {
  return normalize(payload(response) as RawHeroBanner);
}

export async function getHeroBanners(categoryId?: string): Promise<HeroBanner[]> {
  const response = await clientFetch<unknown>("/hero-banners", {
    params: { category_id: categoryId },
  });
  return listFrom(response);
}

export async function createHeroBanner(payload: Omit<HeroBanner, "id" | "createdAt" | "updatedAt">) {
  const response = await clientMutation<unknown>("/hero-banners", "POST", payload);
  return oneFrom(response);
}

export async function updateHeroBanner(id: string, payload: Partial<Omit<HeroBanner, "id" | "createdAt" | "updatedAt">>) {
  const response = await clientMutation<unknown>(`/hero-banners/${id}`, "PUT", payload);
  return oneFrom(response);
}

export async function deleteHeroBanner(id: string) {
  return clientMutation(`/hero-banners/${id}`, "DELETE");
}

export async function reorderHeroBanners(bannerIds: string[]) {
  const response = await clientMutation<unknown>("/hero-banners/reorder", "PATCH", { bannerIds });
  return listFrom(response);
}

export async function uploadHeroBannerImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/v1/hero-banners/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Image upload failed");
  }
  const body = await response.json();
  return body?.data?.imageUrl ?? body?.imageUrl;
}