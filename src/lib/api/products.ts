import { publicFetch, protectedMutation } from "@/lib/core/server";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  storeId: string;
  stock: number;
  createdAt: string;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

/**
 * Product API Resources
 * Wraps backend operations for products using core server fetch handlers.
 */

export async function getProducts(params?: Record<string, string | number>) {
  return publicFetch<Product[]>("/products", { params });
}

export async function getProductById(id: string) {
  return publicFetch<Product>(`/products/${id}`);
}

export async function createProduct(data: CreateProductInput) {
  return protectedMutation<Product>("/products", "POST", data);
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>) {
  return protectedMutation<Product>(`/products/${id}`, "PUT", data);
}

export async function deleteProduct(id: string) {
  return protectedMutation<{ success: boolean }>(`/products/${id}`, "DELETE");
}
