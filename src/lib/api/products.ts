import { clientFetch, clientFetchWithHeaders, clientMutation } from "@/lib/core/client";

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

export async function getProducts(params?: Record<string, string | number | boolean | undefined>) {
  return clientFetch<Product[]>("/products", { params });
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