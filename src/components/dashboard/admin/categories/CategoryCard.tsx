"use client";

import { useState } from "react";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";
import type { CategoryItem } from "../../../../types/category";
import { idOf } from "../../../../lib/utils/category-tree";
import Image from "next/image";

interface CategoryCardProps {
  category: CategoryItem;
  parentName?: string | null;
  onEdit: (category: CategoryItem) => void;
  onDeleted: () => void;
}

export function CategoryCard({
  category,
  parentName,
  onEdit,
  onDeleted,
}: CategoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const remove = () => {
    if (!window.confirm("Delete this category? This can't be undone.")) {
      return;
    }

    setError(null);
    setDeleting(true);

    clientMutation(`/categories/${idOf(category)}`, "DELETE")
      .then(() => onDeleted())
      .catch((err) => {
        const message =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to delete category.";

        setError(message);
      })
      .finally(() => setDeleting(false));
  };

  const hasImage = Boolean(category.image) && !imageError;

  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-surface p-4">
      {/* Category information */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Category image */}
        {hasImage ? (
          <Image
            src={category.image!}
            alt={category.name}
            width={40}
            height={40}
            className="rounded object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted/20 text-sm font-bold text-muted">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Category details */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="truncate font-bold text-text"
            title={category.name}
          >
            {category.name}
          </p>

          <p
            className="truncate text-xs text-muted"
            title={category.slug}
          >
            {category.slug}
          </p>

          {parentName && (
            <p
              className="truncate text-xs text-muted"
              title={`Under: ${parentName}`}
            >
              Under: {parentName}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex w-full items-center justify-end gap-2 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text transition hover:bg-muted/10"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="wrap-break-word text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}