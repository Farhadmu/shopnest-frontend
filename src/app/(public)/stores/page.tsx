import StoresContent from "@/components/stores/StoresContent";
import { getPublicStores } from "@/lib/api/stores.server";
import type { Store } from "@/types/store";

export default async function StoresPage() {
  let stores: Store[] = [];
  let categories = ["All Stores"];

  try {
    const result = await getPublicStores();
    stores = result.stores;
    categories = result.categories;
  } catch (error) {
    console.error("Failed to load public stores", error);
  }

  return (
    <StoresContent
      stores={stores}
      categories={categories}
    />
  );
}