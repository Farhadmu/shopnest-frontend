import StoresContent from "@/components/stores/StoresContent";
import { categories, stores } from "@/data/stores";

export default function StoresPage() {
  return (
    <StoresContent
      stores={stores}
      categories={categories}
    />
  );
}