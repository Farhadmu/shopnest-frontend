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

export async function getProducts(params?: Record<string, string | number | boolean | undefined>): Promise<Product[]> {
  try {
    const res = await clientFetch<any>("/products", { params });
    if (Array.isArray(res)) return res;
    if (res && typeof res === "object") {
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.products)) return res.data.products;
      if (Array.isArray(res.data?.items)) return res.data.items;
      if (Array.isArray(res.data?.data)) return res.data.data;
      if (Array.isArray(res.products)) return res.products;
      if (Array.isArray(res.items)) return res.items;
      if (Array.isArray(res.result)) return res.result;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product> {
  const res = await clientFetch<any>(`/products/${id}`);
  return (res?.data?.product ?? res?.data ?? res) as Product;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const res = await clientMutation<any>("/products", "POST", data);
  return (res?.data?.product ?? res?.data ?? res) as Product;
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
  const res = await clientMutation<any>(`/products/${id}`, "PUT", data);
  return (res?.data?.product ?? res?.data ?? res) as Product;
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const res = await clientMutation<any>(`/products/${id}`, "DELETE");
  return (res?.data ?? res) as { success: boolean };
}
