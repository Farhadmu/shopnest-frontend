import { clientFetch, clientFetchWithHeaders, clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  storeId?: string;
  sellerId?: string;
  stock: number;
  images?: string[];
  tags?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  sold?: number;
  views?: number;
  status?: "pending" | "approved" | "rejected" | string;
  specifications?: Record<string, string>;
  sentiment?: { positive: number; neutral: number; negative: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  stock: number;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, string>;
}

/**
 * Product API Resources
 * Wraps backend operations for products using core client fetch handlers.
 */

export interface StoreOption {
  id: string;
  name: string;
  rating: number;
  productCount: number;
}

export async function getStoreOptions() {
  return clientFetch<StoreOption[]>("/products/stores/options");
}

export async function getSellerOptions() {
  return clientFetch<StoreOption[]>("/products/sellers/options");
}

export interface CategoryCounts {
  /** Products matching the filters across every category. */
  total: number;
  /** Per-category product counts, keyed by category name. */
  counts: Record<string, number>;
}

/**
 * Per-category product counts for the current filters in ONE request.
 * Replaces firing a `/products` request per category just to read
 * X-Total-Count off each response.
 */
export async function getCategoryCounts(
  params?: Record<string, string | number | boolean | undefined>
) {
  return clientFetch<CategoryCounts>("/products/categories/counts", { params });
}

export async function getProducts(params?: Record<string, string | number | boolean | undefined>) {
  return clientFetch<Product[]>("/products", { params });
}

/** The authenticated seller's own catalog. Ownership is enforced server-side from the session. */
export async function getMyProducts() {
  return clientFetch<Product[]>("/products/mine");
}

export interface PagedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Same /products endpoint as `getProducts`, but also parses the
 * X-Total-Count / X-Page / X-Limit response headers the backend sends —
 * everything a page needs to drive real server-side pagination without
 * fetching (or counting) more than one page of items at a time.
 */
export async function getProductsPaged(
  params?: Record<string, string | number | boolean | undefined>
): Promise<PagedProducts> {
  const { data, headers } = await clientFetchWithHeaders<Product[]>("/products", { params });
  const total = Number(headers.get("X-Total-Count") ?? data.length);
  const page = Number(headers.get("X-Page") ?? params?.page ?? 1);
  const limit = Number(headers.get("X-Limit") ?? params?.limit ?? data.length ?? 1);
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;
  return { items: data, total, page, limit, totalPages };
}

export async function getProductById(id: string) {
  if (!id || id === "undefined" || id === "null" || id.trim() === "") {
    throw new ApiError("Invalid product ID", 400);
  }
  return clientFetch<Product>(`/products/${id}`);
}

export async function createProduct(data: CreateProductInput) {
  return clientMutation<Product>("/products", "POST", data);
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>) {
  return clientMutation<Product>(`/products/${id}`, "PUT", data);
}

export async function deleteProduct(id: string) {
  return clientMutation<{ success: boolean }>(`/products/${id}`, "DELETE");
}

export interface TrendingProductsResponse {
  count: number;
  products: Product[];
}

export async function getTrendingProducts(limit = 8): Promise<TrendingProductsResponse> {
  const res = await clientFetch<TrendingProductsResponse>("/products/trending", {
    params: { limit },
  });
  return res;
}