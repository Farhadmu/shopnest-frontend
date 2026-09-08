"use client";

import React, { useEffect, useState, useMemo, useId } from "react";
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
  FiDownload,
  FiGrid,
  FiList,
  FiLayers,
  FiAlertCircle,
  FiExternalLink,
  FiCopy,
} from "react-icons/fi";
import { getProducts, deleteProduct, Product, updateProduct } from "@/lib/api/products";
import { clientMutation } from "@/lib/core/client";

// Compact Wave Sparkline Component
function InventoryTrendChart({ seed = 1 }: { seed?: number }) {
  const chartUniqueId = useId().replace(/:/g, "");

  const curves = [
    "M 4 20 C 18 20, 28 32, 44 32 C 60 32, 68 12, 92 8 L 100 6",
    "M 4 16 C 18 24, 34 30, 50 16 C 66 4, 82 14, 100 10",
    "M 4 22 C 20 10, 36 8, 52 24 C 68 34, 84 12, 100 8",
    "M 4 12 C 18 28, 34 32, 54 14 C 72 4, 88 18, 100 6",
  ];
  const dPath = curves[Math.abs(seed) % curves.length];

  return (
    <div className="relative h-5 w-16 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 104 38" fill="none">
        <defs>
          <linearGradient id={chartUniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          d={dPath}
          stroke={`url(#${chartUniqueId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="7" r="2.5" fill="#A855F7" />
      </svg>
    </div>
  );
}

interface AdminProductsManagerProps {
  initialProducts: Product[];
}

export function AdminProductsManager({ initialProducts = [] }: AdminProductsManagerProps) {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "low_stock">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "name_asc">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: 0,
    discountPrice: 0,
    stock: 0,
    category: "",
    status: "active",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Sync when initialProducts updates
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setItems(initialProducts);
    }
  }, [initialProducts]);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ page: 1, limit: 100 });
      setItems(Array.isArray(data) ? data : []);
      showToast("success", "Catalog refreshed.");
    } catch (err) {
      console.error("Failed to load products:", err);
      showToast("error", "Unable to refresh products.");
    } finally {
      setLoading(false);
    }
  };

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
    return rawId ? `SKU-${rawId.slice(-6).toUpperCase()}` : "SKU-PROD01";
  };

  const getBrandName = (p: Product): string => {
    return (p as any).brand || (p.storeId ? `Store #${p.storeId.slice(-4)}` : "Verified Vendor");
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

  // Quick Toggle Status
  const handleToggleStatus = async (p: Product) => {
    const pid = getProductId(p);
    const currentlyActive = isProductActive(p);
    const nextStatus = currentlyActive ? "inactive" : "active";
    setActionLoadingId(pid);

    try {
      await clientMutation(`/products/${pid}/moderate`, "PATCH", {
        status: nextStatus === "active" ? "approved" : "rejected",
      }).catch(() =>
        updateProduct(pid, { status: nextStatus } as any)
      );

      setItems((prev) =>
        prev.map((item) =>
          getProductId(item) === pid
            ? { ...item, status: nextStatus === "active" ? "approved" : "rejected" }
            : item
        )
      );
      showToast("success", `Product marked as ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to update product status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Single Delete
  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setActionLoadingId(id);
    try {
      await deleteProduct(id);
      showToast("success", `Product "${title}" deleted.`);
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
      showToast("success", `${selectedIds.length} products marked as ${newStatus}.`);
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
      discountPrice: p.discountPrice || 0,
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
        discountPrice: editFormData.discountPrice ? Number(editFormData.discountPrice) : undefined,
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

  // Export CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      showToast("error", "No products to export.");
      return;
    }
    const headers = ["ID", "SKU", "Title", "Brand", "Category", "Price (BDT)", "Stock", "Status"];
    const rows = filteredProducts.map((p) => [
      getProductId(p),
      getSKU(p),
      `"${(p.title || "").replace(/"/g, '""')}"`,
      `"${getBrandName(p).replace(/"/g, '""')}"`,
      `"${getCategoryName(p).replace(/"/g, '""')}"`,
      p.price || 0,
      p.stock || 0,
      isProductActive(p) ? "Active" : "Inactive",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shopnest-products-catalog-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Catalog exported to CSV.");
  };

  // Unique Categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      const c = getCategoryName(p);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [items]);

  // Key KPI Metrics Calculations
  const metrics = useMemo(() => {
    const total = items.length;
    const activeCount = items.filter((p) => isProductActive(p)).length;
    const inactiveCount = total - activeCount;
    const lowStockCount = items.filter((p) => (p.stock || 0) <= 5).length;
    const totalValuation = items.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    const activeRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

    return {
      total,
      activeCount,
      inactiveCount,
      lowStockCount,
      totalValuation,
      activeRate,
    };
  }, [items]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return items
      .filter((p) => {
        const active = isProductActive(p);
        const pCat = getCategoryName(p);
        const stock = p.stock || 0;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && active) ||
          (statusFilter === "inactive" && !active) ||
          (statusFilter === "low_stock" && stock <= 5);

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
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "stock_asc") return (a.stock || 0) - (b.stock || 0);
        if (sortBy === "stock_desc") return (b.stock || 0) - (a.stock || 0);
        if (sortBy === "name_asc") return (a.title || "").localeCompare(b.title || "");
        // newest default
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [items, statusFilter, categoryFilter, search, sortBy]);

  // Paginated Slicing
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const allSelected =
    filteredProducts.length > 0 && selectedIds.length === filteredProducts.length;

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-full">
      
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

      {/* Top Header Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                Catalog Governance & Inventory
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
              Product Inventory
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-2xl">
              Live multi-vendor catalog moderation, inventory health tracking, stock velocity, and pricing controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-text shadow-xs hover:border-primary hover:text-primary transition-all cursor-pointer"
              title="Export filtered catalog to CSV"
            >
              <FiDownload size={13} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-text shadow-xs hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-50"
              title="Refresh catalog list"
            >
              <FiRefreshCw className={loading ? "animate-spin text-primary" : ""} size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Catalog */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FiLayers size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
              Total Products
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-text">{metrics.total}</span>
              <span className="text-[10px] font-semibold text-muted">items</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active / Live */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FiCheckCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
              Active Catalog
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.activeCount}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {metrics.activeRate}% live
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Low Stock / Stockouts */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FiAlertCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
              Stock Warnings
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                {metrics.lowStockCount}
              </span>
              <span className="text-[10px] font-semibold text-muted">≤ 5 units</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Inventory Value */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <span className="text-base font-black">৳</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
              Catalog Worth
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base sm:text-lg font-black text-text truncate">
                ৳{metrics.totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls Bar */}
      <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
            <input
              type="text"
              placeholder="Search product title, SKU, brand, category, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-background border border-border text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-muted-bg/50 rounded-xl border border-border/60">
            {[
              { key: "all", label: "All", count: items.length },
              {
                key: "active",
                label: "Active",
                count: metrics.activeCount,
              },
              {
                key: "inactive",
                label: "Inactive",
                count: metrics.inactiveCount,
              },
              {
                key: "low_stock",
                label: "Low Stock",
                count: metrics.lowStockCount,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-surface text-primary font-bold shadow-xs border border-border"
                    : "text-muted hover:text-text hover:bg-surface/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.key
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted/15 text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Second Row Filters: Category, Sort, View Mode, Per Page */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 text-xs rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">All Categories ({items.length})</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
                <option value="stock_desc">Stock: High to Low</option>
                <option value="name_asc">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* View Toggle & Items Per Page */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="text-muted font-medium">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-0.5 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center p-0.5 rounded-lg border border-border bg-background">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "table" ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-text"
                }`}
                title="Table View"
              >
                <FiList size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "grid" ? "bg-surface text-primary shadow-xs" : "text-muted hover:text-text"
                }`}
                title="Card Grid View"
              >
                <FiGrid size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-primary/10 border border-primary/30 rounded-2xl text-xs font-semibold backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-primary text-white font-bold text-[11px]">
                {selectedIds.length} Selected
              </span>
              <span className="text-text font-medium">
                Perform bulk action on selected items
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                <FiTrash2 size={13} /> Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text hover:bg-muted-bg transition-all cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Table View or Grid View */}
      {loading ? (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 w-full rounded-xl bg-muted-bg/50 animate-pulse flex items-center px-4 gap-4"
            >
              <div className="h-4 w-4 bg-muted/20 rounded" />
              <div className="h-10 w-10 bg-muted/20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 bg-muted/20 rounded" />
                <div className="h-2 w-28 bg-muted/20 rounded" />
              </div>
              <div className="h-4 w-20 bg-muted/20 rounded hidden md:block" />
              <div className="h-4 w-16 bg-muted/20 rounded" />
              <div className="h-6 w-16 bg-muted/20 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center shadow-xs">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-2xl text-primary">
            <FiPackage />
          </div>
          <h3 className="mt-4 text-base font-bold text-text">
            No Products Found
          </h3>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {items.length === 0
              ? "Your marketplace catalog is empty. Start adding your first product to see live metrics and inventory tracking."
              : "No catalog products matched your current search filters or category selections."}
          </p>
          {(search || statusFilter !== "all" || categoryFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW - 100% responsive, NO horizontal scrollbar */
        <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-border bg-muted-bg/40 text-[11px] font-extrabold uppercase tracking-wider text-muted">
                <th className="py-3.5 pl-3 pr-1 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
                  />
                </th>
                <th className="py-3.5 px-2 w-[40%] sm:w-[36%] md:w-[32%]">Product</th>
                <th className="py-3.5 px-2 hidden lg:table-cell w-[14%]">Store</th>
                <th className="py-3.5 px-2 w-[18%] sm:w-[15%] md:w-[13%]">Price</th>
                <th className="py-3.5 px-2 w-[18%] sm:w-[15%] md:w-[13%]">Stock</th>
                <th className="py-3.5 px-2 hidden xl:table-cell w-[10%]">Trend</th>
                <th className="py-3.5 px-2 w-[14%] sm:w-[12%] md:w-[11%]">Status</th>
                <th className="py-3.5 pl-1 pr-3 text-right w-[10%] sm:w-[12%] md:w-[11%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedProducts.map((p, idx) => {
                const pid = getProductId(p);
                const isSelected = selectedIds.includes(pid);
                const active = isProductActive(p);
                const sku = getSKU(p);
                const brand = getBrandName(p);
                const category = getCategoryName(p);
                const quantity = Number(p.stock || 0);
                const price = Number(p.price || 0);
                const isBusy = actionLoadingId === pid;
                const imageUrl =
                  p.images?.[0] ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=60";

                return (
                  <tr
                    key={pid}
                    className={`group transition-colors duration-150 ${
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "hover:bg-muted-bg/30"
                    }`}
                  >
                    {/* 1. Checkbox */}
                    <td className="py-3 pl-3 pr-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(pid)}
                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
                      />
                    </td>

                    {/* 2. Product Info (Thumbnail, Title, Category Badge, SKU) */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-muted-bg flex items-center justify-center">
                          {p.images?.[0] ? (
                            <Image
                              src={imageUrl}
                              alt={p.title || "Product"}
                              width={36}
                              height={36}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FiPackage className="text-muted text-sm" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => setInspectingProduct(p)}
                            className="text-left font-bold text-text hover:text-primary transition-colors truncate block w-full cursor-pointer leading-snug"
                            title={p.title}
                          >
                            {p.title || "Untitled Product"}
                          </button>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="inline-block px-1.5 py-0.2 rounded bg-muted-bg text-muted text-[9px] font-semibold uppercase truncate max-w-[65px]">
                              {category}
                            </span>
                            <span className="font-mono text-[9px] text-muted tracking-tight truncate max-w-[70px]">
                              {sku}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Brand */}
                    <td className="py-3 px-2 hidden lg:table-cell">
                      <span className="text-muted font-medium truncate block max-w-full text-[11px]" title={brand}>
                        {brand}
                      </span>
                    </td>

                    {/* 4. Price */}
                    <td className="py-3 px-2 font-bold text-text truncate">
                      ৳{price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>

                    {/* 5. Stock Status */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            quantity > 10
                              ? "bg-emerald-500"
                              : quantity > 0
                              ? "bg-amber-500"
                              : "bg-rose-500 animate-pulse"
                          }`}
                        />
                        <span
                          className={`font-bold text-[11px] truncate ${
                            quantity > 10
                              ? "text-text"
                              : quantity > 0
                              ? "text-amber-600 dark:text-amber-400 font-extrabold"
                              : "text-rose-600 dark:text-rose-400 font-extrabold"
                          }`}
                        >
                          {quantity === 0 ? "Out" : `${quantity} left`}
                        </span>
                      </div>
                    </td>

                    {/* 6. Velocity Trend (Ultra wide only) */}
                    <td className="py-3 px-2 hidden xl:table-cell">
                      <InventoryTrendChart seed={idx + 1} />
                    </td>

                    {/* 7. Status Toggle Pill */}
                    <td className="py-3 px-2">
                      <button
                        disabled={isBusy}
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                        } disabled:opacity-50`}
                        title={`Click to ${active ? "deactivate" : "activate"}`}
                      >
                        {active ? (
                          <>
                            <FiCheckCircle size={10} className="shrink-0 text-emerald-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle size={10} className="shrink-0 text-rose-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 8. Actions */}
                    <td className="py-3 pl-1 pr-3 text-right">
                      <div className="inline-flex items-center gap-0.5 justify-end">
                        {/* Quick Inspect Drawer */}
                        <button
                          onClick={() => setInspectingProduct(p)}
                          className="p-1 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Inspect product details"
                        >
                          <FiEye size={13} />
                        </button>

                        {/* Quick Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 rounded-lg text-muted hover:text-blue-600 hover:bg-blue-500/10 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <FiEdit2 size={13} />
                        </button>

                        {/* Frontend Store View */}
                        <Link
                          href={`/products/${pid}`}
                          target="_blank"
                          className="p-1 rounded-lg text-muted hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Open in store"
                        >
                          <FiExternalLink size={13} />
                        </Link>

                        {/* Delete */}
                        <button
                          disabled={isBusy}
                          onClick={() => handleDeleteProduct(pid, p.title)}
                          className="p-1 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-40"
                          title="Delete product"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((p) => {
            const pid = getProductId(p);
            const isSelected = selectedIds.includes(pid);
            const active = isProductActive(p);
            const sku = getSKU(p);
            const category = getCategoryName(p);
            const brand = getBrandName(p);
            const quantity = Number(p.stock || 0);
            const price = Number(p.price || 0);
            const isBusy = actionLoadingId === pid;
            const imageUrl =
              p.images?.[0] ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=60";

            return (
              <div
                key={pid}
                className={`rounded-2xl border bg-surface p-4 shadow-xs flex flex-col justify-between transition-all duration-200 ${
                  isSelected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Image + Overlay badges */}
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-muted-bg mb-3 border border-border/60">
                    <Image
                      src={imageUrl}
                      alt={p.title || "Product"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    
                    {/* Top Checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(pid)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Status Pill on Image */}
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={isBusy}
                      className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-xs border cursor-pointer ${
                        active
                          ? "bg-emerald-500/90 text-white border-emerald-400/30"
                          : "bg-rose-500/90 text-white border-rose-400/30"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </button>

                    {/* Category tag bottom left */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                      {category}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="font-mono">{sku}</span>
                      <span className="truncate max-w-[110px]">{brand}</span>
                    </div>

                    <h3
                      onClick={() => setInspectingProduct(p)}
                      className="font-bold text-sm text-text hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                      title={p.title}
                    >
                      {p.title || "Untitled Product"}
                    </h3>

                    <div className="pt-2 flex items-baseline justify-between">
                      <span className="text-base font-black text-text">
                        ৳{price.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          quantity > 10
                            ? "text-emerald-600 dark:text-emerald-400"
                            : quantity > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {quantity === 0 ? "Out of Stock" : `${quantity} in stock`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-muted-bg hover:bg-primary/10 hover:text-primary text-text text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FiEdit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setInspectingProduct(p)}
                    className="p-2 rounded-xl border border-border text-muted hover:text-text hover:bg-muted-bg transition cursor-pointer"
                    title="View Details"
                  >
                    <FiEye size={13} />
                  </button>

                  <Link
                    href={`/products/${pid}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-border text-muted hover:text-primary hover:bg-muted-bg transition cursor-pointer"
                    title="View in Store"
                  >
                    <FiExternalLink size={13} />
                  </Link>

                  <button
                    disabled={isBusy}
                    onClick={() => handleDeleteProduct(pid, p.title)}
                    className="p-2 rounded-xl border border-border text-muted hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-40"
                    title="Delete Product"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-muted">
          <div>
            Showing{" "}
            <span className="font-bold text-text">
              {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-text">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-text">
              {filteredProducts.length}
            </span>{" "}
            products
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-xl border border-border bg-surface text-text hover:border-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-muted">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                        currentPage === page
                          ? "bg-primary text-white shadow-xs"
                          : "border border-border bg-surface text-text hover:border-primary"
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
              className="p-2 rounded-xl border border-border bg-surface text-text hover:border-primary cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-black text-text">
                    Edit Product Catalog Item
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {getSKU(editingProduct)} • ID: {getProductId(editingProduct)}
                  </p>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-lg text-muted hover:text-text cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-text mb-1">
                      Regular Price (৳)
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text mb-1">
                      Discount Price (৳)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={editFormData.discountPrice}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          discountPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-text mb-1">
                      Available Stock Units
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-text mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Moderation Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value="active">Active / Approved</option>
                    <option value="inactive">Inactive / Moderation</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 rounded-xl font-bold text-muted hover:bg-muted-bg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingEdit ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Inspector Modal */}
      <AnimatePresence>
        {inspectingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-border bg-muted-bg">
                    {inspectingProduct.images?.[0] ? (
                      <Image
                        src={inspectingProduct.images[0]}
                        alt={inspectingProduct.title || "Product"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <FiPackage className="m-auto text-xl text-muted" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-text leading-snug">
                      {inspectingProduct.title}
                    </h2>
                    <p className="text-xs text-muted mt-0.5 font-mono">
                      {getSKU(inspectingProduct)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingProduct(null)}
                  className="p-1.5 rounded-lg text-muted hover:text-text cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted-bg/50 border border-border/50">
                    <span className="text-muted block text-[10px] font-bold uppercase">Price</span>
                    <span className="text-sm font-black text-text mt-0.5 block">
                      ৳{(inspectingProduct.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted-bg/50 border border-border/50">
                    <span className="text-muted block text-[10px] font-bold uppercase">Stock</span>
                    <span className="text-sm font-black text-text mt-0.5 block">
                      {inspectingProduct.stock || 0} units
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted-bg/50 border border-border/50">
                    <span className="text-muted block text-[10px] font-bold uppercase">Status</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block capitalize">
                      {isProductActive(inspectingProduct) ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-text block">Description</span>
                  <p className="text-muted leading-relaxed bg-background p-3 rounded-xl border border-border">
                    {inspectingProduct.description || "No description provided for this catalog product."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-muted text-[10px] font-bold uppercase block">Category</span>
                    <span className="font-bold text-text mt-0.5 block">
                      {getCategoryName(inspectingProduct)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <span className="text-muted text-[10px] font-bold uppercase block">Brand / Store</span>
                    <span className="font-bold text-text mt-0.5 block">
                      {getBrandName(inspectingProduct)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Link
                    href={`/products/${getProductId(inspectingProduct)}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                  >
                    <span>View Customer Page</span>
                    <FiExternalLink size={12} />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const p = inspectingProduct;
                        setInspectingProduct(null);
                        handleOpenEdit(p);
                      }}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition"
                    >
                      Edit Product
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
