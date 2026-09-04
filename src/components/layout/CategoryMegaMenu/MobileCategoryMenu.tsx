// Server component — fetches categories, renders a mobile accordion tree.
// onNavigate cannot be passed (functions aren't serialisable across the
// Server→Client boundary). Closing the mobile drawer is handled by the
// parent client component listening to pathname changes.
import { getCategories } from "@/lib/api/categories";
import { buildCategoryTree, idOf } from "@/lib/utils/category-tree";
import { MobileCategoryRow } from "./MobileCategoryRow";

export async function MobileCategoryMenu() {
  const categories = await getCategories().catch(() => []);
  const tree = buildCategoryTree(categories);

  if (tree.length === 0) return null;

  return (
    <div className="mb-2 rounded-xl border border-border bg-surface p-1">
      {tree.map((root) => (
        <MobileCategoryRow key={idOf(root)} node={root} />
      ))}
    </div>
  );
}