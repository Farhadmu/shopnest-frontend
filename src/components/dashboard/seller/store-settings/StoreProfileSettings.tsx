"use client";

import React from "react";
import { FaStore } from "react-icons/fa";
import { FiImage, FiTag, FiFileText } from "react-icons/fi";

const CATEGORIES = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Home & Living",
  "Beauty & Personal Care",
  "Groceries & Food",
  "Sports & Outdoors",
  "Books & Stationery",
  "Automotive & Accessories",
  "Toys & Baby",
];

const LOGO_PRESETS = [
  "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=150&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80",
];

const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80",
];

export interface StoreProfileFormData {
  storeName: string;
  category: string;
  description: string;
  logo: string;
  banner: string;
}

export interface StoreProfileSettingsProps {
  form: StoreProfileFormData;
  onChange: (updated: Partial<StoreProfileFormData>) => void;
}

export function StoreProfileSettings({ form, onChange }: StoreProfileSettingsProps) {
  const generatedSlug = form.storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FaStore size={18} />
        </div>
        <div>
          <h2 className="text-base font-black text-text">Store Identity & Branding</h2>
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
              value={form.category}
              onChange={(e) => onChange({ category: e.target.value })}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Store Description / Bio */}
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
          {/* Logo URL */}
          <div className="space-y-3">
            <label htmlFor="logoUrlInput" className="block text-xs font-bold text-text flex items-center gap-1">
              <FiImage size={13} /> Store Logo Image URL
            </label>
            <input
              id="logoUrlInput"
              type="url"
              value={form.logo}
              onChange={(e) => onChange({ logo: e.target.value })}
              placeholder="https://example.com/logo.jpg"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none transition"
            />

            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted-bg/30 text-muted overflow-hidden">
                {form.logo ? (
                  <img src={form.logo} alt="Logo Preview" className="h-full w-full object-cover" />
                ) : (
                  <FaStore size={22} />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted font-bold block">Or pick sample preset logo:</span>
                <div className="flex items-center gap-1.5">
                  {LOGO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange({ logo: preset })}
                      className="h-7 w-7 rounded-lg border border-border overflow-hidden hover:scale-105 transition cursor-pointer"
                    >
                      <img src={preset} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Banner URL */}
          <div className="space-y-3">
            <label htmlFor="bannerUrlInput" className="block text-xs font-bold text-text flex items-center gap-1">
              <FiImage size={13} /> Store Hero Banner URL
            </label>
            <input
              id="bannerUrlInput"
              type="url"
              value={form.banner}
              onChange={(e) => onChange({ banner: e.target.value })}
              placeholder="https://example.com/banner.jpg"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-primary focus:outline-none transition"
            />

            <div className="space-y-2">
              <div className="h-14 w-full rounded-2xl border border-border bg-muted-bg/30 overflow-hidden relative">
                {form.banner ? (
                  <img src={form.banner} alt="Banner Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-muted">
                    Banner Preview
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted">
                <span>Sample presets:</span>
                <div className="flex items-center gap-1.5">
                  {BANNER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange({ banner: preset })}
                      className="rounded-md border border-border px-2 py-0.5 text-[9px] font-bold hover:bg-primary/10 hover:text-primary transition cursor-pointer"
                    >
                      Banner {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
