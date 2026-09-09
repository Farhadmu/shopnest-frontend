import { publicFetch } from "@/lib/core/server";
import type { Product, Store } from "@/types/store";

type BackendProduct = {
  _id?: string;
  title: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  ratingAvg?: number;
  sold?: number;
};

type BackendStore = {
  _id: string;
  storeName: string;
  slug: string;
  description: string;
  logo?: string;
  rating: number;
  ratingCount: number;
  businessInfo?: { category?: string };
  products?: BackendProduct[];
  salesNumber?: number;
};

export const STORE_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
] as const;

function normalizeCategory(category?: string) {
  const value = category?.toLowerCase() || "";

  if (value.includes("electronic")) return "Electronics";
  if (value.includes("fashion") || value.includes("lifestyle")) return "Fashion";
  if (value.includes("home") || value.includes("living")) return "Home & Living";
  if (value.includes("beauty") || value.includes("skin")) return "Beauty";
  if (value.includes("sport") || value.includes("fitness")) return "Sports";
  if (value.includes("book") || value.includes("education")) return "Books";

  return category?.trim() || "Other";
}

function formatCount(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return `${value}+`;
}

function normalizeProduct(product: BackendProduct): Product {
  return {
    name: product.title,
    price: `৳${product.discountPrice ?? product.price}`,
    image: product.images?.[0] || "/assets/electronics/Wireless Charging Pad.png",
    rating: product.ratingAvg?.toFixed(1) || "0.0",
    sold: `${formatCount(product.sold || 0)} sold`,
  };
}

function normalizeStore(store: BackendStore): Store {
  const salesNumber = store.salesNumber || 0;
  const category = normalizeCategory(store.businessInfo?.category);

  return {
    _id: store._id,
    id: store.slug || store._id,
    name: store.storeName,
    category,
    filterCategory: category,
    rating: store.rating.toFixed(1),
    sales: formatCount(salesNumber),
    salesNumber,
    response: "Fast response",
    logo: store.logo || "/assets/electronics/Wireless Charging Pad.png",
    desc: store.description,
    products: (store.products || []).map(normalizeProduct),
  };
}

export async function getPublicStores(): Promise<{ stores: Store[]; categories: string[] }> {
  const stores = await publicFetch<BackendStore[]>("/sellers");
  const normalizedStores = stores.map(normalizeStore);
  const categories = ["All Stores", ...STORE_CATEGORIES];

  return { stores: normalizedStores, categories };
}
