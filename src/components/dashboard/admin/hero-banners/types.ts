import type { HeroBanner } from "@/lib/api/hero-banners";

export interface EditSlot {
  categoryId: string;
  categoryName: string;
  placement: "hero" | "side" | "bottom";
  banner: HeroBanner | null;
}

export type BannerSaveResult =
  | { type: "create"; banner: HeroBanner }
  | { type: "update"; banner: HeroBanner }
  | { type: "delete"; id: string };

