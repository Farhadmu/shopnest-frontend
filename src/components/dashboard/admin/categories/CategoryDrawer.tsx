"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Image from "next/image";
import { X, UploadCloud, Loader2, FolderTree, Image as ImageIcon, Trash2, CheckCircle2, Sparkles } from "lucide-react";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";
import type { CategoryItem } from "@/types/category";
import { indentedOptionsFor, idOf } from "@/lib/utils/category-tree";

interface CategoryDrawerProps {
  isOpen: boolean;
  mode: "create" | "edit";
  category?: CategoryItem | null;
  initialParentId?: string | null;
  categories: CategoryItem[];
  onClose: () => void;
  onSuccess: () => void;
}

const NO_PARENT = "";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryDrawer({
  isOpen,
  mode,
  category,
  initialParentId,
  categories,
  onClose,
  onSuccess,
}: CategoryDrawerProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [parentId, setParentId] = useState(NO_PARENT);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state on drawer open or change
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && category) {
      setName(category.name || "");
      setSlug(category.slug || "");
      setAutoSlug(false);
      setParentId(category.parent ? String(category.parent) : NO_PARENT);
      setImageUrl(category.image || null);
    } else {
      setName("");
      setSlug("");
      setAutoSlug(true);
      setParentId(initialParentId ? String(initialParentId) : NO_PARENT);
      setImageUrl(null);
    }
    setError(null);
    setIsUploading(false);
    setIsSubmitting(false);
  }, [isOpen, mode, category, initialParentId]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setAutoSlug(false);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadImageToImgBB(file);
      setImageUrl(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Category slug is required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const body: Record<string, unknown> = {
      name: name.trim(),
      slug: slug.trim(),
      parent: parentId ? parentId : null,
      image: imageUrl || undefined,
    };

    try {
      if (mode === "edit" && category) {
        const catId = idOf(category);
        await clientMutation(`/categories/${catId}`, "PUT", body);
      } else {
        await clientMutation("/categories", "POST", body);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : `Failed to ${mode === "edit" ? "update" : "create"} category.`;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentOptions = indentedOptionsFor(categories, mode === "edit" && category ? idOf(category) : undefined);
  const selectedParentCategory = categories.find((c) => idOf(c) === parentId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-surface border-l border-border shadow-2xl transition ease-in-out duration-300 flex flex-col justify-between">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">
                  {mode === "edit" ? "Edit Category" : initialParentId ? "Add Sub-Category" : "New Root Category"}
                </h2>
                <p className="text-xs text-muted">
                  {mode === "edit"
                    ? `Update properties for ${category?.name || "category"}`
                    : initialParentId
                    ? `Creating nested child under "${selectedParentCategory?.name || "parent"}"`
                    : "Create a top-level category node"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-xl text-muted hover:text-text hover:bg-muted-bg transition-colors"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Smart Electronics, Men's Fashion"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                required
              />
            </div>

            {/* Category Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);
                    setSlug(generateSlug(name));
                  }}
                  className="cursor-pointer text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Auto-sync
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. smart-electronics"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs transition"
                required
              />
              <p className="text-[11px] text-muted mt-1">Used in URL routing: /categories/{slug || "slug"}</p>
            </div>

            {/* Parent Category Hierarchy */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Parent Category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={isSubmitting}
                className="cursor-pointer w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              >
                <option value={NO_PARENT}>📂 None (Top-level Root Category)</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {parentId && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-primary bg-primary/5 p-2 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Will be placed inside <strong>{selectedParentCategory?.name || "selected parent"}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Category Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                Category Image (Optional)
              </label>

              {imageUrl ? (
                <div className="relative group rounded-2xl border border-border overflow-hidden bg-muted-bg/40 p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border shrink-0 bg-background">
                    <Image
                      src={imageUrl}
                      alt={name || "Category image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text truncate">Image Uploaded</p>
                    <p className="text-[11px] text-muted truncate">{imageUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition"
                    title="Remove Image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted-bg/20 hover:bg-muted-bg/40 transition group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading || isSubmitting}
                    className="sr-only"
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <Loader2 className="h-7 w-7 animate-spin" />
                      <span className="text-xs font-medium">Uploading to ImgBB...</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-semibold text-text group-hover:text-primary transition-colors">
                          Click to upload image
                        </span>
                        <p className="text-[11px] text-muted mt-0.5">PNG, JPG, WEBP or SVG up to 32MB</p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-surface flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-text hover:bg-muted-bg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !name.trim()}
              className="cursor-pointer px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-hover active:scale-98 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{mode === "edit" ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                <span>{mode === "edit" ? "Save Changes" : "Create Category"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
