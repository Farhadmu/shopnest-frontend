import { clientFetch } from "@/lib/core/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  /** Parent category id, or null/undefined for a top-level category.
   * Needed by product-page filtering that builds a tree via
   * `buildCategoryTree` / `flattenWithDepth` from `lib/utils/category-tree`. */
  parent?: string | null;
  image?: string;
  /** Category Allocation & Lock System: true once an admin approved a seller's
   *  specific-category homepage coupon request for this category. */
  isLocked?: boolean;
  assignedSellerId?: string | null;
}

function normalize(raw: any): Category {
  return {
    id: raw._id || raw.id || raw.slug || raw.name,
    name: raw.name,
    slug: raw.slug || raw.name,
    parent: raw.parent ? String(raw.parent) : null,
    image: raw.image,
    isLocked: Boolean(raw.is_locked),
    assignedSellerId: raw.assigned_seller_id ? String(raw.assigned_seller_id) : null,
  };
}

export async function getCategories(): Promise<Category[]> {
  const res = await clientFetch<any>("/categories");
  const list = Array.isArray(res) ? res : (res?.data ?? []);
  return list.map(normalize);
}