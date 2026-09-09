import { publicFetch } from "@/lib/core/server";
import type { Product, Store, StoreData, ReviewItem } from "@/types/store";

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
  banner?: string;
  rating: number;
  ratingCount: number;
  businessInfo?: { category?: string };
  products?: BackendProduct[];
  salesNumber?: number;
};

type BackendStoreDetails = BackendStore & {
  id: string;
  ownerId: string;
  createdAt?: string;
  trustScore: number;
  ratingCount: number;
  products: BackendProduct[];
  reviews: Array<{
    productId: string;
    userName: string;
    rating: number;
    comment: string;
    images?: string[];
    verifiedPurchase?: boolean;
    createdAt: string;
  }>;
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
    _id: product._id,
    id: product._id,
    name: product.title,
    price: `৳${product.discountPrice ?? product.price}`,
    image: product.images?.[0] || "/assets/electronics/Wireless Charging Pad.png",
    rating: product.ratingAvg?.toFixed(1) || "0.0",
    sold: `${formatCount(product.sold || 0)} sold`,
  };
}

function normalizeReview(review: BackendStoreDetails["reviews"][number], products: BackendProduct[]): ReviewItem {
  const product = products.find((item) => item._id === review.productId);

  return {
    author: review.userName || "ShopNest customer",
    date: new Date(review.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    comment: review.comment,
    item: product?.title || "Store purchase",
    rating: review.rating,
    packaging: review.rating.toFixed(1),
    speed: review.verifiedPurchase ? "Verified purchase" : "Customer review",
    dispatchTime: "Store review",
    images: review.images,
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

export async function getPublicStoreDetails(identifier: string): Promise<StoreData> {
  const store = await publicFetch<BackendStoreDetails>(`/sellers/stores/${encodeURIComponent(identifier)}`);
  const products = store.products.map(normalizeProduct);
  const rating = Number(store.rating || 0).toFixed(1);
  const trust = Math.min(5, Math.max(0, Number(store.trustScore || 0) / 20)).toFixed(1);

  return {
    id: store.slug || store.id,
    ownerId: store.ownerId,
    name: store.storeName,
    tagline: store.description,
    rating,
    reviewsCount: `${store.ratingCount || store.reviews.length} ratings`,
    dispatch: "Fast response",
    partnerSince: store.createdAt
      ? `Partner since ${new Date(store.createdAt).getFullYear()}`
      : "ShopNest partner",
    banner: store.banner || store.logo || "/assets/electronics/Wireless Charging Pad.png",
    logo: store.logo || "/assets/electronics/Wireless Charging Pad.png",
    productsCount: String(products.length),
    reviewsCountNum: String(store.ratingCount || store.reviews.length),
    products,
    trustScore: {
      itemAsDescribed: trust,
      communication: trust,
      packaging: trust,
    },
    merchantAssurance: [],
    storeVoucher: {
      discount: "No active voucher",
      validTill: "Check back soon",
      code: "",
    },
    reviewsList: store.reviews.map((review) => normalizeReview(review, store.products)),
  };
}
