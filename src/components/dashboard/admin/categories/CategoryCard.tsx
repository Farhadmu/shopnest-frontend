"use client";
import { useState } from "react";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";
import type { CategoryItem } from "../../../../types/category";
import { idOf } from "../../../../lib/utils/category-tree";

interface CategoryCardProps {
  category: CategoryItem;
  parentName?: string | null;
  onEdit: (category: CategoryItem) => void;
  onDeleted: () => void;
}

export function CategoryCard({ category, parentName, onEdit, onDeleted }: CategoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    if (!window.confirm("Delete this category? This can't be undone.")) return;
    setError(null);
    setDeleting(true);
    clientMutation(`/categories/${idOf(category)}`, "DELETE")
      .then(() => onDeleted())
      .catch((err) => {
        const message =
          err instanceof ApiError || err instanceof Error ? err.message : "Failed to delete category.";
        setError(message);
      })
      .finally(() => setDeleting(false));
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-bold">{category.name}</span>
          <span className="truncate text-xs text-muted">{category.slug}</span>
          {parentName && <span className="truncate text-xs text-muted">Under: {parentName}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted/10"
          >
            Edit
          </button>
          <button
            onClick={remove}
            disabled={deleting}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}