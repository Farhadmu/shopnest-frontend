"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import { AiBadge } from "@/components/dashboard/DashboardStates";
import { runProductFinder, type ProductFinderResult, type ProductFinderContent } from "@/lib/api/seller-intelligence";
import { uploadImagesToImgBB } from "@/lib/utils/imgbb";
import {
  FaSyncAlt,
  FaArrowRight,
  FaRobot,
  FaSearch,
  FaExclamationCircle,
  FaSpinner,
  FaCheckCircle,
  FaGlobe,
  FaImage,
  FaShoppingCart,
} from "react-icons/fa";

type Step = "upload" | "researching" | "results" | "edit";

function getStepLabel(step: Step): string {
  switch (step) {
    case "upload":
      return "Step 1: Upload Product Image";
    case "researching":
      return "Step 2: AI Researching";
    case "results":
      return "Step 3: Product Found";
    case "edit":
      return "Step 4: Review & Edit";
    }
  }

export default function SellerAiProductFinderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<string[]>([]);
  const [hints, setHints] = useState({ productName: "", notes: "", targetCustomer: "", specialFeatures: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductFinderResult | null>(null);
  const [content, setContent] = useState<ProductFinderContent | null>(null);
  const [translatedSections, setTranslatedSections] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<"bn" | "en">("bn");

  const canStart = images.length > 0 && !loading;

  const handleStartResearch = async () => {
    if (!canStart) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setContent(null);
    setStep("researching");

    try {
      const res = await runProductFinder({
        imageUrls: images,
        hints: {
          productName: hints.productName || undefined,
          notes: hints.notes || undefined,
          targetCustomer: hints.targetCustomer || undefined,
          specialFeatures: hints.specialFeatures || undefined,
        },
      });
      setResult(res);
      if (res.productFound && res.content) {
        setContent(res.content);
        setStep("results");
      } else {
        setStep("upload");
      }
    } catch {
      setError("Research failed. Please try again with clearer images.");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!content) return;
    setTranslating(true);
    setError(null);
    try {
      const sections: Record<string, string> = {
        title: content.title,
        description: content.description,
        shortDescription: content.shortDescription,
        whyBuy: content.whyBuy,
        marketingCaption: content.marketingCaption,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        features: (content.features || []).join("\n"),
        packageContents: (content.packageContents || []).join("\n"),
        tags: (content.tags || []).join(", "),
      };
      Object.entries(content.specifications || {}).forEach(([k, v]) => {
        sections[`spec_${k}`] = String(v);
      });

      const { translateProductContent } = await import("@/lib/api/seller-intelligence");
      const res = await translateProductContent({ sections, targetLanguage: targetLang });
      setTranslatedSections(res.translatedSections);
    } catch {
      setError("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  const applyTranslation = () => {
    if (!content) return;
    const patch: Record<string, unknown> = {};
    if (translatedSections.title) patch.title = translatedSections.title;
    if (translatedSections.description) patch.description = translatedSections.description;
    if (translatedSections.shortDescription) patch.shortDescription = translatedSections.shortDescription;
    if (translatedSections.whyBuy) patch.whyBuy = translatedSections.whyBuy;
    if (translatedSections.marketingCaption) patch.marketingCaption = translatedSections.marketingCaption;
    if (translatedSections.seoTitle) patch.seoTitle = translatedSections.seoTitle;
    if (translatedSections.seoDescription) patch.seoDescription = translatedSections.seoDescription;
    if (translatedSections.features) patch.features = translatedSections.features.split("\n").filter(Boolean);
    if (translatedSections.packageContents) patch.packageContents = translatedSections.packageContents.split("\n").filter(Boolean);
    if (translatedSections.tags) patch.tags = translatedSections.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const newSpecs = { ...content.specifications };
    Object.entries(translatedSections).forEach(([k, v]) => {
      if (k.startsWith("spec_")) {
        const specKey = k.replace("spec_", "");
        newSpecs[specKey] = v;
      }
    });
    if (Object.keys(newSpecs).length > 0) patch.specifications = newSpecs;

    setContent({ ...content, ...patch });
    setTranslatedSections({});
  };

  const handleUseForProduct = () => {
    if (!content) return;
    const payload = {
      title: content.title,
      category: content.category,
      subcategory: content.subcategory,
      brand: content.brand,
      model: content.model,
      description: content.description,
      shortDescription: content.shortDescription,
      features: content.features,
      specifications: content.specifications,
      variants: content.variants,
      highlights: content.highlights,
      whyBuy: content.whyBuy,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      tags: content.tags,
      marketingCaption: content.marketingCaption,
      packageContents: content.packageContents,
      warranty: content.warranty,
      price: content.suggestedPrice || 0,
      images: images,
      fromAiStudio: true,
    };
    sessionStorage.setItem("ai-studio-product-data", JSON.stringify(payload));
    router.push("/dashboard/seller/products/add?fromAi=1");
  };

  const resetFinder = () => {
    setStep("upload");
    setImages([]);
    setResult(null);
    setContent(null);
    setError(null);
    setTranslatedSections({});
  };

  return (
    <DashboardShell
      role="Seller"
      title="AI Product Finder"
      subtitle="Upload a product image and ShopNest AI will identify, research and prepare the product listing for you."
      links={sellerDashboardLinks}
      action={
        <div className="flex items-center gap-2">
          {step !== "upload" && (
            <button
              type="button"
              onClick={resetFinder}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text transition hover:border-primary/50 hover:text-primary"
            >
              <FaSyncAlt size={11} />
              <span className="hidden sm:inline">New Search</span>
            </button>
          )}
          <Link
            href="/dashboard/seller/products/add"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary"
          >
            Add Product Manually <FaArrowRight size={10} />
          </Link>
        </div>
      }
    >
      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="mt-0.5 text-rose-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
            </div>
            <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-border bg-surface p-3 shadow-sm">
        {(["upload", "researching", "results", "edit"] as Step[]).map((s, idx) => {
          const isActive = step === s;
          const isCompleted = ["upload", "researching", "results", "edit"].indexOf(step) > idx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                    isActive
                      ? "bg-primary text-white"
                      : isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-muted-bg text-muted"
                  }`}
                >
                  {isCompleted && !isActive ? "✓" : idx + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-xs font-bold ${
                    isActive ? "text-text" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted"
                  }`}
                >
                  {getStepLabel(s)}
                </span>
              </div>
              {idx < 3 && <span className="text-muted">→</span>}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-5">
          {/* Upload Section */}
          <Panel title={getStepLabel("upload")}>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center transition hover:border-primary/40 cursor-pointer">
                <FaImage className="text-3xl text-muted" />
                <p className="text-sm font-bold text-text">Upload product image(s)</p>
                <p className="text-xs text-muted">JPG, JPEG, PNG, WEBP • Up to 5 images</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  disabled={loading}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      uploadImagesToImgBB(files.slice(0, 5)).then((urls) => {
                        setImages((prev) => [...prev, ...urls].slice(0, 5));
                      });
                    }
                  }}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((src, idx) => (
                    <div key={`${src}-${idx}`} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted-bg">
                      <img src={src} alt={`Product image ${idx + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 top-0 bg-primary/90 px-2 py-1 text-center text-[10px] font-bold text-white">
                        {idx === 0 ? "Primary" : `Image ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-x-0 bottom-0 bg-rose-500/90 px-2 py-1 text-center text-[10px] font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleStartResearch}
                disabled={!canStart}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-white hover:bg-primary-hover disabled:opacity-50 transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" /> Researching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSearch /> Find Product & Prepare Listing
                  </span>
                )}
              </button>
            </div>
          </Panel>

          {/* Seller Hints */}
          <Panel title="Optional Information (Improves Accuracy)">
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Product Name (if known)</label>
                <input
                  type="text"
                  value={hints.productName}
                  onChange={(e) => setHints({ ...hints, productName: e.target.value })}
                  disabled={loading}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                  placeholder="e.g. Sony WH-1000XM5"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Additional Notes</label>
                <textarea
                  value={hints.notes}
                  onChange={(e) => setHints({ ...hints, notes: e.target.value })}
                  disabled={loading}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-text outline-none transition focus:border-primary disabled:opacity-60"
                  placeholder="Any details that might help identification..."
                />
              </div>
            </div>
          </Panel>

          {/* Research Progress */}
          {step === "researching" && result && (
            <Panel title="Research Progress">
              <div className="space-y-2">
                {result.progress.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-muted-bg/50 p-3">
                    {p.status === "completed" && <FaCheckCircle className="text-emerald-500" size={14} />}
                    {p.status === "running" && <FaSpinner className="animate-spin text-primary" size={14} />}
                    {p.status === "failed" && <FaExclamationCircle className="text-rose-500" size={14} />}
                    {p.status === "skipped" && <FaExclamationCircle className="text-amber-500" size={14} />}
                    {p.status === "pending" && <FaSpinner className="text-muted" size={14} />}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-text">{p.message}</p>
                      {p.error && <p className="text-[10px] text-rose-600 dark:text-rose-400">{p.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Sources */}
          {result && result.sources.length > 0 && (
            <Panel title="Sources">
              <div className="space-y-2">
                {result.sources.slice(0, 8).map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 rounded-xl bg-muted-bg/50 p-3 transition hover:bg-muted-bg"
                  >
                    <FaGlobe className="mt-0.5 text-primary" size={12} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text truncate">{source.title}</p>
                      <p className="text-[10px] text-muted">{source.domain}</p>
                      <p className="text-[10px] text-muted line-clamp-2">{source.snippet}</p>
                    </div>
                  </a>
                ))}
              </div>
            </Panel>
          )}

          {/* Limitations */}
          {result && result.limitations.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">Research Limitations</p>
              {result.limitations.map((limitation, idx) => (
                <p key={idx} className="text-xs text-muted leading-relaxed">• {limitation}</p>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-7">
          {/* Empty State / Initial */}
          {step === "upload" && images.length === 0 && (
            <Panel title="AI Product Finder">
              <div className="rounded-2xl border border-dashed border-border bg-muted-bg/30 p-8 text-center">
                <FaRobot className="mx-auto mb-3 text-3xl text-muted/40" />
                <p className="text-sm font-bold text-text">Upload a product image to begin</p>
                <p className="mt-1 text-xs text-muted">AI will identify the product, research online, and prepare a complete listing.</p>
              </div>
            </Panel>
          )}

          {/* Product Identified */}
          {result && result.identifiedProduct && step !== "upload" && (
            <Panel title="Product Identified">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-text">{result.identifiedProduct.name}</h3>
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${result.confidence === "high" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : result.confidence === "medium" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                    {result.confidence} confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Brand", value: result.identifiedProduct.brand },
                    { label: "Model", value: result.identifiedProduct.model },
                    { label: "Category", value: result.identifiedProduct.category },
                    { label: "Subcategory", value: result.identifiedProduct.subcategory },
                    { label: "Product Type", value: result.identifiedProduct.productType },
                    { label: "Color", value: result.identifiedProduct.color },
                    { label: "Material", value: result.identifiedProduct.material },
                    { label: "Variant", value: result.identifiedProduct.variant },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-muted-bg/50 p-3">
                      <p className="text-[10px] font-bold text-muted uppercase">{item.label}</p>
                      <p className="text-xs font-semibold text-text">{item.value || "Not detected"}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          )}

          {/* Price Research */}
          {result && result.priceResearch && (
            <Panel title="Price Research">
              <div className="space-y-3">
                {result.priceResearch.observedPrices.length > 0 ? (
                  <>
                    <div className="rounded-xl bg-muted-bg/50 p-4">
                      <p className="text-xs font-bold text-muted mb-1">Observed Market Price</p>
                      <p className="text-xl font-black text-text">
                        ৳{result.priceResearch.priceRange.min?.toLocaleString()} – ৳{result.priceResearch.priceRange.max?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted mt-1">{result.priceResearch.currency} • {result.priceResearch.researchStatus === "verified" ? "Recently verified" : "Partially verified"}</p>
                    </div>
                    {result.priceResearch.suggestedPrice && (
                      <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
                        <p className="text-xs font-bold text-primary mb-1">Suggested ShopNest Price</p>
                        <p className="text-xl font-black text-primary">৳{result.priceResearch.suggestedPrice.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {result.priceResearch.observedPrices.map((obs, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-muted-bg/50 p-3">
                          <div>
                            <p className="text-xs font-bold text-text">{obs.source}</p>
                            <p className="text-[10px] text-muted">{new Date(obs.observedAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-text">৳{obs.amount.toLocaleString()}</p>
                            <span className={`text-[10px] font-bold ${obs.isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                              {obs.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/20">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Insufficient verified pricing data</p>
                    <p className="text-xs text-muted mt-1">Price information could not be found from online sources. You can set the price manually in the product form.</p>
                  </div>
                )}
                <p className="text-xs text-muted">{result.priceResearch.reasoning}</p>
              </div>
            </Panel>
          )}

          {/* Images */}
          {(result && (result.discoveredImages.length > 0 || result.generatedImages.length > 0)) && (
            <Panel title="Product Images">
              <div className="space-y-4">
                {result.discoveredImages.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-muted mb-2">Online Sources</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {result.discoveredImages.slice(0, 6).map((img, idx) => (
                        <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted-bg">
                          <img src={img.url} alt={`Discovered product image ${idx + 1}`} className="h-full w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-surface/90 px-2 py-1 text-center text-[10px] font-bold text-text backdrop-blur-sm">
                            Source Image
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.generatedImages.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-muted mb-2">AI Generated</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {result.generatedImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-primary/30 bg-muted-bg">
                          <img src={url} alt={`AI generated product image ${idx + 1}`} className="h-full w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-primary/90 px-2 py-1 text-center text-[10px] font-bold text-white">
                            AI Generated
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Content Editor */}
          {content && (
            <Panel
              title="Product Information"
              action={
                <div className="flex items-center gap-2">
                  <AiBadge isFallback={!!result?.limitations?.length} />
                  <span className="text-[10px] font-bold text-muted uppercase">Editable</span>
                </div>
              }
            >
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Product Title</label>
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                  />
                </div>

                {/* Brand / Model / Category */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Brand</label>
                    <input
                      type="text"
                      value={content.brand}
                      onChange={(e) => setContent({ ...content, brand: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Model</label>
                    <input
                      type="text"
                      value={content.model}
                      onChange={(e) => setContent({ ...content, model: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Category</label>
                    <input
                      type="text"
                      value={content.category}
                      onChange={(e) => setContent({ ...content, category: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Subcategory</label>
                    <input
                      type="text"
                      value={content.subcategory}
                      onChange={(e) => setContent({ ...content, subcategory: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                  </div>
                </div>

                {/* Price */}
                {content.suggestedPrice && (
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/20">
                    <p className="text-xs font-bold text-primary mb-1">Suggested Price</p>
                    <p className="text-2xl font-black text-primary">৳{content.suggestedPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted mt-1">{content.priceReasoning}</p>
                  </div>
                )}

                {/* Short Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Short Description</label>
                  <textarea
                    value={content.shortDescription}
                    onChange={(e) => setContent({ ...content, shortDescription: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Description</label>
                  <textarea
                    value={content.description}
                    onChange={(e) => setContent({ ...content, description: e.target.value })}
                    rows={8}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Key Features</label>
                  <div className="space-y-2">
                    {(content.features || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const features = [...content.features];
                            features[idx] = e.target.value;
                            setContent({ ...content, features });
                          }}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setContent({ ...content, features: content.features.filter((_, i) => i !== idx) })}
                          className="text-muted hover:text-rose-500"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, features: [...content.features, ""] })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Specifications</label>
                  <div className="space-y-2">
                    {Object.entries(content.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const specs = { ...content.specifications };
                            const val = specs[key];
                            delete specs[key];
                            specs[e.target.value] = val;
                            setContent({ ...content, specifications: specs });
                          }}
                          className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary"
                        />
                        <span className="text-muted">:</span>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setContent({ ...content, specifications: { ...content.specifications, [key]: e.target.value } })}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const specs = { ...content.specifications };
                            delete specs[key];
                            setContent({ ...content, specifications: specs });
                          }}
                          className="text-muted hover:text-rose-500"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, specifications: { ...content.specifications, [`Spec ${Object.keys(content.specifications || {}).length + 1}`]: "" } })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      + Add Specification
                    </button>
                  </div>
                </div>

                {/* Why Buy */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Why Choose This Product?</label>
                  <textarea
                    value={content.whyBuy}
                    onChange={(e) => setContent({ ...content, whyBuy: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                  />
                </div>

                {/* SEO */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">SEO Title</label>
                    <input
                      type="text"
                      value={content.seoTitle}
                      onChange={(e) => setContent({ ...content, seoTitle: e.target.value })}
                      maxLength={70}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                    <p className="mt-1 text-[10px] text-muted">{(content.seoTitle || "").length}/70 chars</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Meta Description</label>
                    <textarea
                      value={content.seoDescription}
                      onChange={(e) => setContent({ ...content, seoDescription: e.target.value })}
                      rows={2}
                      maxLength={160}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                    />
                    <p className="mt-1 text-[10px] text-muted">{(content.seoDescription || "").length}/160 chars</p>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Tags</label>
                  <div className="space-y-2">
                    {(content.tags || []).map((tag, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-primary">#</span>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const tags = [...content.tags];
                            tags[idx] = e.target.value;
                            setContent({ ...content, tags });
                          }}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-text outline-none transition focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setContent({ ...content, tags: content.tags.filter((_, i) => i !== idx) })}
                          className="text-muted hover:text-rose-500"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setContent({ ...content, tags: [...content.tags, ""] })}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      + Add Tag
                    </button>
                  </div>
                </div>

                {/* Marketing Caption */}
                <div>
                  <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-muted">Marketing Caption</label>
                  <textarea
                    value={content.marketingCaption}
                    onChange={(e) => setContent({ ...content, marketingCaption: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-text outline-none transition focus:border-primary"
                  />
                </div>

                {/* Translation */}
                <div className="rounded-2xl border border-border bg-muted-bg/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaRobot className="text-primary" size={14} />
                    <span className="text-xs font-black text-text">AI Translation</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setTargetLang("bn")}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${targetLang === "bn" ? "bg-primary text-white" : "border border-border bg-surface text-text hover:border-primary/40"}`}
                    >
                      English → বাংলা
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetLang("en")}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition ${targetLang === "en" ? "bg-primary text-white" : "border border-border bg-surface text-text hover:border-primary/40"}`}
                    >
                      বাংলা → English
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={translating}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text transition hover:border-primary/40 disabled:opacity-50"
                  >
                    {translating ? "Translating..." : "Translate Content"}
                  </button>
                  {Object.keys(translatedSections).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(translatedSections).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="rounded-xl bg-muted-bg/50 p-3">
                          <p className="text-[10px] font-bold text-muted uppercase mb-1">{key}</p>
                          <p className="text-xs text-text">{value}</p>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={applyTranslation}
                        className="w-full rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-white hover:bg-primary-hover transition"
                      >
                        Apply Translation
                      </button>
                    </div>
                  )}
                </div>

                {/* Use for Product */}
                <div className="rounded-2xl bg-primary/5 p-5 border border-primary/20">
                  <p className="text-sm font-bold text-text mb-2">Ready to create your product?</p>
                  <p className="text-xs text-muted mb-4">
                    Review the information above, make any edits, then click below to open the Add Product form with all fields pre-filled.
                  </p>
                  {images.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted mb-4">
                      <FaImage size={12} />
                      <span>{images.length} image(s) will be transferred</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleUseForProduct}
                    className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-white hover:bg-primary-hover shadow-lg shadow-primary/25 transition"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <FaShoppingCart size={16} /> Use for Product
                    </span>
                  </button>
                  <p className="mt-2 text-[10px] text-center text-muted">
                    You will be redirected to Add Product to review and publish.
                  </p>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
