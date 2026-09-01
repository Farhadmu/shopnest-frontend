import { AdminProductsManager } from "@/components/dashboard/admin/products/AdminProductsManager";
import { protectedFetch, publicFetch } from "@/lib/core/server";
import type { Product } from "@/lib/api/products";

// Admin products data must always reflect the latest DB state — never statically cached.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: Product[] = [];

  try {
    const res = await protectedFetch<Product[] | { data: Product[] }>("/products", {
      params: { limit: 100 },
    });
    products = Array.isArray(res) ? res : (res?.data ?? []);
  } catch {
    try {
      const res = await publicFetch<Product[] | { data: Product[] }>("/products", {
        params: { limit: 100 },
      });
      products = Array.isArray(res) ? res : (res?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch initial products on server:", err);
      products = [];
    }
  }

  return <AdminProductsManager initialProducts={products} />;
}
