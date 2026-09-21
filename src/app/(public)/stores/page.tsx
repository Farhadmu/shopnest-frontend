import StoresContent from "@/components/stores/StoresContent";
import { getPublicStores } from "@/lib/api/stores.server";
import type { Store } from "@/types/store";

export const dynamic = "force-dynamic";

export interface StoresPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function StoresPage({ searchParams }: StoresPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page || 1));
  const category = params?.category || "All Stores";
  const search = params?.search || "";
  const sort = params?.sort || "Highest Rated";

  let stores: Store[] = [];
  let categories = ["All Stores"];
  let categoryCounts: Record<string, number> = {};
  let totalApprovedStores = 0;
  let total = 0;
  let totalPages = 1;

  try {
    const result = await getPublicStores({
      page,
      limit: 12,
      category,
      search,
      sort,
    });
    stores = result.stores;
    categories = result.categories;
    categoryCounts = result.categoryCounts;
    totalApprovedStores = result.totalApprovedStores;
    total = result.total;
    totalPages = result.totalPages;
  } catch (error) {
    console.error("Failed to load public stores", error);
  }

  return (
    <StoresContent
      initialStores={stores}
      categories={categories}
      initialCategoryCounts={categoryCounts}
      totalApprovedStores={totalApprovedStores}
      initialTotal={total}
      initialPage={page}
      initialTotalPages={totalPages}
      initialCategory={category}
      initialSearch={search}
      initialSort={sort}
    />
  );
}