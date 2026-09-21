"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  FolderPlus,
  Layers,
  Sparkles,
  AlertTriangle,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import type { CategoryItem } from "@/types/category";
import { buildCategoryTree, CategoryNode, idOf } from "@/lib/utils/category-tree";
import { CategoryTreeItem } from "./CategoryTreeItem";
import { CategoryDrawer } from "./CategoryDrawer";
import { clientMutation } from "@/lib/core/client";
import { ApiError } from "@/lib/core/errors";

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "root_only" | "has_subs">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Drawer Modal State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [initialParentId, setInitialParentId] = useState<string | null>(null);

  // Deletion State
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Build root trees
  const fullTree = useMemo(() => buildCategoryTree(initialCategories), [initialCategories]);

  // Compute metrics
  const stats = useMemo(() => {
    const total = initialCategories.length;
    const roots = initialCategories.filter((c) => !c.parent).length;
    const subs = total - roots;
    const withImage = initialCategories.filter((c) => Boolean(c.image)).length;
    return { total, roots, subs, withImage };
  }, [initialCategories]);

  // Recursively search and filter tree nodes
  const { filteredTree, matchingIds } = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const matched = new Set<string>();

    function matchesQuery(c: CategoryItem): boolean {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    }

    function filterNode(node: CategoryNode): CategoryNode | null {
      const isDirectMatch = matchesQuery(node);
      const filteredChildren: CategoryNode[] = [];

      for (const child of node.children) {
        const matchingChild = filterNode(child);
        if (matchingChild) {
          filteredChildren.push(matchingChild);
        }
      }

      if (isDirectMatch || filteredChildren.length > 0) {
        matched.add(idOf(node));
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    }

    let treeToUse = fullTree;

    if (filterMode === "root_only") {
      treeToUse = fullTree.map((node) => ({ ...node, children: [] }));
    } else if (filterMode === "has_subs") {
      treeToUse = fullTree.filter((node) => node.children && node.children.length > 0);
    }

    if (!q) {
      return { filteredTree: treeToUse, matchingIds: new Set<string>() };
    }

    const filtered: CategoryNode[] = [];
    for (const root of treeToUse) {
      const res = filterNode(root);
      if (res) filtered.push(res);
    }

    return { filteredTree: filtered, matchingIds: matched };
  }, [fullTree, searchQuery, filterMode]);

  // Auto-expand nodes that match search queries
  useEffect(() => {
    if (searchQuery.trim() && matchingIds.size > 0) {
      setExpandedIds(new Set(matchingIds));
    }
  }, [searchQuery, matchingIds]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>(initialCategories.map(idOf));
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const refreshData = () => {
    router.refresh();
  };

  // Open Drawer Handlers
  const handleOpenAddRoot = () => {
    setDrawerMode("create");
    setSelectedCategory(null);
    setInitialParentId(null);
    setDrawerOpen(true);
  };

  const handleOpenAddSub = (parentCategory: CategoryItem) => {
    setDrawerMode("create");
    setSelectedCategory(null);
    setInitialParentId(idOf(parentCategory));
    setDrawerOpen(true);
    // Also ensure parent is expanded so user sees where it will be added
    setExpandedIds((prev) => new Set(prev).add(idOf(parentCategory)));
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setDrawerMode("edit");
    setSelectedCategory(category);
    setInitialParentId(null);
    setDrawerOpen(true);
  };

  // Delete Category Handlers
  const confirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setActionError(null);

    const targetId = idOf(deletingCategory);
    try {
      await clientMutation(`/categories/${targetId}`, "DELETE");
      setDeletingCategory(null);
      refreshData();
    } catch (err) {
      const msg =
        err instanceof ApiError || err instanceof Error ? err.message : "Failed to delete category.";
      setActionError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Categories</span>
            <FolderTree className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">{stats.total}</p>
          <p className="mt-1 text-[11px] text-muted">Active across store</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Root Categories</span>
            <FolderPlus className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">{stats.roots}</p>
          <p className="mt-1 text-[11px] text-muted">Top-level navigation</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Sub-Categories</span>
            <Layers className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">{stats.subs}</p>
          <p className="mt-1 text-[11px] text-muted">Nested child layers</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">With Image</span>
            <ImageIcon className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-text">{stats.withImage}</p>
          <p className="mt-1 text-[11px] text-muted">
            {stats.total > 0 ? `${Math.round((stats.withImage / stats.total) * 100)}% coverage` : "0%"}
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Expand/Collapse, Add Root CTA */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search & Filter */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name or slug..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-text px-1.5 py-0.5 rounded-md hover:bg-muted-bg transition"
              >
                Clear
              </button>
            )}
          </div>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as typeof filterMode)}
            className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold text-text focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
          >
            <option value="all">All Categories</option>
            <option value="root_only">Root Categories Only</option>
            <option value="has_subs">Has Sub-categories</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-muted-bg transition active:scale-98"
            title="Expand all branches"
          >
            <ChevronsDown className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Expand All</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="cursor-pointer flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-muted-bg transition active:scale-98"
            title="Collapse all branches"
          >
            <ChevronsUp className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Collapse All</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddRoot}
            className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover active:scale-98 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Tree View Container */}
      <div className="space-y-3">
        {filteredTree.length > 0 ? (
          filteredTree.map((rootNode) => (
            <CategoryTreeItem
              key={idOf(rootNode)}
              node={rootNode}
              depth={0}
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              onAddSub={handleOpenAddSub}
              onEdit={handleOpenEdit}
              onDelete={setDeletingCategory}
              deletingId={deletingCategory ? idOf(deletingCategory) : null}
              searchQuery={searchQuery}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
            <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
              <FolderTree className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-text">No categories found</h3>
            <p className="mt-1 text-xs text-muted max-w-sm">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different search term or clear the filter.`
                : "Your catalog currently has no categories. Click below to add your first one."}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-muted-bg transition"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear search filter
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddRoot}
                className="cursor-pointer mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-primary-hover transition"
              >
                <Plus className="h-4 w-4" /> Add Root Category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add & Edit */}
      <CategoryDrawer
        isOpen={drawerOpen}
        mode={drawerMode}
        category={selectedCategory}
        initialParentId={initialParentId}
        categories={initialCategories}
        onClose={() => setDrawerOpen(false)}
        onSuccess={refreshData}
      />

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Delete Category</h3>
                <p className="text-xs text-muted">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-text">
              Are you sure you want to delete <strong className="text-primary font-bold">{deletingCategory.name}</strong>?
            </p>

            {actionError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingCategory(null);
                  setActionError(null);
                }}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-muted-bg transition disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}