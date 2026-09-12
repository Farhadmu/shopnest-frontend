import { AdminProductsManager } from "@/components/dashboard/admin/products/AdminProductsManager";
import { protectedFetch } from "@/lib/core/server";
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
  } catch (err) {
    console.error("Failed to fetch initial admin products on server:", err);
  }

  return <AdminProductsManager initialProducts={products} />;
}
