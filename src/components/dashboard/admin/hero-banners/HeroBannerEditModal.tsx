"use client";

import { useState, type ChangeEvent } from "react";
import { X, Trash2, Sun, Moon } from "lucide-react";
import type { HeroBanner } from "@/lib/api/hero-banners";
import { createHeroBanner, updateHeroBanner, deleteHeroBanner } from "@/lib/api/hero-banners";
import { uploadImageToImgBB } from "@/lib/utils/imgbb";
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
  const [buttonText, setButtonText] = useState(existing?.buttonText ?? "Shop Now");
  const [targetUrl, setTargetUrl] = useState(existing?.targetUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(existing?.displayOrder ?? 1);
  const [textTheme, setTextTheme] = useState<"light" | "dark">(existing?.textTheme ?? "light");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">(existing?.textTheme ?? "light");

  const [overlayColor, setOverlayColor] = useState(existing?.overlayColor ?? "#0B0F19");
  const [overlayOpacity, setOverlayOpacity] = useState(existing?.overlayOpacity ?? 70);
  const [lightTextColor, setLightTextColor] = useState(existing?.lightTextColor ?? "#FFFFFF");
  const [darkTextColor, setDarkTextColor] = useState(existing?.darkTextColor ?? "#0F172A");
  const [lightButtonColor, setLightButtonColor] = useState(existing?.lightButtonColor ?? "#FFFFFF");
  const [darkButtonColor, setDarkButtonColor] = useState(existing?.darkButtonColor ?? "#5B5CF0");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const resetColors = () => {
    setOverlayColor("#0B0F19");
    setOverlayOpacity(70);
    setLightTextColor("#FFFFFF");
    setDarkTextColor("#0F172A");
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
              <div className="mb-3 overflow-hidden rounded-lg border border-border bg-surface">
                {/* Preview only — safe to use a plain img for arbitrary/external admin-entered URLs */}
                <img src={imageUrl} alt="Banner preview" className="h-32 w-full object-cover" />
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="truncate text-xs font-medium text-muted">{imageUrl.split("/").pop()}</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="flex-shrink-0 text-xs font-semibold text-error hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {mode === "upload" ? (
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-surface px-4 py-6 text-sm font-semibold text-primary transition hover:border-primary">
                {uploading ? "Uploading..." : imageUrl ? "Replace image" : "Click to upload an image"}
                <input type="file" accept="image/*" onChange={chooseFile} className="sr-only" disabled={uploading} />
              </label>
            ) : (
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://domain.com/path-to-banner-image.jpg"
                className={inputClass}
              />
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
              <label className={labelClass}>Subtitle</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Eyebrow Chip</label>
              <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CTA Button Label</label>
              <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Headline Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Target Destination URL</label>
              <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className={labelClass}>Highlight Word / Accent</label>
                <span className="rounded border border-warm/30 bg-warm/10 px-1.5 py-0.5 text-[10px] font-semibold text-warm">Applied in accent color</span>
              </div>
              <input value={highlight} onChange={(e) => setHighlight(e.target.value)} className={inputClass} />
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
              <label className={labelClass}>Body Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
          </section>

          {/* Overlay & color customization */}
          <section className="rounded-xl border border-border bg-muted-bg/40 p-4 sm:p-5">
            <div className="mb-3 border-b border-border pb-3">
              <h4 className={labelClass}>Overlay & Color Customization</h4>
              <p className="mt-0.5 text-xs text-muted">Control the scrim tint, adaptive theme contrast colors, and overlay opacity.</p>
            </div>

            <div className="space-y-4">
              {/* Overlay color — always active */}
              <ColorField label="Overlay Color" value={overlayColor} onChange={setOverlayColor} alwaysActive />

              {/* Text colors — both modes visible; current theme highlighted */}
              <div>
                <p className={`mb-2 ${labelClass}`}>Text Color</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ColorField
                    label="Light Mode Text"
                    value={lightTextColor}
                    onChange={setLightTextColor}
                    activeTheme={textTheme}
                    ownTheme="light"
                  />
                  <ColorField
                    label="Dark Mode Text"
                    value={darkTextColor}
                    onChange={setDarkTextColor}
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
                    onChange={setLightButtonColor}
                    activeTheme={textTheme}
                    ownTheme="light"
                  />
                  <ColorField
                    label="Dark Mode Button"
                    value={darkButtonColor}
                    onChange={setDarkButtonColor}
                    activeTheme={textTheme}
                    ownTheme="dark"
                  />
                </div>
              </div>
            </div>

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
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="font-mono text-xs text-muted">95%</span>
              </div>
            </div>
          </section>

          {/* ── Live Banner Preview ── */}
          <section className="rounded-xl border border-border bg-muted-bg/40 p-4 sm:p-5">
            {/* Section header with toggle */}
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className={labelClass}>Live Preview</h4>
                <p className="mt-0.5 text-xs text-muted">Toggle between light &amp; dark to see how text and button colors render.</p>
              </div>
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

            {/* Banner preview card */}
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ aspectRatio: "16/7", background: previewTheme === "light" ? "#f1f5f9" : "#0f172a" }}
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
              {overlayColor && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
                />
              )}

              {/* Text content overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-end gap-1 p-4"
                style={{
                  color:
                    previewTheme === "light"
                      ? lightTextColor || "#ffffff"
                      : darkTextColor || "#0f172a",
                }}
              >
                {eyebrow && (
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {eyebrow}
                  </span>
                )}
                <p className="text-sm font-extrabold leading-tight drop-shadow-sm sm:text-base">
                  {title || <span className="opacity-40">Headline title…</span>}{" "}
                  {highlight && (
                    <span className="text-warm">{highlight}</span>
                  )}
                </p>
                {subtitle && (
                  <p className="text-xs opacity-80">{subtitle}</p>
                )}

                {/* CTA button */}
                {buttonText && (
                  <span
                    className="mt-1 inline-flex w-fit items-center rounded-lg px-3 py-1.5 text-xs font-bold shadow"
                    style={{
                      backgroundColor:
                        previewTheme === "light"
                          ? lightButtonColor || "#ffffff"
                          : darkButtonColor || "#5b5cf0",
                      color:
                        previewTheme === "light"
                          ? lightTextColor || "#0f172a"
                          : darkTextColor || "#ffffff",
                      filter: "brightness(1)",
                    }}
                  >
                    {buttonText}
                  </span>
                )}
              </div>

              {/* Theme badge */}
              <div className="absolute right-2 top-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${previewTheme === "light"
                      ? "bg-amber-400/20 text-amber-200"
                      : "bg-indigo-500/20 text-indigo-200"
                    }`}
                >
                  {previewTheme === "light" ? <Sun className="h-2.5 w-2.5" /> : <Moon className="h-2.5 w-2.5" />}
                  {previewTheme === "light" ? "Light" : "Dark"}
                </span>
              </div>
            </div>

            {/* Color legend below preview */}
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border border-border shadow-inner"
                  style={{ backgroundColor: previewTheme === "light" ? lightTextColor || "#ffffff" : darkTextColor || "#0f172a" }}
                />
                <span className="text-[11px] text-muted">Text</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border border-border shadow-inner"
                  style={{ backgroundColor: previewTheme === "light" ? lightButtonColor || "#ffffff" : darkButtonColor || "#5b5cf0" }}
                />
                <span className="text-[11px] text-muted">Button</span>
              </div>
              {overlayColor && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-border shadow-inner"
                    style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 + 0.3 }}
                  />
                  <span className="text-[11px] text-muted">Overlay ({overlayOpacity}%)</span>
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

          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
            {existing && (
              <button
                type="button"
                onClick={remove}
                disabled={deleting || saving}
                className="flex items-center gap-1.5 rounded-xl border border-error/30 px-3 py-2 text-xs font-semibold text-error transition hover:bg-error/10 disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "Removing..." : "Remove"}
              </button>
            )}
            <button
              type="button"
              onClick={resetColors}
              className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-muted-bg"
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted transition hover:bg-muted-bg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || uploading}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-hover disabled:opacity-60"
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
