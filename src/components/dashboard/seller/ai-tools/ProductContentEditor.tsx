"use client";

import React from "react";

export interface ProductContentEditorProps {
  content: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function ProductContentEditor({ content, onChange, disabled }: ProductContentEditorProps) {
  const update = (key: string, value: unknown) => {
    onChange({ [key]: value });
  };

  const updateArray = (key: string, index: number, value: string) => {
    const arr = (content[key] as string[]) || [];
    const next = [...arr];
    next[index] = value;
    update(key, next);
  };

  const addArrayItem = (key: string) => {
    const arr = (content[key] as string[]) || [];
    update(key, [...arr, ""]);
  };

  const removeArrayItem = (key: string, index: number) => {
    const arr = (content[key] as string[]) || [];
    update(key, arr.filter((_, i) => i !== index));
  };

  const updateSpec = (specKey: string, value: string) => {
    const specs: Record<string, string> = { ...(content.specifications as Record<string, string>) };
    specs[specKey] = value;
    update("specifications", specs);
  };

  const removeSpec = (specKey: string) => {
    const specs: Record<string, string> = { ...(content.specifications as Record<string, string>) };
    delete specs[specKey];
    update("specifications", specs);
  };

  const addSpec = () => {
    const specs: Record<string, string> = { ...(content.specifications as Record<string, string>) };
    const idx = Object.keys(specs).length + 1;
    specs[`Specification ${idx}`] = "";
    update("specifications", specs);
  };

  const updateVariant = (index: number, patch: Record<string, unknown>) => {
    const variants = [...((content.variants as Array<Record<string, unknown>>) || [])];
    variants[index] = { ...variants[index], ...patch };
    update("variants", variants);
  };

  const addVariant = () => {
    const variants = [...((content.variants as Array<Record<string, unknown>>) || [])];
    variants.push({ name: "", color: "", priceDelta: 0 });
    update("variants", variants);
  };

  const removeVariant = (index: number) => {
    const variants = (content.variants as Array<Record<string, unknown>>) || [];
    update("variants", variants.filter((_, i) => i !== index));
  };

  const priceRange = (content.currentPriceRange as Record<string, unknown>) || {};
  const specs = (content.specifications as Record<string, string>) || {};

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Product Title</label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => update("title", e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
          placeholder="Enter product title"
        />
      </div>

      {/* Brand / Model / Category Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Brand</label>
          <input
            type="text"
            value={(content.brand as string) || ""}
            onChange={(e) => update("brand", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="Brand"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Model</label>
          <input
            type="text"
            value={(content.model as string) || ""}
            onChange={(e) => update("model", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="Model"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Category</label>
          <input
            type="text"
            value={(content.category as string) || ""}
            onChange={(e) => update("category", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="e.g. Electronics"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Subcategory</label>
          <input
            type="text"
            value={(content.subcategory as string) || ""}
            onChange={(e) => update("subcategory", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="e.g. Audio"
          />
        </div>
      </div>

      {/* Price Range Display */}
      {(priceRange.min !== null && priceRange.max !== null) && (
        <div className="rounded-xl bg-muted-bg/50 p-4 border border-border/50">
          <p className="text-xs font-bold text-muted mb-1">Market Price Range (AI Research)</p>
          <p className="text-sm font-black text-text">
            ৳{Number(priceRange.min).toLocaleString()} - ৳{Number(priceRange.max).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted mt-1">{String(priceRange.source || "Based on market research")}</p>
        </div>
      )}

      {/* Short Description */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Short Description</label>
        <textarea
          value={(content.shortDescription as string) || ""}
          onChange={(e) => update("shortDescription", e.target.value)}
          disabled={disabled}
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
          placeholder="Brief product summary (max 200 characters)"
        />
      </div>

      {/* Long Description */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Description</label>
        <textarea
          value={(content.description as string) || ""}
          onChange={(e) => update("description", e.target.value)}
          disabled={disabled}
          rows={8}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
          placeholder="Detailed product description"
        />
      </div>

      {/* Features */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Key Features</label>
        <div className="space-y-2">
          {((content.features as string[]) || []).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <input
                type="text"
                value={feat}
                onChange={(e) => updateArray("features", idx, e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Feature"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("features", idx)}
                disabled={disabled}
                className="text-muted hover:text-rose-500 disabled:opacity-60"
                title="Remove feature"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("features")}
            disabled={disabled}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            + Add Feature
          </button>
        </div>
      </div>

      {/* Specifications */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Specifications</label>
        <div className="space-y-2">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newSpecs = { ...specs };
                  const val = newSpecs[key];
                  delete newSpecs[key];
                  newSpecs[e.target.value] = val;
                  update("specifications", newSpecs);
                }}
                disabled={disabled}
                className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Key"
              />
              <span className="text-muted">:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => updateSpec(key, e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Value"
              />
              <button
                type="button"
                onClick={() => removeSpec(key)}
                disabled={disabled}
                className="text-muted hover:text-rose-500 disabled:opacity-60"
                title="Remove spec"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpec}
            disabled={disabled}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            + Add Specification
          </button>
        </div>
      </div>

      {/* Variants */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Variants (if applicable)</label>
        <div className="space-y-2">
          {((content.variants as Array<Record<string, unknown>>) || []).map((variant, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={String(variant.name || "")}
                onChange={(e) => updateVariant(idx, { name: e.target.value })}
                disabled={disabled}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Variant name (e.g. Red, XL)"
              />
              <input
                type="text"
                value={String(variant.color || "")}
                onChange={(e) => updateVariant(idx, { color: e.target.value })}
                disabled={disabled}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Color"
              />
              <input
                type="number"
                value={Number(variant.priceDelta || 0)}
                onChange={(e) => updateVariant(idx, { priceDelta: Number(e.target.value) })}
                disabled={disabled}
                className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Δ Price"
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                disabled={disabled}
                className="text-muted hover:text-rose-500 disabled:opacity-60"
                title="Remove variant"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariant}
            disabled={disabled}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            + Add Variant
          </button>
        </div>
      </div>

      {/* Why Buy */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Why Choose This Product?</label>
        <textarea
          value={(content.whyBuy as string) || ""}
          onChange={(e) => update("whyBuy", e.target.value)}
          disabled={disabled}
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
          placeholder="Explain the genuine benefits..."
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Highlights</label>
        <div className="space-y-2">
          {((content.highlights as string[]) || []).map((hl, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <input
                type="text"
                value={hl}
                onChange={(e) => updateArray("highlights", idx, e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Highlight"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("highlights", idx)}
                disabled={disabled}
                className="text-muted hover:text-rose-500 disabled:opacity-60"
                title="Remove highlight"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("highlights")}
            disabled={disabled}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            + Add Highlight
          </button>
        </div>
      </div>

      {/* SEO */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">SEO Title</label>
          <input
            type="text"
            value={(content.seoTitle as string) || ""}
            onChange={(e) => update("seoTitle", e.target.value)}
            disabled={disabled}
            maxLength={70}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="SEO optimized title"
          />
          <p className="mt-1 text-[10px] text-muted">{((content.seoTitle as string) || "").length}/70 chars</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Meta Description</label>
          <textarea
            value={(content.seoDescription as string) || ""}
            onChange={(e) => update("seoDescription", e.target.value)}
            disabled={disabled}
            rows={2}
            maxLength={160}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
            placeholder="SEO meta description"
          />
          <p className="mt-1 text-[10px] text-muted">{((content.seoDescription as string) || "").length}/160 chars</p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Tags</label>
        <div className="space-y-2">
          {((content.tags as string[]) || []).map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-primary">#</span>
              <input
                type="text"
                value={tag}
                onChange={(e) => updateArray("tags", idx, e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                placeholder="Tag"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("tags", idx)}
                disabled={disabled}
                className="text-muted hover:text-rose-500 disabled:opacity-60"
                title="Remove tag"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("tags")}
            disabled={disabled}
            className="text-xs font-bold text-primary hover:underline disabled:opacity-60"
          >
            + Add Tag
          </button>
        </div>
      </div>

      {/* Marketing Caption */}
      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Marketing Caption</label>
        <textarea
          value={(content.marketingCaption as string) || ""}
          onChange={(e) => update("marketingCaption", e.target.value)}
          disabled={disabled}
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
          placeholder="Short promotional caption for social media..."
        />
      </div>
    </div>
  );
}
