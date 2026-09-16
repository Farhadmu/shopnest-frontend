import { protectedFetch } from "@/lib/core/server";
import type { CategoryItem } from "@/types/category";
import { HeroBannersOverview } from "@/components/dashboard/admin/hero-banners/HeroBannersOverview";

export const dynamic = "force-dynamic";

export default async function AdminHeroBannersPage() {
  let categories: CategoryItem[] = [];
  try {
    const response = await protectedFetch<CategoryItem[] | { data: CategoryItem[] }>("/categories");
    categories = Array.isArray(response) ? response : response.data ?? [];
  } catch {
    categories = [];
  }

  return <HeroBannersOverview categories={categories} />;
}