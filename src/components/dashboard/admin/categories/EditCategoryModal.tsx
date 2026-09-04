"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";
import type { CategoryItem } from "../../../../types/category";
import { indentedOptionsFor, idOf } from "../../../../lib/utils/category-tree";

interface EditCategoryModalProps {
  category: CategoryItem;
  categories: CategoryItem[];
  onClose: () => void;
  onSaved: () => void;
}

const NO_PARENT = "";

export function EditCategoryModal({ category, categories, onClose, onSaved }: EditCategoryModalProps) {
  const id = idOf(category);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [parentId, setParentId] = useState(category.parent ? String(category.parent) : NO_PARENT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = () => {
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug can't be empty.");
      return;
    }
    setError(null);
    setSaving(true);
    clientMutation(`/categories/${id}`, "PUT", {
      name: name.trim(),
      slug: slug.trim(),
      // Explicit null clears the parent (root-level again); the backend
      // schema accepts null specifically to support this case.
      parent: parentId || null,
    })
      .then(() => onSaved())
      .catch((err) => {
        const message =
          err instanceof ApiError || err instanceof Error ? err.message : "Failed to update category.";
        setError(message);
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          disabled={saving}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-muted transition-colors hover:bg-muted/10 hover:text-text disabled:cursor-not-allowed"
        >
          <FiX className="text-xl" />
        </button>

        <h2 className="text-lg font-bold text-text">Edit Category</h2>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-text/70">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text/70">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={saving}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-muted"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text/70">Parent</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              disabled={saving}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
            >
              <option value={NO_PARENT}>No parent (top-level)</option>
              {indentedOptionsFor(categories, id).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}