"use client";

import React, { useState } from "react";
import { FaStore } from "react-icons/fa";
import { FiTag, FiFileText, FiUploadCloud, FiLink, FiTrash2, FiLoader } from "react-icons/fi";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";

export interface StoreProfileFormData {
  storeName: string;
  categoryId: string;
  description: string;
  logo: string;
  banner: string;
}

export interface StoreProfileSettingsProps {
  form: StoreProfileFormData;
  onChange: (updated: Partial<StoreProfileFormData>) => void;
}

export function StoreProfileSettings({ form, onChange }: StoreProfileSettingsProps) {
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState(form.logo || "");
  const [bannerUrlInput, setBannerUrlInput] = useState(form.banner || "");
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  const generatedSlug = form.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "banner",
    setLoading: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const result = await uploadImageToImgBB(file);
      onChange({ [field]: result.url });
    } catch {
      alert("Image upload failed. Please try again or paste a direct URL.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FaStore size={18} />
        </div>
        <div>
          <h2 className="text-base font-black text-text">Store Identity &amp; Branding</h2>
          <p className="text-xs text-muted">Configure public store profile, bio description, logo, and banner assets.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Store Name & Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="storeNameInput" className="block text-xs font-bold text-text mb-1.5 flex items-center justify-between">
              <span>Store Name <span className="text-rose-500">*</span></span>
              <span className="text-[10px] text-muted font-normal">Public Name</span>
            </label>
            <input
              id="storeNameInput"
              type="text"
              value={form.storeName}
              onChange={(e) => onChange({ storeName: e.target.value })}
              placeholder="e.g. Urban Threads Apparel"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              required
            />
            {form.storeName && (
              <p className="mt-1.5 text-[11px] text-muted font-mono">
                Store URL: <span className="text-primary font-bold">/stores/{generatedSlug || "slug"}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="categorySelect" className="block text-xs font-bold text-text mb-1.5 flex items-center gap-1">
              <FiTag size={13} /> Primary Category
            </label>
            <select
              id="categorySelect"
              value={form.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              disabled={categoriesLoading}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" disabled hidden>
                {categoriesLoading ? "Loading categories..." : categoriesError || "Select a category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Store Description */}
        <div>
          <label htmlFor="storeDescInput" className="block text-xs font-bold text-text mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1"><FiFileText size={13} /> Store Description / Bio</span>
            <span className="text-[10px] text-muted">{form.description.length} / 500 characters</span>
          </label>
          <textarea
            id="storeDescInput"
            rows={4}
            maxLength={500}
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe your brand identity, specialty products, customer service guarantees..."
            className="w-full rounded-2xl border border-border bg-surface p-4 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition leading-relaxed"
          />
        </div>

        {/* Branding Assets: Logo & Banner */}
        <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-border">

          {/* ── Store Logo ── */}
          <div className="space-y-3 rounded-2xl border border-border bg-muted-bg/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-text">Store Logo</span>
              <div className="flex items-center gap-1 rounded-xl bg-surface p-0.5 border border-border text-[10px]">
                <button
                  type="button"
                  onClick={() => setLogoMode("upload")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    logoMode === "upload" ? "bg-primary text-white" : "text-muted hover:text-text"
                  }`}
                >
                  <FiUploadCloud size={11} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => setLogoMode("url")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    logoMode === "url" ? "bg-primary text-white" : "text-muted hover:text-text"
                  }`}
                >
                  <FiLink size={11} /> URL
                </button>
              </div>
            </div>

            {form.logo ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-xs">
                <Image
                  src={form.logo}
                  alt="Store Logo Preview"
                  height={80}
                  width={80}
                  className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-text block">Logo Attached</span>
                  <p className="text-[9px] text-muted truncate font-mono">{form.logo}</p>
                </div>
                <button
                  type="button"
                  title="Remove logo"
                  onClick={() => { onChange({ logo: "" }); setLogoUrlInput(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ) : logoMode === "upload" ? (
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface p-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition group">
                {uploadingLogo ? (
                  <span className="flex items-center gap-2 text-xs text-primary font-semibold">
                    <FiLoader className="animate-spin" size={16} /> Uploading to ImgBB...
                  </span>
                ) : (
                  <>
                    <FiUploadCloud size={22} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-text">Click to upload logo</span>
                    <span className="text-[9px] text-muted">PNG, JPG, WEBP – up to 32 MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingLogo}
                  onChange={(e) => handleFileUpload(e, "logo", setUploadingLogo)}
                />
              </label>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://i.ibb.co/..."
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  onBlur={() => { if (logoUrlInput.trim()) onChange({ logo: logoUrlInput.trim() }); }}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => { if (logoUrlInput.trim()) onChange({ logo: logoUrlInput.trim() }); }}
                  className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* ── Store Banner ── */}
          <div className="space-y-3 rounded-2xl border border-border bg-muted-bg/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-text">Store Hero Banner</span>
              <div className="flex items-center gap-1 rounded-xl bg-surface p-0.5 border border-border text-[10px]">
                <button
                  type="button"
                  onClick={() => setBannerMode("upload")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    bannerMode === "upload" ? "bg-primary text-white" : "text-muted hover:text-text"
                  }`}
                >
                  <FiUploadCloud size={11} /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => setBannerMode("url")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    bannerMode === "url" ? "bg-primary text-white" : "text-muted hover:text-text"
                  }`}
                >
                  <FiLink size={11} /> URL
                </button>
              </div>
            </div>

            {form.banner ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-xs">
                <Image
                  src={form.banner}
                  alt="Store Banner Preview"
                  height={64}
                  width={128}
                  className="h-14 w-28 rounded-xl object-cover border border-border shrink-0 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/200x100?text=Banner";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-text block">Banner Attached</span>
                  <p className="text-[9px] text-muted truncate font-mono">{form.banner}</p>
                </div>
                <button
                  type="button"
                  title="Remove banner"
                  onClick={() => { onChange({ banner: "" }); setBannerUrlInput(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ) : bannerMode === "upload" ? (
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-surface p-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition group">
                {uploadingBanner ? (
                  <span className="flex items-center gap-2 text-xs text-primary font-semibold">
                    <FiLoader className="animate-spin" size={16} /> Uploading to ImgBB...
                  </span>
                ) : (
                  <>
                    <FiUploadCloud size={22} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-text">Click to upload banner</span>
                    <span className="text-[9px] text-muted">PNG, JPG, WEBP – up to 32 MB · Recommended 1200×400</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingBanner}
                  onChange={(e) => handleFileUpload(e, "banner", setUploadingBanner)}
                />
              </label>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://i.ibb.co/..."
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  onBlur={() => { if (bannerUrlInput.trim()) onChange({ banner: bannerUrlInput.trim() }); }}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => { if (bannerUrlInput.trim()) onChange({ banner: bannerUrlInput.trim() }); }}
                  className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
