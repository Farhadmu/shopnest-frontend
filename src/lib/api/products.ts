import { clientFetch, clientMutation } from "@/lib/core/client";

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
