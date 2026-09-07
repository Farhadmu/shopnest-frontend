/**
 * Compatibility entrypoint for banner data.
 *
 * Runtime category banners are loaded from the HeroBanner API. The shared
 * static data remains the final fallback when no active database banner is
 * available.
 */
export {
  defaultBannerData,
  FALLBACK_CATEGORIES,
} from "@/lib/constants/banner";

export type {
  BannerCategory,
  BannerSectionData,
  HeroSlide,
  PromoCard,
} from "@/lib/constants/banner";
