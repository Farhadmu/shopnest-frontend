"use client";
import { useState } from "react";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";
import type { CategoryItem } from "../../../../types/category";
import { indentedOptionsFor } from "../../../../lib/utils/category-tree";

interface AddCategoryFormProps {
  categories: CategoryItem[];
  onAdded: () => void;
}

const NO_PARENT = "";

function errorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError || err instanceof Error) return err.message || fallback;
  return fallback;
}

export function AddCategoryForm({ categories, onAdded }: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(NO_PARENT);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const add = () => {
    if (!name.trim()) return;
    setError(null);
    setSubmitting(true);
    clientMutation("/categories", "POST", {
      name: name.trim(),
      parent: parentId || undefined,
    })
      .then(() => {
        setName("");
        setParentId(NO_PARENT);
        onAdded();
      })
      .catch((err) => setError(errorMessage(err, "Failed to add category.")))
      .finally(() => setSubmitting(false));
  };

  return (
    <div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-text placeholder:text-muted"
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-text sm:w-56"
        >
          <option value={NO_PARENT}>No parent (top-level)</option>
          {indentedOptionsFor(categories).map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          disabled={submitting}
          className="rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}