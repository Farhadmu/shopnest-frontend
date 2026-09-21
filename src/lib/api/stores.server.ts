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
  businessInfo?: {
    category?: string;
    categoryId?: string | { name?: string; slug?: string };
  };
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
  "Groceries",
] as const;

function normalizeCategory(category?: string) {
  const value = category?.toLowerCase() || "";

  if (value.includes("electronic") || value.includes("gadget") || value.includes("tech") || value.includes("phone")) return "Electronics";
  if (value.includes("fashion") || value.includes("lifestyle") || value.includes("cloth") || value.includes("apparel") || value.includes("wear")) return "Fashion";
  if (value.includes("home") || value.includes("living") || value.includes("kitchen") || value.includes("furniture") || value.includes("decor")) return "Home & Living";
  if (value.includes("beauty") || value.includes("skin") || value.includes("cosmetic") || value.includes("care") || value.includes("personal")) return "Beauty";
  if (value.includes("sport") || value.includes("fitness") || value.includes("gym") || value.includes("outdoor")) return "Sports";
  if (value.includes("book") || value.includes("education") || value.includes("stationery") || value.includes("read")) return "Books";
  if (value.includes("grocer") || value.includes("food") || value.includes("organic") || value.includes("mart")) return "Groceries";

  return category?.trim() || "General";
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

function normalizeStore(store: BackendStore & { id?: string }): Store {
  const salesNumber = store.salesNumber || 0;
  
  let rawCategoryName: string | undefined;
  if (typeof store.businessInfo?.categoryId === "object" && store.businessInfo?.categoryId !== null) {
    rawCategoryName = store.businessInfo.categoryId.name || store.businessInfo.categoryId.slug;
  } else if (typeof store.businessInfo?.categoryId === "string") {
    if (!/^[0-9a-fA-F]{24}$/.test(store.businessInfo.categoryId.trim())) {
      rawCategoryName = store.businessInfo.categoryId;
    }
  } else if (store.businessInfo?.category) {
    rawCategoryName = store.businessInfo.category;
  }

  const category = normalizeCategory(rawCategoryName);
  const storeId = store._id || store.id || "";

  return {
    _id: storeId,
    id: store.slug || storeId,
    name: store.storeName,
    category,
    filterCategory: category,
    rating: Number(store.rating || 0).toFixed(1),
    ratingCount: Number(store.ratingCount || 0),
    sales: formatCount(salesNumber),
    salesNumber,
    response: "Fast response",
    logo: store.logo || "/assets/electronics/Wireless Charging Pad.png",
    desc: store.description || "",
    products: (store.products || []).map(normalizeProduct),
  };
}

export interface PublicStoresQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  sort?: string;
}

export interface PagedStoresResult {
  stores: Store[];
  categories: string[];
  categoryCounts: Record<string, number>;
  totalApprovedStores: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getPublicStores(params?: PublicStoresQuery): Promise<PagedStoresResult> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params?.page) queryParams.page = params.page;
  if (params?.limit) queryParams.limit = params.limit;
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.category && params.category !== "All Stores" && params.category !== "All") {
    queryParams.category = params.category;
  }
  if (params?.sort) queryParams.sort = params.sort;

  const response = await publicFetch<any>("/sellers", {
    params: queryParams,
    cache: "no-store",
  });

  const rawStores: BackendStore[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.items)
    ? response.items
    : [];

  const total = Number(response?.total ?? rawStores.length);
  const totalApprovedStores = Number(response?.totalApprovedStores ?? total);
  const page = Number(response?.page ?? params?.page ?? 1);
  const limit = Number(response?.limit ?? params?.limit ?? 12);
  const totalPages = Number(response?.totalPages ?? Math.max(1, Math.ceil(total / limit)));

  const normalizedStores = rawStores.map(normalizeStore);
  
  const presentCategories = Array.from(new Set(normalizedStores.map((s) => s.filterCategory).filter(Boolean)));
  const combined = Array.from(new Set([...STORE_CATEGORIES, ...presentCategories])).filter(c => c !== "All Stores");
  const categories = ["All Stores", ...combined];

  const rawCategoryCounts: Record<string, number> = response?.categoryCounts || {};
  const categoryCounts: Record<string, number> = {};
  for (const [key, count] of Object.entries(rawCategoryCounts)) {
    const normalizedKey = normalizeCategory(key);
    categoryCounts[normalizedKey] = (categoryCounts[normalizedKey] || 0) + count;
  }

  // Fallback if categoryCounts is empty
  if (Object.keys(categoryCounts).length === 0) {
    for (const store of normalizedStores) {
      const cat = store.filterCategory || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  return {
    stores: normalizedStores,
    categories,
    categoryCounts,
    totalApprovedStores,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getPublicStoreDetails(identifier: string): Promise<StoreData> {
  const store = await publicFetch<BackendStoreDetails>(`/sellers/stores/${encodeURIComponent(identifier)}`);
  const products = store.products.map(normalizeProduct);

  // Trust metrics are derived from this store's own reviews only — never from the
  // account-level trustScore (0-100) or any hardcoded/fallback value.
  const reviewRatings = (store.reviews || [])
    .map((review) => Number(review.rating))
    .filter((value) => Number.isFinite(value) && value > 0);
  const hasReviews = reviewRatings.length > 0;
  const avgRating = hasReviews
    ? reviewRatings.reduce((sum, value) => sum + value, 0) / reviewRatings.length
    : 0;
  const recommendationPercent = hasReviews
    ? Math.round((reviewRatings.filter((value) => value >= 4).length / reviewRatings.length) * 100)
    : 0;
  const metricValue = hasReviews ? avgRating.toFixed(1) : "N/A";
  const rating = hasReviews ? avgRating.toFixed(1) : Number(store.rating || 0).toFixed(1);

  const rawStoreId = store._id || store.id;

  return {
    _id: rawStoreId,
    storeId: rawStoreId,
    id: store.slug || rawStoreId,
    slug: store.slug,
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
      itemAsDescribed: metricValue,
      communication: metricValue,
      packaging: metricValue,
    },
    recommendationPercent,
    merchantAssurance: [],
    storeVoucher: {
      discount: "No active voucher",
      validTill: "Check back soon",
      code: "",
    },
    reviewsList: store.reviews.map((review) => normalizeReview(review, store.products)),
  };
}
