import type { Product } from "@/lib/api/products";

export type AdminProduct = Omit<Product, "category"> & {
  _id?: string;
  brand?: string;
  category: string | { name?: string };
};

export function getProductId(product: AdminProduct): string {
  return String(product._id || product.id || "");
}

export function getCategoryName(product: AdminProduct): string {
  if (typeof product.category === "object" && product.category !== null) {
    return product.category.name || "General";
  }
  return String(product.category || "General");
}

export function getSKU(product: AdminProduct): string {
  const rawId = getProductId(product);
  return rawId ? `SKU-${rawId.slice(-6).toUpperCase()}` : "SKU-PROD01";
}

export function getBrandName(product: AdminProduct): string {
  return product.brand || (product.storeId ? `Store #${product.storeId.slice(-4)}` : "Verified Vendor");
}

export function isProductActive(product: AdminProduct): boolean {
  const status = (product.status || "active").toLowerCase();
  return status === "active" || status === "approved" || status === "published";
}
