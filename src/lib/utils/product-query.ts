/**
 * Shared helpers for building `/products` links that carry the current
 * filter state plus one or more overrides. Keeping this logic here (instead
 * of duplicating it in every filter component) is what lets the sidebar,
 * chips, sort control, and pagination all stay plain server-rendered
 * `<Link>`s instead of needing client-side state.
 */

export interface ProductsQueryState {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  store?: string;
  rating?: string;
  inStock?: string;
  freeDelivery?: string;
  verified?: string;
  aiPick?: string;
  view?: string;
  page?: string;
}

const KEYS: (keyof ProductsQueryState)[] = [
  "search",
  "category",
  "minPrice",
  "maxPrice",
  "sort",
  "store",
  "rating",
  "inStock",
  "freeDelivery",
  "verified",
  "aiPick",
  "view",
  "page",
];

/**
 * Builds a `/products?...` href from the current query state plus overrides.
 * Passing `undefined` for a key removes it from the URL. Any key changed
 * other than `page` resets pagination back to page 1 automatically.
 */
export function buildProductsHref(
  current: ProductsQueryState,
  overrides: ProductsQueryState
): string {
  const merged: ProductsQueryState = { ...current, ...overrides };

  const changedFilters = Object.keys(overrides).some((k) => k !== "page");
  if (changedFilters && overrides.page === undefined) {
    merged.page = undefined;
  }

  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = merged[key];
    if (value !== undefined && value !== null && value !== "" && value !== "1") {
      if (key === "page" && value === "1") continue;
      params.set(key, value);
    }
  }

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

/** Toggles a single value inside a comma-separated multi-select query param (e.g. `store=nova-tech,urban-loom`). */
export function toggleInList(current: string | undefined, value: string): string | undefined {
  const list = (current ?? "").split(",").filter(Boolean);
  const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  return next.length ? next.join(",") : undefined;
}

export function isInList(current: string | undefined, value: string): boolean {
  return (current ?? "").split(",").filter(Boolean).includes(value);
}