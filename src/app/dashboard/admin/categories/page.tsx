import { CategoryManager } from "@/components/dashboard/admin/categories/CategoryManager";
import { protectedFetch } from "@/lib/core/server";
import type { CategoryItem } from "@/types/category";

// Admin data must always reflect the latest DB state — never statically cached.
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let categories: CategoryItem[] = [];
  try {
    const res = await protectedFetch<CategoryItem[] | { data: CategoryItem[] }>("/categories");
    categories = Array.isArray(res) ? res : (res.data ?? []);
  } catch {
    // requireAuth/requireRole failures, network errors, etc. — fall back to
    // an empty list rather than crashing the page; the add/edit flows will
    // surface their own errors if the underlying auth problem persists.
    categories = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-black">Category Management</h1>
      <p className="mt-2 text-sm text-muted">Keep product discovery structured and searchable.</p>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}