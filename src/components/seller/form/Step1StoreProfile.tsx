// frontend/src/components/seller/form/Step1StoreProfile.tsx
"use client";

import React, { useState } from "react";
import { FiUploadCloud, FiLink, FiTrash2, FiLoader } from "react-icons/fi";
import { CATEGORIES } from "@/lib/constants/seller-application";
import { StepProps } from "@/types/seller-application";
import Image from "next/image";

export function Step1StoreProfile({ formData, onChange }: StepProps) {
  const [logoMode, setLogoMode] = useState<"upload" | "url">("upload");
  const [bannerMode, setBannerMode] = useState<"upload" | "url">("upload");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const slugPreview = formData.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const uploadToImgBB = async (file: File): Promise<string> => {
    const body = new FormData();
    body.append("image", file);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY || "6d7007353630f7e44ae70d651786f68c";

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || "Failed to upload image");
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "banner",
    setLoading: (loading: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const uploadedUrl = await uploadToImgBB(file);
      onChange(field, uploadedUrl);
    } catch (err) {
      alert("Image upload failed. Please try again or paste direct URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-black text-text">1. Store Branding & Identity</h2>
        <p className="text-[11px] text-muted">Tell customers who you are and establish your brand on ShopNest.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            Store Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Apex Electronics"
            value={formData.storeName}
            onChange={(e) => onChange("storeName", e.target.value)}
            required
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
          {slugPreview && (
            <span className="text-[10px] flex items-center gap-1 text-muted">
              URL: <code className="font-mono text-primary font-bold">shopnest.com/store/{slugPreview}</code>
            </span>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-text">
            Primary Category <span className="text-error">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => onChange("category", e.target.value)}
            required
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2 text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-bold text-text">
          Store Bio & Description <span className="text-error">*</span>
        </label>
        <textarea
          placeholder="Introduce your business, products, quality guarantees, and dispatch turnaround time..."
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          required
          rows={2}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Store Logo Section */}
        <div className="space-y-2 rounded-md border border-border p-3 bg-muted-bg/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text">Store Logo</span>
            <div className="flex items-center gap-1 rounded-md bg-surface p-0.5 border border-border text-[10px]">
              <button
                type="button"
                onClick={() => setLogoMode("upload")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                  logoMode === "upload" ? "bg-primary text-white font-bold" : "text-muted hover:text-text"
                }`}
              >
                <FiUploadCloud size={11} /> Upload
              </button>
              <button
                type="button"
                onClick={() => setLogoMode("url")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                  logoMode === "url" ? "bg-primary text-white font-bold" : "text-muted hover:text-text"
                }`}
              >
                <FiLink size={11} /> URL
              </button>
            </div>
          </div>

          {formData.logo ? (
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-2 shadow-xs">
              <Image
                src={formData.logo}
                alt="Store Logo Preview"
                height={10}
                width={10}
                
                className="h-10 w-10 rounded-md object-cover border border-border shrink-0 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Logo";
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-text block">Logo Image Attached</span>
                <p className="text-[9px] text-muted truncate font-mono">{formData.logo}</p>
              </div>
              <button
                type="button"
                title="Remove logo"
                onClick={() => onChange("logo", "")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-error hover:bg-error/10 transition cursor-pointer shrink-0"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          ) : logoMode === "upload" ? (
            <label className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-surface p-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition">
              {uploadingLogo ? (
                <span className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <FiLoader className="animate-spin" /> Uploading to ImgBB...
                </span>
              ) : (
                <>
                  <FiUploadCloud className="text-primary text-xl" />
                  <span className="text-[10px] text-text font-medium">Click to upload logo</span>
                  <span className="text-[8px] text-muted">PNG, JPG up to 5MB</span>
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
            <input
              type="url"
              placeholder="https://i.ibb.co/..."
              value={formData.logo}
              onChange={(e) => onChange("logo", e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          )}
        </div>

        {/* Store Banner Section */}
        <div className="space-y-2 rounded-md border border-border p-3 bg-muted-bg/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text">Store Banner</span>
            <div className="flex items-center gap-1 rounded-md bg-surface p-0.5 border border-border text-[10px]">
              <button
                type="button"
                onClick={() => setBannerMode("upload")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                  bannerMode === "upload" ? "bg-primary text-white font-bold" : "text-muted hover:text-text"
                }`}
              >
                <FiUploadCloud size={11} /> Upload
              </button>
              <button
                type="button"
                onClick={() => setBannerMode("url")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition ${
                  bannerMode === "url" ? "bg-primary text-white font-bold" : "text-muted hover:text-text"
                }`}
              >
                <FiLink size={11} /> URL
              </button>
            </div>
          </div>

          {formData.banner ? (
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-2 shadow-xs">
              <Image
                src={formData.banner}
                alt="Store Banner Preview"
                height={10}
                width={16}
                className="rounded-md object-cover border border-border shrink-0 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/200x100?text=Banner";
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-text block">Banner Image Attached</span>
                <p className="text-[9px] text-muted truncate font-mono">{formData.banner}</p>
              </div>
              <button
                type="button"
                title="Remove banner"
                onClick={() => onChange("banner", "")}
                className="flex h-7 w-7 items-center justify-center rounded-md text-error hover:bg-error/10 transition cursor-pointer shrink-0"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          ) : bannerMode === "upload" ? (
            <label className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-surface p-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition">
              {uploadingBanner ? (
                <span className="flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <FiLoader className="animate-spin" /> Uploading to ImgBB...
                </span>
              ) : (
                <>
                  <FiUploadCloud className="text-primary text-xl" />
                  <span className="text-[10px] text-text font-medium">Click to upload banner</span>
                  <span className="text-[8px] text-muted">PNG, JPG up to 5MB</span>
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
            <input
              type="url"
              placeholder="https://i.ibb.co/..."
              value={formData.banner}
              onChange={(e) => onChange("banner", e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          )}
        </div>
      </div>
    </div>
  );
}