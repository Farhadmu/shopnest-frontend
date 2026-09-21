import { CategoryManager } from "@/components/dashboard/admin/categories/CategoryManager";
import { protectedFetch } from "@/lib/core/server";
import type { CategoryItem } from "@/types/category";
import { FolderTree, Sparkles } from "lucide-react";

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderTree className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">Category Management</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Hierarchical View
            </span>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Organize catalog taxonomy with expandable subcategories, instant search, and smart hierarchy controls.
          </p>
        </div>
      </div>

      {/* Main Interactive Category Manager Component */}
      <CategoryManager initialCategories={categories} />
    </div>
  );
}