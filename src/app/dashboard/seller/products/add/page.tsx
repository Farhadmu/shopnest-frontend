"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaMagic,
  FaBox,
  FaTags,
  FaDollarSign,
  FaImage,
  FaCheckCircle,
} from "react-icons/fa";
import { createProduct, getProductById, updateProduct } from "@/lib/api/products";
import { clientFetch, clientMutation } from "@/lib/core/client";

interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
}

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState<string[]>([
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Books",
    "Gadgets",
  ]);

  const [form, setForm] = useState({
    title: "",
    category: "Electronics",
    price: "",
    discountPrice: "",
    stock: "20",
    description: "",
    imageUrl: "",
    tagsInput: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load existing product if edit mode
  useEffect(() => {
    // Fetch categories
    clientFetch<any>("/categories")
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (list.length > 0) {
          setCategories(list.map((c: any) => c.name || c.title));
        }
      })
      .catch(() => undefined);

    if (editId) {
      setIsLoading(true);
      getProductById(editId)
        .then((p) => {
          setForm({
            title: p.title || "",
            category: p.category || "Electronics",
            price: String(p.price || ""),
            discountPrice: p.discountPrice ? String(p.discountPrice) : "",
            stock: String(p.stock ?? 20),
            description: p.description || "",
            imageUrl: p.images?.[0] || "",
            tagsInput: (p.tags || []).join(", "),
          });
        })
        .catch((err) => {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load product for editing");
        })
        .finally(() => setIsLoading(false));
    }
  }, [editId]);

  // AI Content Generator
  const handleAiGenerate = async () => {
    if (!form.title.trim()) {
      setErrorMsg("Please enter a Product Title first before generating AI content.");
      return;
    }

    setIsAiGenerating(true);
    setErrorMsg("");
    try {
      const res = await clientMutation<any>("/ai/product-description", "POST", {
        productName: form.title.trim(),
        category: form.category,
        features: form.tagsInput
          ? form.tagsInput.split(",").map((t) => t.trim())
          : ["High quality", "Durable", "Fast delivery"],
      });

      const data = res?.data ?? res;
      if (data?.description) {
        setForm((prev) => ({
          ...prev,
          description: data.description,
          tagsInput: data.tags && Array.isArray(data.tags) ? data.tags.join(", ") : prev.tagsInput,
        }));
        setSuccessMsg("✨ AI generated rich description and tags successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Product title is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setErrorMsg("Please enter a valid price (৳)");
      return;
    }
    if (!form.description.trim()) {
      setErrorMsg("Product description is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const tags = form.tagsInput
      ? form.tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [form.category.toLowerCase()];

    const images = form.imageUrl.trim() ? [form.imageUrl.trim()] : [];

    const payload = {
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock) || 0,
      description: form.description.trim(),
      images: images.length > 0 ? images : undefined,
      tags,
    };

    try {
      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await createProduct(payload);
      }
      setSuccessMsg(
        editId ? "Product updated successfully!" : "Product published to catalog successfully!"
      );
      setTimeout(() => {
        router.push("/dashboard/seller/products");
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/seller/products"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-muted transition hover:border-primary/40 hover:text-text"
        >
          <FaArrowLeft size={10} /> Back to Products
        </Link>
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Seller Center
        </span>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text sm:text-3xl">
              {editId ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              List high quality merchandise with AI-enhanced content and verified seller guarantees.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={isAiGenerating}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-95 disabled:opacity-50"
          >
            <FaMagic size={12} />{" "}
            {isAiGenerating ? "Generating with AI..." : "✨ AI Generate Content"}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-6">
          {/* Title & Category */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Product Title <span className="text-error">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Wireless Noise-Cancelling Headphones Pro"
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Category <span className="text-error">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Regular Price (৳) <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-bold text-muted">৳</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="3500"
                  required
                  className="w-full rounded-2xl border border-border bg-background py-3.5 pl-9 pr-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Discount Price (৳)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-bold text-muted">৳</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.discountPrice}
                  onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                  placeholder="2990"
                  className="w-full rounded-2xl border border-border bg-background py-3.5 pl-9 pr-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
                Initial Stock <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="25"
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Product Image URL
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-... or upload image URL"
                className="flex-1 rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            {form.imageUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted-bg">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <span className="text-xs text-muted">Live image preview</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Tags / Keywords (comma separated)
            </label>
            <input
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="e.g. bluetooth, wireless, gaming, noise cancelling, bass"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                Product Description <span className="text-error">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
              >
                Auto-write with AI ✨
              </button>
            </div>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of features, specifications, and warranty details..."
              required
              className="w-full rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Submit */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/seller/products"
              className="rounded-2xl border border-border px-6 py-3.5 text-center text-sm font-bold text-text transition hover:bg-muted-bg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-primary px-8 py-3.5 text-center text-sm font-black text-white shadow-xl shadow-primary/25 transition hover:bg-primary-hover disabled:opacity-50"
            >
              {isLoading ? "Saving Product..." : editId ? "Update Product" : "Publish Product →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading product editor...</div>}>
      <AddProductForm />
    </Suspense>
  );
}
