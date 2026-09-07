import { protectedFetch } from "@/lib/core/server";
import type { CategoryItem } from "@/types/category";
import { HeroBannerManager } from "@/components/dashboard/admin/hero-banners/HeroBannerManager";

export const dynamic = "force-dynamic";

export default async function AdminHeroBannersPage() {
  let categories: CategoryItem[] = [];
  try {
    const response = await protectedFetch<CategoryItem[] | { data: CategoryItem[] }>("/categories");
    categories = Array.isArray(response) ? response : response.data ?? [];
  } catch {
    categories = [];
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-text">Hero Banner Management</h1>
      <p className="mt-2 text-sm text-muted">Create category-specific campaigns and control their display order.</p>
      <HeroBannerManager categories={categories} />
    </div>
  );
}