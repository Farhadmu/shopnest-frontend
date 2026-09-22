"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Sparkles,
  UploadCloud,
  X,
  Search,
  ShoppingBag,
  Check,
  Loader2,
  ExternalLink,
  Tag,
  Store,
  RefreshCw,
  Info,
  Sliders,
  CheckCircle2,
  Link2,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { toast } from "@/context/ToastContext";
import {
  uploadVisualSearchImage,
  searchByVisualAI,
  VisualSearchResult,
  VisualSearchProduct,
} from "@/lib/api/ai-visual-search";
import { formatCurrency } from "@/lib/utils";

export function AiVisualSearchWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, openCart } = useCartDrawer();

  // Role Gate: strictly Guest OR Customer (user)
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isExcludedRole =
    userRole === "seller" || userRole === "admin" || userRole === "delivery_man";

  // Route Check: Home page ("/") or Product pages ("/products", etc.)
  const isTargetPage =
    pathname === "/" ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/product") ||
    pathname === "/compare" ||
    pathname === "/flash-sale";

  // Widget states
  const [isOpen, setIsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<VisualSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [addedCartIds, setAddedCartIds] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // If role is excluded or page is not target, do not render
  if (isExcludedRole || !isTargetPage) {
    return null;
  }

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be under 5MB");
      return;
    }
    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
  };

  // Handle URL Preview Load
  const handleUrlPreview = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      setError("Please paste or type an image URL first");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setError("Image URL must begin with http:// or https://");
      return;
    }

    setIsValidatingUrl(true);
    setError(null);

    // Test loading image in browser
    const testImg = new window.Image();
    testImg.onload = () => {
      setPreviewUrl(trimmed);
      setSelectedFile(null);
      setIsValidatingUrl(false);
      setError(null);
    };
    testImg.onerror = () => {
      // In case hotlink/CORS blocks browser image preview, the backend server can still download it:
      setPreviewUrl(trimmed);
      setSelectedFile(null);
      setIsValidatingUrl(false);
    };
    testImg.src = trimmed;
  };

  // Drag and Drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Handle Visual Search Execution
  const handleStartSearch = async () => {
    let finalImageUrl = previewUrl || "";
    if (inputMode === "url" && !previewUrl && imageUrlInput.trim()) {
      finalImageUrl = imageUrlInput.trim();
    }

    if (!selectedFile && !finalImageUrl) {
      setError("Please select an image file or enter an image URL first");
      return;
    }

    setError(null);
    setIsSearching(true);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 1100);
    const stepTimer2 = setTimeout(() => setScanStep(3), 2200);

    try {
      // If a local file was selected, upload it to the backend
      if (selectedFile) {
        setIsUploading(true);
        const uploadRes = await uploadVisualSearchImage(selectedFile);
        finalImageUrl = uploadRes.imageUrl;
        setIsUploading(false);
      }

      // Execute AI Visual Search
      const searchRes = await searchByVisualAI({
        imageUrl: finalImageUrl,
        searchQuery: searchQuery.trim() || undefined,
      });

      setResult(searchRes);
    } catch (err: any) {
      setError(
        err?.message || "Failed to analyze image and search products. Please try again."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsSearching(false);
      setIsUploading(false);
    }
  };

  // Reset search
  const handleReset = () => {
    setSelectedFile(null);
    setImageUrlInput("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSearchQuery("");
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add to Cart
  const handleAddToCart = async (product: VisualSearchProduct) => {
    try {
      setAddingCartId(product._id);
      await addItem({
        productId: product._id,
        price: product.discountPrice ?? product.price,
        originalPrice: product.price,
        title: product.title,
        image: product.images?.[0] || "",
        category: product.category,
      });
      setAddedCartIds((prev) => new Set(prev).add(product._id));
      toast.success("Added to cart!");
    } catch {
      toast.error("Could not add item to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  // Buy Now
  const handleBuyNow = async (product: VisualSearchProduct) => {
    try {
      setAddingCartId(product._id);
      await addItem({
        productId: product._id,
        price: product.discountPrice ?? product.price,
        originalPrice: product.price,
        title: product.title,
        image: product.images?.[0] || "",
        category: product.category,
      });
      setIsOpen(false);
      router.push("/cart");
    } catch {
      toast.error("Could not process Buy Now");
    } finally {
      setAddingCartId(null);
    }
  };

  // Dynamic positioning to prevent overlap with AiAssistantFab on products page and MobileBottomNav
  const isProductsPage = pathname.startsWith("/products") || pathname.startsWith("/product");
  const floatingPosClass = isProductsPage
    ? "bottom-20 right-4 sm:bottom-[5.5rem] sm:right-6"
    : "bottom-20 right-4 sm:bottom-6 sm:right-6";

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <div className={`fixed ${floatingPosClass} z-40 transition-all duration-300`}>
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-xl shadow-teal-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/40 focus:outline-none focus:ring-4 focus:ring-teal-400/40"
          aria-label="Search with AI Visual Lens"
        >
          {/* Animated Glow Halo */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

          <div className="relative flex items-center gap-2">
            <div className="relative flex h-6 w-6 items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
              <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-amber-300 animate-bounce" />
            </div>
            <span className="hidden sm:inline font-bold text-sm tracking-wide text-white drop-shadow-sm">
              AI Visual Search
            </span>
          </div>
        </motion.button>
      </div>

      {/* Interactive Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex flex-col max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl backdrop-blur-xl"
            >
              {/* Modal Header */}
              <div className="relative flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-teal-500/20">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-foreground">
                        ShopNest AI Lens
                      </h2>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Vision Search
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload an image to find exact or similar products in our store
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Upload & Setup Section (Hidden or condensed when results are active) */}
                {!result ? (
                  <div className="space-y-4">
                    {/* Input Mode Selector (Upload vs Image URL) */}
                    {!previewUrl && (
                      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode("file");
                            setError(null);
                          }}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                            inputMode === "file"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <UploadCloud className="h-4 w-4" />
                          <span>Upload Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode("url");
                            setError(null);
                          }}
                          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                            inputMode === "url"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Link2 className="h-4 w-4" />
                          <span>Image URL Link</span>
                        </button>
                      </div>
                    )}

                    {/* Image Selection Area */}
                    {!previewUrl ? (
                      inputMode === "file" ? (
                        /* Drag & Drop Upload Zone */
                        <div
                          ref={dropZoneRef}
                          onDragEnter={handleDragEnter}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                            isDragging
                              ? "border-emerald-500 bg-emerald-500/15 ring-4 ring-emerald-500/20 scale-[1.01]"
                              : "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-300 ${
                            isDragging
                              ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
                          }`}>
                            <UploadCloud className="h-7 w-7" />
                          </div>
                          <p className="mt-3 text-sm font-bold text-foreground">
                            {isDragging ? (
                              <span className="text-emerald-500 font-black">Release to drop image here</span>
                            ) : (
                              <>
                                Drop your product image here, or{" "}
                                <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                                  browse
                                </span>
                              </>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Supports JPG, PNG, WebP up to 5MB
                          </p>
                        </div>
                      ) : (
                        /* Direct Image URL Input */
                        <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-6 space-y-3.5">
                          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                            <Link2 className="h-4 w-4 text-emerald-500" />
                            <span>Paste Public Image URL</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter a direct link to any product photo on the web (JPG, PNG, WebP).
                          </p>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="url"
                              value={imageUrlInput}
                              onChange={(e) => {
                                setImageUrlInput(e.target.value);
                                setError(null);
                              }}
                              placeholder="https://example.com/images/product.jpg"
                              className="w-full flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              disabled={isSearching}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleUrlPreview();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleUrlPreview}
                              disabled={!imageUrlInput.trim() || isValidatingUrl}
                              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              {isValidatingUrl ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              <span>Load Preview</span>
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      /* Preview of Selected/Loaded Image */
                      <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-background shadow-inner">
                          <img
                            src={previewUrl}
                            alt="Visual search target"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-contain"
                          />
                          {isSearching && (
                            /* Scanner Animation Overlay */
                            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center overflow-hidden">
                              <motion.div
                                animate={{ y: [0, 140, 0] }}
                                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                                className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981]"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" /> Ready for AI Analysis
                            </span>
                            {!isSearching && (
                              <button
                                onClick={handleReset}
                                className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" /> Change image
                              </button>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground truncate max-w-xs">
                            {selectedFile
                              ? selectedFile.name
                              : imageUrlInput
                              ? imageUrlInput
                              : "Target Product Image"}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            AI will inspect colors, contours, text, labels, and product type to find
                            identical or same-type catalog items.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Optional Product Name / Keyword Input */}
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-emerald-500" /> Product Name or Keyword{" "}
                          <span className="text-[11px] font-normal text-muted-foreground/80">
                            (Optional)
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. Wireless Headphone, Denim Jacket, Sony XM4..."
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        disabled={isSearching}
                      />
                      <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-0.5">
                        <Info className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          If you know the product name, enter it to refine AI matching. If not,
                          don&apos;t worry — AI will recognize the image automatically!
                        </span>
                      </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                        <Info className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleStartSearch}
                        disabled={(!previewUrl && !imageUrlInput.trim()) || isSearching}
                        className="w-full relative flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 py-3.5 px-6 font-bold text-sm text-white shadow-lg shadow-teal-500/20 transition hover:shadow-xl hover:shadow-teal-500/35 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>
                              {scanStep === 1
                                ? "Analyzing image visual features..."
                                : scanStep === 2
                                ? "Detecting brand, model & category..."
                                : "Searching ShopNest catalog..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-amber-300" />
                            <span>Find Matching Products with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ================= Results Section ================= */
                  <div className="space-y-6">
                    {/* Header Bar with Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" />
                        </span>
                        <h3 className="font-extrabold text-base text-foreground">
                          {result.isUnmetDemand
                            ? "Demand Saved to Marketplace"
                            : `Found ${result.products.length} Products`}
                        </h3>
                      </div>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Search Another Image
                      </button>
                    </div>

                    {/* AI Detection Insight Card */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" /> AI Visual Identification
                        </span>
                        {result.detected.confidence && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {result.detected.confidence.toUpperCase()} CONFIDENCE
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-base font-black text-foreground">
                          {result.detected.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {result.detected.category && (
                            <span className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/80">
                              📁 {result.detected.category}
                            </span>
                          )}
                          {result.detected.subcategory && (
                            <span className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/80">
                              📦 {result.detected.subcategory}
                            </span>
                          )}
                          {result.detected.brand && result.detected.brand !== "Generic" && (
                            <span className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/80">
                              🏷️ {result.detected.brand}
                            </span>
                          )}
                          {result.detected.color && (
                            <span className="rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border/80">
                              🎨 {result.detected.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {result.detected.features && result.detected.features.length > 0 && (
                        <div className="border-t border-emerald-500/15 pt-2">
                          <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">
                            Key Visual Features
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {result.detected.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-foreground"
                              >
                                • {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unmet Demand Notice (if no exact or same-type stock) */}
                    {result.isUnmetDemand && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                          <Info className="h-4 w-4" />
                          <span>Not Currently In Stock</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We don&apos;t show fake or unrelated items. Your exact visual search demand has been saved to our{" "}
                          <strong className="text-foreground">Seller Customer Demand Center</strong> so verified sellers can stock and list this product for you soon!
                        </p>
                      </div>
                    )}

                    {/* Products Grid or Genuine Empty State */}
                    {result.products.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-2.5">
                        <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/60" />
                        <h4 className="text-sm font-bold text-foreground">
                          No Direct or Same-Type Products In Stock Yet
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                          Our system strictly displays genuine catalog products. Because no matching or same-type item currently exists in store, we have notified our merchant network to stock this inventory.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {result.products.map((prod) => {
                          const isAdded = addedCartIds.has(prod._id);
                          const isAdding = addingCartId === prod._id;
                          const mainImage = prod.images?.[0] || "/placeholder-product.png";
                          const price = prod.discountPrice ?? prod.price;
                          const storeName =
                            typeof prod.sellerId === "object"
                              ? prod.sellerId?.storeName || prod.sellerId?.name || "ShopNest Store"
                              : "ShopNest Store";

                          return (
                            <div
                              key={prod._id}
                              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-3.5 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                            >
                              <div>
                                {/* Product Thumbnail & Match Badge */}
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/30">
                                  <img
                                    src={mainImage}
                                    alt={prod.title}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                  />
                                  {prod.matchBadge && (
                                    <div
                                      className={`absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md flex items-center gap-1 border shadow-sm ${
                                        prod.matchBadge === "Direct Match"
                                          ? "bg-emerald-700/85 text-emerald-100 border-emerald-400/40"
                                          : prod.matchBadge === "Similar Type"
                                          ? "bg-teal-700/85 text-teal-100 border-teal-400/40"
                                          : "bg-indigo-700/85 text-indigo-100 border-indigo-400/40"
                                      }`}
                                    >
                                      <Sparkles className="h-3 w-3 text-amber-300" />
                                      <span>
                                        {prod.matchScore
                                          ? `${prod.matchScore}% • ${prod.matchBadge}`
                                          : prod.matchBadge}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Title & Metadata */}
                                <div className="mt-3 space-y-1">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                    <Store className="h-3 w-3" /> {storeName}
                                  </span>
                                  <h4 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                    {prod.title}
                                  </h4>
                                </div>
                              </div>

                              {/* Price & Action Buttons */}
                              <div className="mt-3 space-y-3 pt-2 border-t border-border/60">
                                <div className="flex items-baseline justify-between">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                                      {formatCurrency(price)}
                                    </span>
                                    {prod.discountPrice && (
                                      <span className="text-xs text-muted-foreground line-through">
                                        {formatCurrency(prod.price)}
                                      </span>
                                    )}
                                  </div>
                                  {prod.ratingAvg ? (
                                    <span className="text-xs text-amber-500 font-bold">
                                      ★ {prod.ratingAvg.toFixed(1)}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  {/* Add to Cart */}
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(prod)}
                                    disabled={isAdding}
                                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition ${
                                      isAdded
                                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                        : "border-border bg-background text-foreground hover:border-emerald-500 hover:bg-emerald-500/5"
                                    }`}
                                  >
                                    {isAdding ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : isAdded ? (
                                      <>
                                        <Check className="h-3.5 w-3.5" /> Added
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                                      </>
                                    )}
                                  </button>

                                  {/* Buy Now */}
                                  <button
                                    type="button"
                                    onClick={() => handleBuyNow(prod)}
                                    disabled={isAdding}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/20 hover:brightness-105 transition"
                                  >
                                    <span>Buy Now</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
