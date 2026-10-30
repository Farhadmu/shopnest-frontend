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
  CheckCircle2,
  Link2,
  Heart,
  GitCompare,
  MessageSquare,
  Share2,
  History,
  Trash2,
  Crop,
  Layers,
  ChevronRight,
  Sparkle,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "@/context/ToastContext";
import {
  uploadVisualSearchImage,
  searchByVisualAI,
  getVisualSearchHistory,
  clearVisualSearchHistory,
  VisualSearchResult,
  VisualSearchProduct,
  VisualSearchCropBox,
  VisualSearchHistoryItem,
} from "@/lib/api/ai-visual-search";
import { formatCurrency } from "@/lib/utils";

// Preset focus regions for crop selector
const CROP_PRESETS: Array<{
  id: string;
  name: string;
  box: VisualSearchCropBox | null;
}> = [
  { id: "full", name: "Entire Photo", box: null },
  { id: "center", name: "Center Focus", box: { x: 0.15, y: 0.15, width: 0.7, height: 0.7 } },
  { id: "top", name: "Top Half", box: { x: 0.05, y: 0.05, width: 0.9, height: 0.45 } },
  { id: "bottom", name: "Bottom Half", box: { x: 0.05, y: 0.5, width: 0.9, height: 0.45 } },
];

export function AiVisualSearchWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartDrawer();
  const { isInWishlist, toggleWishlist } = useWishlist();

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

  // Modal & View Mode
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "history">("search");

  // Input states
  const [inputMode, setInputMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Crop Region state
  const [isCropActive, setIsCropActive] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("full");
  const [activeCropBox, setActiveCropBox] = useState<VisualSearchCropBox | null>(null);

  // Search & Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<VisualSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupTab, setSelectedGroupTab] = useState<"all" | "highly_similar" | "similar_style" | "alternative">("all");

  // Cart & Wishlist action states
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [addedCartIds, setAddedCartIds] = useState<Set<string>>(new Set());

  // History state
  const [historyItems, setHistoryItems] = useState<VisualSearchHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSearching) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSearching]);

  // Load history when tab is opened
  const fetchHistory = useCallback(async () => {
    if (!session?.user) return;
    try {
      setIsLoadingHistory(true);
      const items = await getVisualSearchHistory();
      setHistoryItems(items || []);
    } catch {
      // Graceful fallback for history load failure
    } finally {
      setIsLoadingHistory(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (isOpen && activeTab === "history" && session?.user) {
      fetchHistory();
    }
  }, [isOpen, activeTab, session?.user, fetchHistory]);

  // Clear history handler
  const handleClearHistory = async () => {
    try {
      setIsClearingHistory(true);
      await clearVisualSearchHistory();
      setHistoryItems([]);
      toast.success("Visual search history cleared");
    } catch {
      toast.error("Failed to clear history");
    } finally {
      setIsClearingHistory(false);
    }
  };

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
    if (file.size > 25 * 1024 * 1024) {
      setError("Image size should be under 25MB");
      return;
    }
    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setSelectedPresetId("full");
    setActiveCropBox(null);
    setIsCropActive(false);
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

    const testImg = new window.Image();
    testImg.onload = () => {
      setPreviewUrl(trimmed);
      setSelectedFile(null);
      setIsValidatingUrl(false);
      setError(null);
      setSelectedPresetId("full");
      setActiveCropBox(null);
      setIsCropActive(false);
    };
    testImg.onerror = () => {
      setPreviewUrl(trimmed);
      setSelectedFile(null);
      setIsValidatingUrl(false);
      setSelectedPresetId("full");
      setActiveCropBox(null);
      setIsCropActive(false);
    };
    testImg.src = trimmed;
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setImageUrlInput(text.trim());
        setError(null);
        toast.success("URL pasted from clipboard");
      }
    } catch {
      // Browser permissions denied
    }
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

  // Select crop preset
  const handleSelectPreset = (preset: typeof CROP_PRESETS[number]) => {
    setSelectedPresetId(preset.id);
    setActiveCropBox(preset.box);
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

      // Execute AI Visual Search with optional crop box
      const searchRes = await searchByVisualAI({
        imageUrl: finalImageUrl,
        searchQuery: searchQuery.trim() || undefined,
        cropBox: activeCropBox || undefined,
      });

      setResult(searchRes);
      setSelectedGroupTab("all");
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
    setSelectedPresetId("full");
    setActiveCropBox(null);
    setIsCropActive(false);
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

  // Ask AI Advisor Context Bridge
  const handleAskAiAdvisor = (product?: VisualSearchProduct) => {
    if (!result) return;
    const contextData = {
      detected: result.detected,
      query: searchQuery || undefined,
      targetProduct: product || undefined,
      products: result.products.slice(0, 6).map((p) => ({
        id: p._id,
        title: p.title,
        price: p.discountPrice ?? p.price,
        category: p.category,
        image: p.images?.[0],
        matchBadge: p.matchBadge,
      })),
    };
    try {
      sessionStorage.setItem("shopnest_visual_advisor_context", JSON.stringify(contextData));
    } catch {
      // sessionStorage quota or security restriction
    }
    setIsOpen(false);
    router.push("/ai-advisor?from=visual-search");
  };

  // Share Product Link
  const handleShareProduct = (product: VisualSearchProduct) => {
    const url = `${window.location.origin}/products/${product._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Product link copied to clipboard!");
    } else {
      toast.info(`Product URL: ${url}`);
    }
  };

  // Filter products by Group Tab
  const filteredProducts = (result?.products || []).filter((prod) => {
    if (selectedGroupTab === "all") return true;
    if (selectedGroupTab === "highly_similar") {
      return (
        prod.matchBadge === "Direct Match" ||
        prod.matchBadge === "Highly Similar" ||
        (prod.matchScore && prod.matchScore >= 80)
      );
    }
    if (selectedGroupTab === "similar_style") {
      return (
        prod.matchBadge === "Similar Style" ||
        prod.matchBadge === "Similar Type" ||
        (prod.matchScore && prod.matchScore >= 55 && prod.matchScore < 80)
      );
    }
    if (selectedGroupTab === "alternative") {
      return (
        prod.matchBadge === "Alternative" ||
        (prod.matchScore && prod.matchScore < 55)
      );
    }
    return true;
  });

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex flex-col max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl backdrop-blur-xl"
            >
              {/* Modal Header */}
              <div className="relative flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 px-5 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-teal-500/20">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-foreground">
                        ShopNest AI Lens 2.0
                      </h2>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Visual Commerce Engine
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Multimodal image & attribute search across verified ShopNest catalog
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search / History Tab Switcher for Authenticated Users */}
                  {session?.user && (
                    <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/60">
                      <button
                        onClick={() => setActiveTab("search")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === "search"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Search</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeTab === "history"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>History</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {activeTab === "history" ? (
                  /* ================= Authenticated Search History View ================= */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                          <History className="h-4 w-4 text-emerald-500" />
                          <span>Your Visual Search History</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Private 30-day history of your visual discoveries
                        </p>
                      </div>
                      {historyItems.length > 0 && (
                        <button
                          onClick={handleClearHistory}
                          disabled={isClearingHistory}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear History</span>
                        </button>
                      )}
                    </div>

                    {isLoadingHistory ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                        <p className="text-xs">Loading search history...</p>
                      </div>
                    ) : historyItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center space-y-2">
                        <History className="h-8 w-8 text-muted-foreground/60" />
                        <h4 className="text-sm font-bold text-foreground">No Visual Searches Yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          When you search for items by photo or URL, your searches will appear here for easy reference.
                        </p>
                        <button
                          onClick={() => setActiveTab("search")}
                          className="mt-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        >
                          Start First Search
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {historyItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 hover:border-emerald-500/40 transition group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <Camera className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-foreground truncate">
                                  {item.detectedProductType || item.searchQuery || "Visual Search"}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                  <span>{item.detectedCategory || "General"}</span>
                                  <span>•</span>
                                  <span>{item.resultCount} results</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab("search");
                                setSearchQuery(item.searchQuery || item.detectedProductType || "");
                              }}
                              className="rounded-xl border border-border bg-muted/40 p-2 text-muted-foreground group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition"
                              title="Re-run search"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : !result ? (
                  /* ================= Upload & Search Setup Section ================= */
                  <div className="space-y-4">
                    {/* Input Mode Selector */}
                    {!previewUrl && (
                      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode("file");
                            setError(null);
                            cameraInputRef.current?.click();
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:brightness-105 transition"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Take Photo (Camera)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode("file");
                            setError(null);
                            fileInputRef.current?.click();
                          }}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                            inputMode === "file"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <UploadCloud className="h-4 w-4" />
                          <span>Upload from Device</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMode("url");
                            setError(null);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
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
                          {/* Dedicated Phone Camera input */}
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          {/* File browser input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition duration-300 ${
                              isDragging
                                ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-110"
                            }`}
                          >
                            <Camera className="h-7 w-7" />
                          </div>
                          <p className="mt-3 text-sm font-bold text-foreground">
                            {isDragging ? (
                              <span className="text-emerald-500 font-black">Release to drop image here</span>
                            ) : (
                              <>
                                Take a photo with phone camera or{" "}
                                <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2">
                                  browse gallery
                                </span>
                              </>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                            Capture any item you own or see. Even without knowing the name, ShopNest AI will identify its exact market model and check our store inventory.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-6 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                              <Link2 className="h-4 w-4 text-emerald-500" />
                              <span>Paste Public Image URL</span>
                            </div>
                            <button
                              type="button"
                              onClick={handlePasteFromClipboard}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              Paste from Clipboard
                            </button>
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
                      /* Preview of Selected/Loaded Image with Product Region Selector */
                      <div className="space-y-3">
                        <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
                          {/* Image Box with optional visual crop frame */}
                          <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl border border-border bg-background shadow-inner flex items-center justify-center">
                            <img
                              src={previewUrl}
                              alt="Visual search target"
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain"
                            />

                            {/* Crop Overlay Visualizer */}
                            {isCropActive && activeCropBox && (
                              <div
                                className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 shadow-lg pointer-events-none transition-all duration-300"
                                style={{
                                  left: `${activeCropBox.x * 100}%`,
                                  top: `${activeCropBox.y * 100}%`,
                                  width: `${activeCropBox.width * 100}%`,
                                  height: `${activeCropBox.height * 100}%`,
                                }}
                              >
                                <span className="absolute -top-5 left-1 text-[10px] font-black uppercase text-amber-300 bg-black/80 px-1.5 py-0.5 rounded">
                                  Focus Region
                                </span>
                              </div>
                            )}

                            {isSearching && (
                              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center overflow-hidden">
                                <motion.div
                                  animate={{ y: [0, 160, 0] }}
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
                              ShopNest AI extracts multimodal embeddings, identifying category, brand, dominant colors, and contours.
                            </p>

                            {/* Crop / Product Focus Mode Toggle */}
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => setIsCropActive(!isCropActive)}
                                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                                  isCropActive
                                    ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "border-border bg-background text-foreground hover:bg-muted"
                                }`}
                              >
                                <Crop className="h-3.5 w-3.5" />
                                <span>{isCropActive ? "Focus Region Active" : "Crop / Focus Region"}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Crop Region Presets Panel */}
                        {isCropActive && (
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Crop className="h-3.5 w-3.5" /> Focus on Specific Product in Photo
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Select which part of the photo contains the product:
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {CROP_PRESETS.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => handleSelectPreset(preset)}
                                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                    selectedPresetId === preset.id
                                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                      : "border border-border bg-card text-foreground hover:bg-muted"
                                  }`}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional Product Name / Keyword Input */}
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-emerald-500" /> Refine with Keywords{" "}
                          <span className="text-[11px] font-normal text-muted-foreground/80">
                            (Optional)
                          </span>
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="e.g. Wireless Headphone, Denim Jacket, Sony..."
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          disabled={isSearching}
                        />
                        {searchQuery && !isSearching && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition"
                            aria-label="Clear query"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 pt-0.5">
                        <Info className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          If you know specific features or price criteria, type them in. Otherwise, Vision AI will automatically analyze the image.
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
                                ? "Extracting multimodal embeddings & attributes..."
                                : "Searching ShopNest catalog with hybrid ranking..."}
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
                    {/* Header Bar with Reset & Ask AI Quick Action */}
                    {/* Header Bar with Reset & Ask AI Quick Action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                          result.products.length > 0
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}>
                          {result.products.length > 0 ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                        </span>
                        <div>
                          {(() => {
                            const directCount = result.products.filter(p => p.matchBadge === "Direct Match" || p.matchGroup === "HIGHLY SIMILAR").length;
                            const similarCount = result.products.length - directCount;
                            return (
                              <h3 className="font-extrabold text-base text-foreground">
                                {result.products.length > 0 ? (
                                  directCount > 0 && similarCount > 0
                                    ? `Found ${directCount} Exact Match & ${similarCount} Similar Product(s)`
                                    : directCount > 0
                                    ? `Found ${directCount} Exact Match Product(s) in Stock`
                                    : `Found ${similarCount} Similar Product(s) on ShopNest`
                                ) : (
                                  `Product Identified: ${result.detected.title} • Not in Store Catalog`
                                )}
                              </h3>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {result.products.length > 0 && (
                          <button
                            onClick={() => handleAskAiAdvisor()}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-105 transition"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                            <span>Ask AI Advisor</span>
                          </button>
                        )}

                        <button
                          onClick={handleReset}
                          className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Search Another
                        </button>
                      </div>
                    </div>

                    {/* AI Detection Insight Card with Structured Visual Traits */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/15 pb-2.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            AI Visual Identification Result
                          </span>
                        </div>
                        {result.detected.confidence && (
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            {result.detected.confidence.toUpperCase()} CONFIDENCE
                          </span>
                        )}
                      </div>

                      {/* Detected Market Name */}
                      <div className="space-y-1.5 rounded-xl bg-background/80 p-3.5 border border-emerald-500/20 shadow-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          📸 Identified Product Name from Image
                        </span>
                        <h4 className="text-lg sm:text-xl font-black text-foreground leading-snug">
                          {result.detected.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Vision AI recognized this item as: <strong className="text-foreground">{result.detected.brand !== "Generic" ? `${result.detected.brand} ` : ""}{result.detected.model && result.detected.model !== "N/A" ? result.detected.model : result.detected.title}</strong> ({result.detected.productType || result.detected.subcategory || result.detected.category}).
                        </p>
                      </div>

                      {/* Key Product Metadata Grid (Model, Brand, Market Price, Category) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        {result.detected.model && result.detected.model !== "N/A" && (
                          <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Model / Spec
                            </span>
                            <span className="text-xs font-black text-foreground truncate block">
                              {result.detected.model}
                            </span>
                          </div>
                        )}
                        {result.detected.brand && (
                          <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Brand
                            </span>
                            <span className="text-xs font-black text-foreground truncate block">
                              {result.detected.brand}
                            </span>
                          </div>
                        )}
                        {result.detected.marketPriceEstimate && result.detected.marketPriceEstimate !== "N/A" && (
                          <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Market Est. Price
                            </span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate block">
                              {result.detected.marketPriceEstimate}
                            </span>
                          </div>
                        )}
                        {result.detected.category && (
                          <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Category
                            </span>
                            <span className="text-xs font-black text-foreground truncate block">
                              {result.detected.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Visual Features & Tags */}
                      {result.detected.features && result.detected.features.length > 0 && (
                        <div className="border-t border-emerald-500/15 pt-2.5 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                            Key Visual Features
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.detected.features.map((feat, idx) => (
                              <span
                                key={idx}
                                className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-foreground font-medium"
                              >
                                • {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unmet Demand Notice when not currently in stock */}
                    {result.products.length === 0 && (
                      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                          <Info className="h-5 w-5 shrink-0" />
                          <span>Not Currently in ShopNest Stock</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We identified the exact market name and specifications of your photographed item.
                          Since this exact product is not currently listed in our catalog, <strong className="text-foreground">we do not show unrelated or random products</strong>.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-500/20 text-xs">
                          <div className="flex items-center gap-2 text-foreground font-semibold">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Saved to <strong>Seller Customer Demand Center</strong></span>
                          </div>
                          <span className="text-[11px] text-muted-foreground bg-background/80 px-2.5 py-1 rounded-lg border border-border">
                            Verified sellers can now source &amp; stock this item for you
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Products Grid only when matched products exist in catalog */}
                    {result.products.length > 0 && (
                      <div className="space-y-4 pt-2">
                        {/* Result Grouping Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
                          <button
                            onClick={() => setSelectedGroupTab("all")}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              selectedGroupTab === "all"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            All ({result.products.length})
                          </button>
                          <button
                            onClick={() => setSelectedGroupTab("highly_similar")}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
                              selectedGroupTab === "highly_similar"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span>Direct Matches</span>
                          </button>
                          <button
                            onClick={() => setSelectedGroupTab("similar_style")}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 ${
                              selectedGroupTab === "similar_style"
                                ? "bg-teal-600 text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full bg-teal-400" />
                            <span>Similar Style</span>
                          </button>
                        </div>

                        {/* Products Grid or Empty Group Filter State */}
                        {filteredProducts.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-2.5">
                            <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground/60" />
                            <h4 className="text-sm font-bold text-foreground">
                              No Products in this Tab Filter
                            </h4>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                              Try switching to the &quot;All&quot; tab to explore all matching catalog items.
                            </p>
                          </div>
                        ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {filteredProducts.map((prod) => {
                          const isAdded = addedCartIds.has(prod._id);
                          const isAdding = addingCartId === prod._id;
                          const inWish = isInWishlist(prod._id);
                          const mainImage = prod.images?.[0] || "/placeholder-product.png";
                          const price = prod.discountPrice ?? prod.price;
                          const storeName =
                            typeof prod.sellerId === "object"
                              ? prod.sellerId?.storeName || prod.sellerId?.name || "ShopNest Store"
                              : "ShopNest Store";
                          const sellerId =
                            typeof prod.sellerId === "object" ? prod.sellerId?._id : prod.sellerId;

                          return (
                            <div
                              key={prod._id}
                              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-3.5 transition hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
                            >
                              <div>
                                {/* Product Thumbnail & Quick Action Badges */}
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/30">
                                  <img
                                    src={mainImage}
                                    alt={prod.title}
                                    referrerPolicy="no-referrer"
                                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105 cursor-pointer"
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/products/${prod._id}`);
                                    }}
                                  />

                                  {/* Match Badge */}
                                  {prod.matchBadge && (
                                    <div
                                      className={`absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md flex items-center gap-1 border shadow-sm ${
                                        prod.matchBadge === "Direct Match" || prod.matchBadge === "Highly Similar"
                                          ? "bg-emerald-700/85 text-emerald-100 border-emerald-400/40"
                                          : prod.matchBadge === "Similar Style"
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

                                  {/* Wishlist & Share Buttons (Top-Right) */}
                                  <div className="absolute top-2 right-2 flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleShareProduct(prod)}
                                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition"
                                      title="Share product link"
                                    >
                                      <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleWishlist({
                                          id: prod._id,
                                          title: prod.title,
                                          price: prod.price,
                                          image: prod.images?.[0],
                                          category: prod.category,
                                        })
                                      }
                                      className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition ${
                                        inWish
                                          ? "bg-rose-500 text-white"
                                          : "bg-black/60 text-white hover:bg-black/80"
                                      }`}
                                      title={inWish ? "Remove from wishlist" : "Add to wishlist"}
                                    >
                                      <Heart
                                        className={`h-3.5 w-3.5 ${inWish ? "fill-white" : ""}`}
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* Title & Seller Store */}
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (sellerId) {
                                          setIsOpen(false);
                                          router.push(`/sellers/${sellerId}`);
                                        }
                                      }}
                                      className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 hover:text-emerald-600 transition"
                                    >
                                      <Store className="h-3 w-3" /> {storeName}
                                    </button>
                                  </div>

                                  <h4
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/products/${prod._id}`);
                                    }}
                                    className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition cursor-pointer"
                                  >
                                    {prod.title}
                                  </h4>
                                </div>
                              </div>

                              {/* Price & Action Suite */}
                              <div className="mt-3 space-y-2.5 pt-2 border-t border-border/60">
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

                                {/* Secondary Actions: Compare & Ask AI */}
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOpen(false);
                                      router.push(`/compare?ids=${prod._id}`);
                                    }}
                                    className="flex items-center justify-center gap-1 rounded-xl border border-border bg-background py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                  >
                                    <GitCompare className="h-3 w-3" />
                                    <span>Compare</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAskAiAdvisor(prod)}
                                    className="flex items-center justify-center gap-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    <span>Ask AI</span>
                                  </button>
                                </div>

                                {/* Primary Commerce Buttons: Add to Cart & Buy Now */}
                                <div className="grid grid-cols-2 gap-2">
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
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
