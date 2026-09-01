"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryItem } from "../../../../types/category";
import { categoryNameMap, idOf } from "../../../../lib/utils/category-tree";
import { AddCategoryForm } from "./AddCategoryForm";
import { CategoryCard } from "./CategoryCard";
import { EditCategoryModal } from "./EditCategoryModal";

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CategoryItem | null>(null);

  const refresh = () => {
    setEditing(null);
    router.refresh();
  };

  const nameById = categoryNameMap(initialCategories);

  return (
    <div>
      <AddCategoryForm categories={initialCategories} onAdded={refresh} />

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {initialCategories.map((c) => {
          const parentId = c.parent ? String(c.parent) : null;
          return (
            <CategoryCard
              key={idOf(c)}
              category={c}
              parentName={parentId ? nameById.get(parentId) : null}
              onEdit={setEditing}
              onDeleted={refresh}
            />
          );
        })}
      </div>

      {editing && (
        <EditCategoryModal
          category={editing}
          categories={initialCategories}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}