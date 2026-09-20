/**
 * Banner section — shared types and static default data.
 */

export type BannerCategory = {
  id: string;
  label: string;
  href: string;
  /** Per-category card overrides shown when this category is active in the auto-cycle. */
  heroSlides?: HeroSlide[];
  sideCards?: PromoCard[];
  bottomCards?: PromoCard[];
};

export type HeroSlide = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  image: string;
  buttonText: string;
  buttonLink: string;

  bgClassName?: string;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  lightTextColor?: string | null;
  darkTextColor?: string | null;
  lightButtonColor?: string | null;
  darkButtonColor?: string | null;

  textTheme?: "light" | "dark";
};

export type PromoCard = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  description?: string;
  price?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  bgClassName?: string;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  lightTextColor?: string | null;
  darkTextColor?: string | null;
  lightButtonColor?: string | null;
  darkButtonColor?: string | null;
  textTheme?: "light" | "dark";
};

export type BannerSectionData = {
  saleLabel?: string;
  /** Optional static fallback; the Banner component fetches live categories from the API. */
  categories?: BannerCategory[];
  heroSlides: HeroSlide[];
  /** Two cards stacked in the right-hand rail. */
  sideCards: PromoCard[];
  /** Two cards under the hero carousel. */
  bottomCards: PromoCard[];
};

// ---------------------------------------------------------------------------
// Pure dynamic fallback categories (Categories loaded from backend)
// ---------------------------------------------------------------------------

/** Fallback categories — clean store category presets */
export const FALLBACK_CATEGORIES: BannerCategory[] = [
  { id: "cat-beauty", label: "Beauty", href: "/products?category=Beauty" },
  { id: "cat-books", label: "Books", href: "/products?category=Books" },
  { id: "cat-electronics", label: "Electronics", href: "/products?category=Electronics" },
  { id: "cat-fashion", label: "Fashion", href: "/products?category=Fashion" },
  { id: "cat-home-kitchen", label: "Home & Kitchen", href: "/products?category=Home+%26+Kitchen" },
  { id: "cat-mobile", label: "Mobile", href: "/products?category=Mobile" },
  { id: "cat-sports", label: "Sports", href: "/products?category=Sports" },
  { id: "cat-cycle", label: "Cycle", href: "/products?category=Cycle" },
];

export const defaultBannerData: BannerSectionData = {
  categories: FALLBACK_CATEGORIES,
  heroSlides: [],
  sideCards: [],
  bottomCards: [],
};
