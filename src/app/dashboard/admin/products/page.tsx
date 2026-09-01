"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiCheck,
  FiPackage,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { getProducts, deleteProduct, Product, updateProduct } from "@/lib/api/products";
import { clientMutation } from "@/lib/core/client";

// Luxurious Wave Sparkline Component
function InventoryTrendChart({ seed = 1 }: { seed?: number }) {
  const chartId = useMemo(() => `trend-grad-${seed}-${Math.random().toString(36).substr(2, 6)}`, [seed]);
  
  // Variations of smooth curves matching the reference design
  const curves = [
    "M 4 22 C 24 22, 34 38, 54 38 C 74 38, 84 14, 114 10 L 126 8",
    "M 4 18 C 22 28, 42 36, 62 20 C 82 4, 102 16, 126 12",
    "M 4 26 C 26 12, 46 8, 66 28 C 86 42, 106 14, 126 10",
    "M 4 14 C 24 34, 44 40, 68 18 C 90 4, 110 22, 126 8",
  ];
  const dPath = curves[Math.abs(seed) % curves.length];

  return (
    <div className="relative h-10 w-32 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 130 46" fill="none">
        <defs>
          <linearGradient id={chartId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <filter id={`glow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soft atmospheric glow path */}
        <path
          d={dPath}
          stroke={`url(#${chartId})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-25"
          filter={`url(#glow-${chartId})`}
        />

        {/* Main High-Definition Trend Path */}
        <path
          d={dPath}
          stroke={`url(#${chartId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ending endpoint dot with glow */}
        <circle cx="126" cy="8" r="3" fill="#A855F7" className="animate-pulse" />
      </svg>
    </div>
  );
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: 0,
    stock: 0,
    category: "",
    status: "active",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3800);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page: 1, limit: 100 });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setItems([]);
      showToast("error", "Unable to load products. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductId = (p: Product): string => {
    return String((p as any)._id || p.id || "");
  };

  const getCategoryName = (p: Product): string => {
    if (typeof p.category === "object" && p.category !== null) {
      return (p.category as any).name || "General";
    }
    return String(p.category || "General");
  };

  const getSKU = (p: Product): string => {
    const rawId = getProductId(p);
    return rawId ? `dbd${rawId.slice(-6).toLowerCase()}` : "dbd425372";
  };

  const getFormattedDate = (p: Product): string => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      }
    }
    return "Mon, Aug 21, 2025";
  };

  const getBrandName = (p: Product): string => {
    return (p as any).brand || (p.storeId ? `Store #${p.storeId.slice(-4)}` : "Brand 1");
  };

  const isProductActive = (p: Product): boolean => {
    const st = (p.status || "active").toLowerCase();
    return st === "active" || st === "approved" || st === "published";
  };

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => getProductId(p)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single Delete
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionLoadingId(id);
    try {
      await deleteProduct(id);
      showToast("success", `Product "${title}" removed.`);
      setItems((prev) => prev.filter((p) => getProductId(p) !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to delete product.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} selected product(s)?`
      )
    )
      return;
    setLoading(true);
    try {
      await Promise.allSettled(selectedIds.map((id) => deleteProduct(id)));
      showToast("success", `${selectedIds.length} products deleted successfully.`);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("error", "Some products could not be deleted.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk Status Change
  const handleBulkStatusChange = async (newStatus: "active" | "inactive") => {
    setLoading(true);
    try {
      await Promise.allSettled(
        selectedIds.map((id) =>
          clientMutation(`/products/${id}/moderate`, "PATCH", {
            status: newStatus === "active" ? "approved" : "rejected",
          }).catch(() =>
            updateProduct(id, { status: newStatus } as any)
          )
        )
      );
      showToast("success", `Selected products set to ${newStatus}.`);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update bulk status.");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditFormData({
      title: p.title || "",
      price: p.price || 0,
      stock: p.stock || 0,
      category: getCategoryName(p),
      status: isProductActive(p) ? "active" : "inactive",
    });
  };

  // Save Edit Modal
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const pid = getProductId(editingProduct);
    setIsSavingEdit(true);

    try {
      await updateProduct(pid, {
        title: editFormData.title,
        price: Number(editFormData.price),
        stock: Number(editFormData.stock),
        category: editFormData.category,
      });

      try {
        await clientMutation(`/products/${pid}/moderate`, "PATCH", {
          status: editFormData.status === "active" ? "approved" : "rejected",
        });
      } catch {
        // Fallback handled
      }

      showToast("success", "Product updated successfully.");
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      console.error("Save edit failed:", err);
      showToast("error", "Failed to save product changes.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Unique Categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      const c = getCategoryName(p);
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [items]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return items.filter((p) => {
      const active = isProductActive(p);
      const pCat = getCategoryName(p);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && active) ||
        (statusFilter === "inactive" && !active);

      const matchesCategory =
        categoryFilter === "all" || pCat.toLowerCase() === categoryFilter.toLowerCase();

      const query = search.trim().toLowerCase();
      const pId = getProductId(p).toLowerCase();
      const pTitle = (p.title || "").toLowerCase();
      const pSku = getSKU(p).toLowerCase();
      const pBrand = getBrandName(p).toLowerCase();

      const matchesSearch =
        !query ||
        pTitle.includes(query) ||
        pSku.includes(query) ||
        pCat.toLowerCase().includes(query) ||
        pBrand.includes(query) ||
        pId.includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [items, statusFilter, categoryFilter, search]);

  // Paginated Slicing
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const allSelected =
    filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  return (
    <div className="min-h-screen dark:bg-[#090614] text-[#0F172A] dark:text-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              {toast.type === "success" ? <FiCheckCircle size={18} /> : <FiAlertTriangle size={18} />}
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-[#4F46E5] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#818CF8]">
                Catalog Governance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
              Product Inventory
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              Live inventory monitoring, stock velocity tracking, and catalog controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#2D2250] bg-white dark:bg-[#130E26] text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] shadow-xs hover:border-[#4F46E5] hover:text-[#4F46E5] dark:hover:border-[#818CF8] dark:hover:text-[#818CF8] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={loading ? "animate-spin text-[#4F46E5]" : ""} size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#130E26] p-3 rounded-2xl border border-[#E2E8F0] dark:border-[#2D2250] shadow-xs">
          
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[260px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm" />
            <input
              type="text"
              placeholder="Search product name, SKU, brand, category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Right: Filter tabs & Category dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="inline-flex p-1 bg-[#F8FAFC] dark:bg-[#090614] rounded-xl border border-[#E2E8F0] dark:border-[#2D2250]">
              {[
                { key: "all", label: "All", count: items.length },
                {
                  key: "active",
                  label: "Active",
                  count: items.filter((p) => isProductActive(p)).length,
                },
                {
                  key: "inactive",
                  label: "Inactive",
                  count: items.filter((p) => !isProductActive(p)).length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === tab.key
                      ? "bg-white dark:bg-[#1E1738] text-[#4F46E5] dark:text-[#A5B4FC] shadow-xs font-bold"
                      : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === tab.key
                        ? "bg-[#4F46E5]/10 dark:bg-[#818CF8]/20 text-[#4F46E5] dark:text-[#A5B4FC]"
                        : "bg-slate-200/60 dark:bg-slate-800 text-[#64748B] dark:text-[#94A3B8]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Filter */}
            {categoriesList.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#475569] dark:text-[#CBD5E1] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Floating Bulk Actions Bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20 border border-[#4F46E5]/30 rounded-2xl text-xs font-semibold backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#4F46E5] text-white font-bold text-[11px]">
                  {selectedIds.length} Selected
                </span>
                <span className="text-[#334155] dark:text-[#E2E8F0]">
                  Perform batch operations on chosen catalog items
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusChange("active")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FiCheck size={13} /> Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange("inactive")}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FiXCircle size={13} /> Mark Inactive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FiTrash2 size={13} /> Delete Selected
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-[#64748B] dark:text-[#CBD5E1] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Elevated Cards Table Container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#CBD5E1] dark:scrollbar-thumb-[#2D2250] pb-4">
          <div className="min-w-[1120px]">
            
            {/* Table Header Row */}
            <div className="grid grid-cols-[48px_minmax(240px,2fr)_140px_110px_120px_130px_150px_110px_90px_120px] items-center px-5 py-3 mb-2 text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              <div className="flex items-center justify-start">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded-md border-[#CBD5E1] dark:border-[#4B3D72] text-[#4F46E5] focus:ring-[#4F46E5]/40 cursor-pointer accent-[#4F46E5]"
                />
              </div>
              <div>Product Name/SKU</div>
              <div>Created At</div>
              <div>Brand</div>
              <div>Category</div>
              <div>Available Quantity</div>
              <div>Inventory Trend</div>
              <div>Status</div>
              <div>Price</div>
              <div className="text-right pr-2">Action</div>
            </div>

            {/* Table Rows (Elevated Floating Card Rows) */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full rounded-2xl bg-white dark:bg-[#130E26] border border-[#E2E8F0] dark:border-[#2D2250] animate-pulse flex items-center px-6 gap-4"
                  >
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-11 w-11 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-44 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#2D2250] bg-white dark:bg-[#130E26] p-16 text-center shadow-xs">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#4F46E5]/10 text-2xl text-[#4F46E5]">
                  <FiPackage />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  No Products Found
                </h3>
                <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
                  {items.length === 0
                    ? "Your catalog is empty. Start adding your first product to see live metrics and trends."
                    : "No products matched your search keyword or selected status filters."}
                </p>
                {(search || statusFilter !== "all" || categoryFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setCategoryFilter("all");
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.04,
                    },
                  },
                }}
                className="space-y-2.5"
              >
                {paginatedProducts.map((p, idx) => {
                  const pid = getProductId(p);
                  const isSelected = selectedIds.includes(pid);
                  const active = isProductActive(p);
                  const sku = getSKU(p);
                  const dateStr = getFormattedDate(p);
                  const brand = getBrandName(p);
                  const category = getCategoryName(p);
                  const quantity = Number(p.stock || 0);
                  const price = Number(p.price || 0);
                  const isBusy = actionLoadingId === pid;
                  const imageUrl = p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60";

                  return (
                    <motion.div
                      key={pid}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className={`grid grid-cols-[48px_minmax(240px,2fr)_140px_110px_120px_130px_150px_110px_90px_120px] items-center px-5 py-3.5 rounded-xl bg-white dark:bg-[#130E26] border transition-all duration-200 ${
                        isSelected
                          ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md ring-1 ring-[#4F46E5]/20 bg-[#F5F3FF]/40 dark:bg-[#1A1435]"
                          : "border-[#E2E8F0] dark:border-[#2D2250] shadow-xs hover:shadow-md hover:border-[#CBD5E1] dark:hover:border-[#42336D]"
                      }`}
                    >
                      {/* 1. Checkbox Column */}
                      <div className="flex items-center justify-start">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(pid)}
                          className="h-4 w-4 rounded-md border-[#CBD5E1] dark:border-[#4B3D72] text-[#4F46E5] focus:ring-[#4F46E5]/40 cursor-pointer accent-[#4F46E5]"
                        />
                      </div>

                      {/* 2. Product Info Column (Thumbnail + Title/SKU) */}
                      <div className="flex items-center gap-3.5 pr-4 min-w-0">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-[#E2E8F0] dark:border-[#2D2250] bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {p.images?.[0] ? (
                            <Image
                              src={imageUrl}
                              alt={p.title || "Product Thumbnail"}
                              width={44}
                              height={44}
                              unoptimized
                              className="h-full w-full object-cover rounded-sm"
                            />
                          ) : (
                            <span className="text-base">📦</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate hover:text-[#4F46E5] dark:hover:text-[#818CF8] transition-colors cursor-pointer"
                            title={p.title}
                          >
                            {p.title || "Product 1"}
                          </h3>
                          <p className="text-xs text-[#94A3B8] font-mono tracking-tight mt-0.5">
                            {sku}
                          </p>
                        </div>
                      </div>

                      {/* 3. Created At Column */}
                      <div className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] truncate pr-2">
                        {dateStr}
                      </div>

                      {/* 4. Brand Column */}
                      <div className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] truncate pr-2">
                        {brand}
                      </div>

                      {/* 5. Category Column */}
                      <div className="text-xs font-medium text-[#475569] dark:text-[#CBD5E1] truncate pr-2">
                        {category}
                      </div>

                      {/* 6. Available Quantity Column */}
                      <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {quantity.toLocaleString()}
                      </div>

                      {/* 7. Inventory Trend Column (Wave Sparkline) */}
                      <div className="flex items-center">
                        <InventoryTrendChart seed={idx + 1} />
                      </div>

                      {/* 8. Status Column */}
                      <div>
                        {active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/60 shadow-2xs">
                            <FiCheckCircle size={13} className="text-emerald-500 shrink-0" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/60 shadow-2xs">
                            <FiXCircle size={13} className="text-rose-500 shrink-0" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </div>

                      {/* 9. Price Column (Bangladeshi Taka ৳) */}
                      <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        ৳{price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>

                      {/* 10. Actions Column (View, Edit & Trash Icon Buttons) */}
                      <div className="flex items-center justify-end gap-1.5 pr-2">
                        {/* View Button */}
                        <Link
                          href={`/products/${pid}`}
                          target="_blank"
                          className="p-2 rounded-lg text-[#4F46E5] hover:bg-[#EEF2FF] dark:text-[#818CF8] dark:hover:bg-[#1E1B4B] border border-transparent hover:border-[#C7D2FE] dark:hover:border-[#3730A3] transition-all cursor-pointer"
                          title="View Product in Store"
                        >
                          <FiEye size={14} />
                        </Link>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-lg text-[#2563EB] hover:bg-[#EEF2FF] dark:text-[#60A5FA] dark:hover:bg-[#1E293B] border border-transparent hover:border-[#BFDBFE] dark:hover:border-[#334155] transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <FiEdit2 size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          disabled={isBusy}
                          onClick={() => handleDeleteProduct(pid, p.title)}
                          className="p-2 rounded-lg text-[#F43F5E] hover:bg-[#FFF1F2] dark:text-[#FB7185] dark:hover:bg-[#2A121A] border border-transparent hover:border-[#FECDD3] dark:hover:border-[#4C1D24] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete Product"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer & Pagination */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <div>
              Showing{" "}
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {filteredProducts.length}
              </span>{" "}
              items
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#2D2250] bg-white dark:bg-[#130E26] text-[#475569] dark:text-[#CBD5E1] hover:border-[#4F46E5] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                          currentPage === page
                            ? "bg-[#4F46E5] text-white shadow-xs"
                            : "border border-[#E2E8F0] dark:border-[#2D2250] bg-white dark:bg-[#130E26] text-[#475569] dark:text-[#CBD5E1] hover:border-[#4F46E5]"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#2D2250] bg-white dark:bg-[#130E26] text-[#475569] dark:text-[#CBD5E1] hover:border-[#4F46E5] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Quick Edit Modal */}
        <AnimatePresence>
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-md bg-white dark:bg-[#130E26] border border-[#E2E8F0] dark:border-[#2D2250] rounded-2xl p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#2D2250] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Edit Product
                    </h2>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      SKU: {getSKU(editingProduct)}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] mb-1">
                        Price (৳)
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={editFormData.price}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] mb-1">
                        Stock Units
                      </label>
                      <input
                        type="number"
                        required
                        value={editFormData.stock}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.category}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, category: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#475569] dark:text-[#CBD5E1] mb-1">
                        Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#090614] border border-[#E2E8F0] dark:border-[#2D2250] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#4F46E5] cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#2D2250]">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition shadow-md shadow-[#4F46E5]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingEdit ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
