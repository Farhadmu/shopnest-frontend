import type { HeroBanner } from "@/lib/api/hero-banners";

export interface EditSlot {
  categoryId: string;
  categoryName: string;
  placement: "hero" | "side" | "bottom";
  banner: HeroBanner | null;
}
