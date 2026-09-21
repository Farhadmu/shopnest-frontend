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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Handle Visual Search Execution
  const handleStartSearch = async () => {
    if (!selectedFile && !previewUrl) {
      setError("Please select an image first");
      return;
    }

    setError(null);
    setIsSearching(true);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 1100);
    const stepTimer2 = setTimeout(() => setScanStep(3), 2200);

    try {
      let finalImageUrl = previewUrl || "";

      // If a new local file was selected, upload it to the backend
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
                    {/* Drag & Drop Upload Zone */}
                    {!previewUrl ? (
                      <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-8 text-center transition hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition duration-300">
                          <UploadCloud className="h-7 w-7" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-foreground">
                          Drop your product image here, or{" "}
                          <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                            browse
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supports JPG, PNG, WebP up to 5MB
                        </p>
                      </div>
                    ) : (
                      /* Preview of Uploaded Image */
                      <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-background shadow-inner">
                          <img
                            src={previewUrl}
                            alt="Visual search target"
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
                          <p className="text-sm font-medium text-foreground">
                            {selectedFile ? selectedFile.name : "Target Product Image"}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            AI will inspect colors, contours, text, labels, and product type to find
                            identical or related catalog items.
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
                        disabled={!previewUrl || isSearching}
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
                            ? "Market Demand Recorded"
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

                    {/* Unmet Demand Notice (if no exact stock) */}
                    {result.isUnmetDemand && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                          <Info className="h-4 w-4" />
                          <span>Exact Match Not In Stock Yet</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We noticed this exact model isn&apos;t currently listed by our sellers.
                          Good news! Your visual search demand has been saved to our{" "}
                          <strong className="text-foreground">Seller Demand Dashboard</strong> so
                          merchants can stock this product soon. In the meantime, here are closest
                          alternatives available now:
                        </p>
                      </div>
                    )}

                    {/* Products Grid */}
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
                                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                />
                                {prod.matchBadge && (
                                  <div className="absolute top-2 left-2 rounded-full bg-black/75 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md flex items-center gap-1 border border-white/20">
                                    <Sparkles className="h-3 w-3 text-amber-300" />
                                    <span>
                                      {prod.matchScore
                                        ? `${prod.matchScore}% Match`
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
