"use client";

import { useState, type ChangeEvent } from "react";
import { X, Trash2, Sun, Moon, Sparkles, Wand2, Check, AlertTriangle, CheckCircle2, RefreshCw, Palette } from "lucide-react";
import type { HeroBanner } from "@/lib/api/hero-banners";
import { createHeroBanner, updateHeroBanner, deleteHeroBanner } from "@/lib/api/hero-banners";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";
import {
  BANNER_COLOR_PRESETS,
  type BannerColorPreset,
  extractColorsFromImageUrl,
  analyzeBannerContrast,
  getAutoFixColors,
  type ExtractedPalette,
} from "@/lib/utils/banner-color-utils";
import type { EditSlot } from "./types";

interface HeroBannerEditModalProps {
  slot: EditSlot;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-muted focus:border-primary focus:outline-none";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted";

export function HeroBannerEditModal({ slot, onClose, onSaved }: HeroBannerEditModalProps) {
  const existing = slot.banner;
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const [placement, setPlacement] = useState<"hero" | "side" | "bottom">(existing?.placement ?? slot.placement);
  const [eyebrow, setEyebrow] = useState(existing?.eyebrow ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [highlight, setHighlight] = useState(existing?.highlight ?? "");
  const [subtitle, setSubtitle] = useState(existing?.subtitle ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const defaultCategoryUrl = slot.categoryName && slot.categoryName.trim() && slot.categoryName !== "General"
    ? `/products?category=${encodeURIComponent(slot.categoryName.trim())}`
    : "/products";

  const [buttonText, setButtonText] = useState(existing?.buttonText ?? "Shop Now");
  const [targetUrl, setTargetUrl] = useState(existing?.targetUrl || defaultCategoryUrl);
  const [displayOrder, setDisplayOrder] = useState(existing?.displayOrder ?? 1);
  const [textTheme, setTextTheme] = useState<"light" | "dark">(existing?.textTheme ?? "light");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">(existing?.textTheme ?? "light");

  const [overlayColor, setOverlayColor] = useState(existing?.overlayColor ?? "#0B0F19");
  const [overlayOpacity, setOverlayOpacity] = useState(existing?.overlayOpacity ?? 70);
  const [lightTextColor, setLightTextColor] = useState(existing?.lightTextColor ?? "#FFFFFF");
  const [darkTextColor, setDarkTextColor] = useState(existing?.darkTextColor ?? "#FFFFFF");
  const [lightButtonColor, setLightButtonColor] = useState(existing?.lightButtonColor ?? "#FFFFFF");
  const [darkButtonColor, setDarkButtonColor] = useState(existing?.darkButtonColor ?? "#5B5CF0");

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [extractingColors, setExtractingColors] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPalette | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Active text color based on preview/text theme
  const activeTextColor = previewTheme === "light" ? lightTextColor : darkTextColor;
  const contrastInfo = analyzeBannerContrast(activeTextColor, overlayColor, overlayOpacity);

  const applyPreset = (preset: BannerColorPreset) => {
    setSelectedPresetId(preset.id);
    setOverlayColor(preset.overlayColor);
    setOverlayOpacity(preset.overlayOpacity);
    setLightTextColor(preset.lightTextColor);
    setDarkTextColor(preset.darkTextColor);
    setLightButtonColor(preset.lightButtonColor);
    setDarkButtonColor(preset.darkButtonColor);
    setTextTheme(preset.textTheme);
    setPreviewTheme(preset.textTheme);
  };

  const handleAutoExtract = async () => {
    if (!imageUrl) {
      setExtractError("Please upload or enter an image URL first.");
      return;
    }
    setExtractError(null);
    setExtractingColors(true);
    try {
      const palette = await extractColorsFromImageUrl(imageUrl);
      setExtractedData(palette);
      setOverlayColor(palette.suggestedOverlay);
      setOverlayOpacity(palette.suggestedOpacity);
      setLightTextColor(palette.suggestedLightText);
      setDarkTextColor(palette.suggestedDarkText);
      setLightButtonColor(palette.suggestedLightBtn);
      setDarkButtonColor(palette.suggestedDarkBtn);
      setTextTheme(palette.recommendedTheme);
      setPreviewTheme(palette.recommendedTheme);
      setSelectedPresetId(null);
    } catch {
      setExtractError("Could not auto-extract colors (image may have CORS restrictions). Try choosing a preset below!");
    } finally {
      setExtractingColors(false);
    }
  };

  const handleAutoFixContrast = () => {
    const fix = getAutoFixColors(overlayColor, overlayOpacity);
    setOverlayOpacity(fix.overlayOpacity);
    setLightTextColor(fix.textColor);
    setDarkTextColor(fix.textColor);
    setLightButtonColor(fix.buttonColor);
    setDarkButtonColor(fix.buttonColor);
  };

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const result = await uploadImageToImgBB(file);
      setImageUrl(result.url);
      // Automatically attempt color extraction on new upload
      try {
        const palette = await extractColorsFromImageUrl(result.url);
        setExtractedData(palette);
        setOverlayColor(palette.suggestedOverlay);
        setOverlayOpacity(palette.suggestedOpacity);
        setLightTextColor(palette.suggestedLightText);
        setDarkTextColor(palette.suggestedDarkText);
        setLightButtonColor(palette.suggestedLightBtn);
        setDarkButtonColor(palette.suggestedDarkBtn);
      } catch {
        // quiet fallback
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const resetColors = () => {
    setSelectedPresetId(null);
    setOverlayColor("#0B0F19");
    setOverlayOpacity(70);
    setLightTextColor("#FFFFFF");
    setDarkTextColor("#FFFFFF");
    setLightButtonColor("#FFFFFF");
    setDarkButtonColor("#5B5CF0");
  };

  const save = async () => {
    if (!imageUrl.trim()) {
      setError("A banner image is required.");
      return;
    }
    if (!title.trim()) {
      setError("Headline title is required.");
      return;
    }
    setError(null);
    setSaving(true);
    const body = {
      categoryId: slot.categoryId || null,
      imageUrl: imageUrl.trim(),
      placement,
      eyebrow: eyebrow.trim() || null,
      title: title.trim(),
      highlight: highlight.trim() || null,
      subtitle: subtitle.trim() || null,
      description: description.trim() || null,
      buttonText: buttonText.trim() || null,
      targetUrl: targetUrl.trim() || null,
      displayOrder: Number(displayOrder) || 0,
      textTheme,
      isActive,
      overlayColor: overlayColor || null,
      overlayOpacity: Number(overlayOpacity),
      lightTextColor: lightTextColor || null,
      darkTextColor: darkTextColor || null,
      lightButtonColor: lightButtonColor || null,
      darkButtonColor: darkButtonColor || null,
    };
    try {
      if (existing) {
        await updateHeroBanner(existing.id, body);
      } else {
        await createHeroBanner(body as Omit<HeroBanner, "id" | "createdAt" | "updatedAt">);
      }
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteHeroBanner(existing.id);
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to remove banner.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text">
                {existing ? "Edit" : "Add"} Hero Banner — {slot.categoryName}
              </h2>
              <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                {placement} Slot
              </span>
              {existing && (
                <span className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">Configure visual assets, typography hierarchy, and destination deep-link for this promotional slot.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-2 text-muted transition-colors hover:bg-muted-bg hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          {/* Image */}
          <section className="rounded-xl border border-border bg-muted-bg/40 p-4">
            <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Banner Imagery & Media Asset</label>
                  <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted">Required</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">1440 × 630px recommended, PNG, JPG, or WEBP up to 5MB</p>
              </div>
              <div className="inline-flex self-start rounded-lg bg-muted-bg p-1 text-xs font-medium sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`rounded-md px-3 py-1 transition ${mode === "upload" ? "bg-surface font-semibold text-text shadow-sm" : "text-muted"}`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setMode("url")}
                  className={`rounded-md px-3 py-1 transition ${mode === "url" ? "bg-surface font-semibold text-text shadow-sm" : "text-muted"}`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageUrl && (
              <div className="mb-3 overflow-hidden rounded-xl border border-border bg-surface">
                {/* Preview only — safe to use a plain img for arbitrary/external admin-entered URLs */}
                <img src={imageUrl} alt="Banner preview" className="h-32 w-full object-cover" />
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-surface px-3.5 py-2.5">
                  <span className="max-w-[200px] truncate text-xs font-medium text-muted sm:max-w-xs">{imageUrl.split("/").pop()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoExtract}
                      disabled={extractingColors}
                      className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50"
                    >
                      {extractingColors ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span>{extractingColors ? "Extracting..." : "Auto-Extract Colors"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageUrl(""); setExtractedData(null); }}
                      className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold text-error transition hover:bg-error/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {extractError && (
              <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">{extractError}</p>
            )}

            {mode === "upload" ? (
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-surface px-4 py-3.5 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/5">
                {uploading ? "Uploading..." : imageUrl ? "Replace image" : "Click to upload an image"}
                <input type="file" accept="image/*" onChange={chooseFile} className="sr-only" disabled={uploading} />
              </label>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://domain.com/path-to-banner-image.jpg"
                  className={inputClass}
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={handleAutoExtract}
                    disabled={extractingColors}
                    className="mt-1 inline-flex h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Extract
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Content fields */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Placement Slot</label>
              <select value={placement} onChange={(e) => setPlacement(e.target.value as typeof placement)} className={inputClass}>
                <option value="hero">Hero (Main 16:7 Full Width)</option>
                <option value="side">Side (4:5)</option>
                <option value="bottom">Bottom (16:9)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Subtitle</label>
                <span className="text-[10px] font-mono text-muted">{subtitle.length}/60</span>
              </div>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={60}
                placeholder="Short secondary slogan"
                className={inputClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Eyebrow Chip</label>
                <span className="text-[10px] font-mono text-muted">{eyebrow.length}/25</span>
              </div>
              <input
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                maxLength={25}
                placeholder="e.g. EXCLUSIVE DEALS"
                className={inputClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>CTA Button Label</label>
                <span className="text-[10px] font-mono text-muted">{buttonText.length}/18</span>
              </div>
              <input
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                maxLength={18}
                placeholder="Shop Now"
                className={inputClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Headline Title</label>
                <span className="text-[10px] font-mono text-muted">{title.length}/45</span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={45}
                placeholder="Main headline title"
                className={inputClass}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>Target Destination URL</label>
                {slot.categoryName && (
                  <button
                    type="button"
                    onClick={() => setTargetUrl(defaultCategoryUrl)}
                    className="text-[10px] font-semibold text-primary transition hover:underline"
                    title="Auto-set to this category's filter URL"
                  >
                    Auto-set Category URL
                  </button>
                )}
              </div>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder={defaultCategoryUrl}
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="mt-1 text-[11px] text-muted">Auto-routes to category product filter: {defaultCategoryUrl}</p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className={labelClass}>Highlight Word / Accent</label>
                <span className="text-[10px] font-mono text-muted">{highlight.length}/20</span>
              </div>
              <input
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                maxLength={20}
                placeholder="e.g. Ultimate Ride"
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-muted">Stylized in warm accent color within the headline.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Display Order</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Text Theme</label>
                <select value={textTheme} onChange={(e) => { const v = e.target.value as "light" | "dark"; setTextTheme(v); setPreviewTheme(v); }} className={inputClass}>
                  <option value="light">Light on Dark</option>
                  <option value="dark">Dark on Light</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className={labelClass}>Body Description</label>
                  {placement !== "hero" && (
                    <span className="rounded bg-muted-bg px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      Hero slot only (hidden for {placement})
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted">{description.length}/120</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
                placeholder={placement === "hero" ? "Short 1-2 sentence description..." : "Description is only shown on Hero slot banners"}
                rows={2}
                className={inputClass}
              />
            </div>
          </section>

          {/* ── Smart Color Assistant & Presets ── */}
          <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 via-muted-bg/30 to-muted-bg/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text">Designer Theme Presets</h4>
                  <p className="text-[11px] text-muted">1-Click designer-crafted color palettes to prevent readability and contrast issues.</p>
                </div>
              </div>
              {selectedPresetId && (
                <button
                  type="button"
                  onClick={resetColors}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {BANNER_COLOR_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`group relative flex flex-col items-start overflow-hidden rounded-xl border p-2.5 text-left transition-all ${isSelected
                        ? "border-primary bg-surface ring-2 ring-primary/40 shadow-sm"
                        : "border-border bg-surface/80 hover:border-primary/50 hover:bg-surface"
                      }`}
                  >
                    {/* Gradient Swatch Header */}
                    <div
                      className="mb-2 h-7 w-full rounded-md shadow-inner flex items-center justify-between px-2"
                      style={{ background: preset.previewGradient }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/40 shadow"
                        style={{ backgroundColor: preset.lightButtonColor }}
                      />
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-text group-hover:text-primary">
                      {preset.name}
                    </span>
                    <span className="line-clamp-1 text-[10px] text-muted">
                      {preset.tagline}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Extracted Swatches row (if available) */}
            {extractedData && extractedData.palette.length > 0 && (
              <div className="rounded-lg border border-border bg-surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-text">Extracted Image Swatches</span>
                  </div>
                  <span className="text-[10px] text-muted">Click a swatch to apply as CTA button color</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {extractedData.palette.map((hex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (previewTheme === "light") setLightButtonColor(hex);
                        else setDarkButtonColor(hex);
                      }}
                      className="group flex items-center gap-1.5 rounded-md border border-border bg-muted-bg/50 px-2 py-1 transition hover:border-primary"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-[10px] text-text group-hover:text-primary">{hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Overlay & color customization */}
          <section className="rounded-xl border border-border bg-muted-bg/40 p-4 sm:p-5">
            <div className="mb-3 border-b border-border pb-3">
              <h4 className={labelClass}>Manual Color & Scrim Customization</h4>
              <p className="mt-0.5 text-xs text-muted">Fine-tune individual hex values and background darkness.</p>
            </div>

            <div className="space-y-4">
              {/* Overlay color — always active */}
              <ColorField label="Overlay Color" value={overlayColor} onChange={(c) => { setOverlayColor(c); setSelectedPresetId(null); }} alwaysActive />

              {/* Text colors — both modes visible; current theme highlighted */}
              <div>
                <p className={`mb-2 ${labelClass}`}>Text Color</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ColorField
                    label="Light Mode Text"
                    value={lightTextColor}
                    onChange={(c) => { setLightTextColor(c); setSelectedPresetId(null); }}
                    activeTheme={textTheme}
                    ownTheme="light"
                  />
                  <ColorField
                    label="Dark Mode Text"
                    value={darkTextColor}
                    onChange={(c) => { setDarkTextColor(c); setSelectedPresetId(null); }}
                    activeTheme={textTheme}
                    ownTheme="dark"
                  />
                </div>
              </div>

              {/* Button colors — both modes visible; current theme highlighted */}
              <div>
                <p className={`mb-2 ${labelClass}`}>Button Color</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ColorField
                    label="Light Mode Button"
                    value={lightButtonColor}
                    onChange={(c) => { setLightButtonColor(c); setSelectedPresetId(null); }}
                    activeTheme={textTheme}
                    ownTheme="light"
                  />
                  <ColorField
                    label="Dark Mode Button"
                    value={darkButtonColor}
                    onChange={(c) => { setDarkButtonColor(c); setSelectedPresetId(null); }}
                    activeTheme={textTheme}
                    ownTheme="dark"
                  />
                </div>
              </div>
            </div>

            {/* Darkness Slider */}
            <div className="mt-4 flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className={labelClass}>Dark Scrim Overlay Darkness</label>
                  <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {overlayOpacity}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">Increases background contrast so title text stays readable over the photo.</p>
              </div>
              <div className="flex w-full items-center gap-3 sm:w-64">
                <span className="font-mono text-xs text-muted">0%</span>
                <input
                  type="range"
                  min={0}
                  max={95}
                  value={overlayOpacity}
                  onChange={(e) => { setOverlayOpacity(Number(e.target.value)); setSelectedPresetId(null); }}
                  className="w-full accent-primary"
                />
                <span className="font-mono text-xs text-muted">95%</span>
              </div>
            </div>
          </section>

          {/* ── Live Banner Preview with WCAG Contrast Assistant ── */}
          <section className="rounded-xl border border-border bg-muted-bg/40 p-4 sm:p-5">
            {/* Section header with toggle & WCAG Status */}
            <div className="mb-3 flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className={labelClass}>Live Preview & Accessibility Check</h4>
                <p className="mt-0.5 text-xs text-muted">Real-time rendering and WCAG 2.1 readability analysis.</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Theme toggle pill */}
                <button
                  type="button"
                  onClick={() => setPreviewTheme((t) => (t === "light" ? "dark" : "light"))}
                  aria-label="Toggle preview theme"
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${previewTheme === "light"
                      ? "border-amber-400/60 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-300"
                      : "border-indigo-400/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-400/10 dark:text-indigo-300"
                    }`}
                >
                  {previewTheme === "light" ? (
                    <><Sun className="h-3.5 w-3.5" /> Light Mode</>
                  ) : (
                    <><Moon className="h-3.5 w-3.5" /> Dark Mode</>
                  )}
                </button>
              </div>
            </div>

            {/* WCAG Contrast Bar */}
            <div
              className={`mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${contrastInfo.level === "AAA"
                  ? "border-emerald-500/30 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : contrastInfo.level === "AA"
                    ? "border-blue-500/30 bg-blue-50/50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300"
                }`}
            >
              <div className="flex items-center gap-2">
                {contrastInfo.isAccessible ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">
                      Contrast Ratio: {contrastInfo.ratio}:1
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${contrastInfo.level === "AAA"
                          ? "bg-emerald-600 text-white"
                          : contrastInfo.level === "AA"
                            ? "bg-blue-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                    >
                      {contrastInfo.level === "AAA" ? "WCAG AAA" : contrastInfo.level === "AA" ? "WCAG AA" : "Low Contrast"}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80">{contrastInfo.message}</p>
                </div>
              </div>

              {!contrastInfo.isAccessible && (
                <button
                  type="button"
                  onClick={handleAutoFixContrast}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Auto-Fix Contrast
                </button>
              )}
            </div>

            {/* Banner preview card */}
            <div className="flex justify-center">
              <div
                className={`relative w-full overflow-hidden rounded-xl shadow-md transition-all ${placement === "side" ? "max-w-xs" : "w-full"
                  }`}
                style={{
                  aspectRatio: placement === "side" ? "4/5" : "16/7",
                  background: previewTheme === "light" ? "#f1f5f9" : "#0f172a",
                }}
              >
                {imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={imageUrl}
                    alt="Banner preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-muted">No image selected</span>
                  </div>
                )}

                {/* Overlay scrim */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    backgroundColor: overlayColor || "#0B0F19",
                    opacity: (overlayOpacity ?? 70) / 100,
                  }}
                />

                {/* Text content overlay matching home page */}
                <div
                  className={`absolute inset-0 flex flex-col ${placement === "hero"
                      ? "justify-center gap-1.5 p-5 sm:p-6 lg:p-7 max-w-[85%] sm:max-w-[75%]"
                      : "justify-end gap-1 p-4 sm:p-5 max-w-[90%]"
                    }`}
                  style={{
                    color:
                      previewTheme === "light"
                        ? lightTextColor || "#ffffff"
                        : darkTextColor || "#ffffff",
                  }}
                >
                  {eyebrow && (
                    <span
                      style={{ opacity: 0.8 }}
                      className="text-[9px] font-bold uppercase tracking-widest sm:text-[10px]"
                    >
                      {eyebrow}
                    </span>
                  )}
                  <h3
                    className={`font-extrabold leading-tight drop-shadow-sm ${placement === "hero"
                        ? "text-base sm:text-xl lg:text-2xl"
                        : "text-sm sm:text-base leading-snug"
                      }`}
                  >
                    {title || <span className="opacity-40">Headline title…</span>}{" "}
                    {highlight && (
                      <span className="text-warm font-extrabold">{highlight}</span>
                    )}
                  </h3>
                  {subtitle && (
                    <p
                      style={{ opacity: 0.85 }}
                      className={`font-medium ${placement === "hero" ? "text-xs sm:text-sm" : "text-xs"}`}
                    >
                      {subtitle}
                    </p>
                  )}
                  {placement === "hero" && description && (
                    <p
                      style={{ opacity: 0.8 }}
                      className="line-clamp-2 leading-relaxed text-xs sm:text-sm"
                    >
                      {description}
                    </p>
                  )}

                  {/* CTA button matching home page */}
                  {buttonText && (
                    <span
                      className={`mt-2 inline-flex w-fit items-center rounded-lg font-bold shadow-md transition-transform hover:scale-[1.02] ${placement === "hero"
                          ? "px-4 py-2 text-xs sm:text-sm"
                          : "px-3 py-1.5 text-[10px] sm:text-[11px]"
                        }`}
                      style={{
                        backgroundColor:
                          previewTheme === "light"
                            ? lightButtonColor || "#ffffff"
                            : darkButtonColor || "#5b5cf0",
                        color:
                          (previewTheme === "light" ? lightButtonColor : darkButtonColor) === "#ffffff" ||
                          (previewTheme === "light" ? lightButtonColor : darkButtonColor) === "#FFFFFF"
                            ? "#0f172a"
                            : "#ffffff",
                      }}
                    >
                      {buttonText}
                    </span>
                  )}
                </div>

                {/* Theme badge & Slot indicator */}
                <div className="absolute right-2 top-2 flex items-center gap-1.5">
                  <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                    {placement} Slot
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md ${previewTheme === "light"
                        ? "bg-amber-400/30 text-amber-950 dark:text-amber-100"
                        : "bg-indigo-500/30 text-indigo-950 dark:text-indigo-100"
                      }`}
                  >
                    {previewTheme === "light" ? <Sun className="h-2.5 w-2.5" /> : <Moon className="h-2.5 w-2.5" />}
                    {previewTheme === "light" ? "Light" : "Dark"}
                  </span>
                </div>
              </div>
            </div>

            {/* Color legend below preview */}
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border border-border shadow-inner"
                  style={{ backgroundColor: previewTheme === "light" ? lightTextColor || "#ffffff" : darkTextColor || "#0f172a" }}
                />
                <span className="text-[11px] text-muted">Text: {previewTheme === "light" ? lightTextColor : darkTextColor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border border-border shadow-inner"
                  style={{ backgroundColor: previewTheme === "light" ? lightButtonColor || "#ffffff" : darkButtonColor || "#5b5cf0" }}
                />
                <span className="text-[11px] text-muted">Button: {previewTheme === "light" ? lightButtonColor : darkButtonColor}</span>
              </div>
              {overlayColor && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-border shadow-inner"
                    style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 + 0.3 }}
                  />
                  <span className="text-[11px] text-muted">Overlay: {overlayColor} ({overlayOpacity}%)</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-border bg-muted-bg/30 px-6 py-4 sm:flex-row">
          <label className="flex cursor-pointer items-center gap-3 self-start select-none sm:self-auto">
            <span className="relative inline-flex items-center">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="peer sr-only" />
              <span className="h-6 w-11 rounded-full bg-muted-bg transition-colors peer-checked:bg-success" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
            </span>
            <span>
              <span className="block text-xs font-bold text-text">Active on Homepage</span>
              <span className="text-[11px] text-muted">Visible to active platform shoppers</span>
            </span>
          </label>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            {existing && (
              <button
                type="button"
                onClick={remove}
                disabled={deleting || saving}
                className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-error/30 bg-surface px-3.5 text-xs font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>{deleting ? "Removing..." : "Remove"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={resetColors}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl border border-border bg-surface px-3.5 text-xs font-semibold text-muted transition hover:bg-muted-bg hover:text-text"
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-muted transition hover:bg-muted-bg hover:text-text"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading}
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  alwaysActive,
  activeTheme,
  ownTheme,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Overlay color is always active (not tied to a theme). */
  alwaysActive?: boolean;
  /** The currently selected text theme ("light" | "dark"). */
  activeTheme?: "light" | "dark";
  /** Which theme this ColorField belongs to. */
  ownTheme?: "light" | "dark";
}) {
  const isActive = alwaysActive ?? activeTheme === ownTheme;

  return (
    <div
      className={`rounded-xl border p-3 shadow-sm transition-all ${isActive
          ? "border-primary/40 bg-surface ring-1 ring-primary/20"
          : "border-border bg-muted-bg/50 opacity-70"
        }`}
    >
      {/* Label row */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-text">{label}</label>
        {isActive ? (
          <span className="rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
            Active
          </span>
        ) : (
          <span className="rounded border border-border bg-muted-bg px-1.5 py-0.5 text-[10px] font-medium text-muted">
            {ownTheme === "light" ? "☀ Light" : "🌙 Dark"}
          </span>
        )}
      </div>

      {/* Color picker + hex input row */}
      <div className="flex items-center gap-2">
        {/* Native color picker — opens OS color picker on click */}
        <label className="relative flex-shrink-0 cursor-pointer" aria-label={`Pick ${label}`}>
          <span
            className="block h-8 w-8 rounded-lg border-2 border-border shadow-inner transition hover:border-primary"
            style={{ backgroundColor: value || "#ffffff" }}
          />
          <input
            type="color"
            value={value || "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            tabIndex={-1}
          />
        </label>

        {/* Hex text input */}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-text focus:border-primary focus:outline-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
