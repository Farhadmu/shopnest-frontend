"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import type { CategoryNode } from "@/lib/utils/category-tree";
import type { CategoryItem } from "@/types/category";
import { idOf } from "@/lib/utils/category-tree";

interface CategoryTreeItemProps {
  node: CategoryNode;
  depth?: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onAddSub: (category: CategoryItem) => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
  deletingId: string | null;
  searchQuery: string;
}

export function CategoryTreeItem({
  node,
  depth = 0,
  expandedIds,
  onToggleExpand,
  onAddSub,
  onEdit,
  onDelete,
  deletingId,
  searchQuery,
}: CategoryTreeItemProps) {
  const [imageError, setImageError] = useState(false);
  const nodeId = idOf(node);
  const isExpanded = expandedIds.has(nodeId);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isDeleting = deletingId === nodeId;

  // Highlight search matches
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-primary/20 text-primary font-bold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleRowClick = () => {
    if (hasChildren) {
      onToggleExpand(nodeId);
    }
  };

  const hasImage = Boolean(node.image) && !imageError;

  return (
    <div className="w-full select-none">
      {/* Category Row - Whole row is clickable to expand/collapse if it has sub-categories */}
      <div
        onClick={handleRowClick}
        className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all duration-200 ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        } ${
          depth === 0
            ? "bg-surface border-border shadow-xs hover:border-primary/50 hover:shadow-md"
            : "bg-surface/60 border-border/70 hover:bg-surface hover:border-primary/40"
        } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
        style={{
          marginLeft: depth > 0 ? `${Math.min(depth * 24, 96)}px` : undefined,
        }}
      >
        {/* Left: Expand toggle, image/icon, name, slug, child count */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Expand/Collapse Chevron or Indicator */}
          {hasChildren ? (
            <div
              className="p-1 rounded-lg text-muted group-hover:text-primary transition-colors cursor-pointer"
              title={isExpanded ? "Collapse sub-categories" : "Expand sub-categories"}
            >
              <ChevronRight
                className={`h-4 w-4 transform transition-transform duration-200 text-primary ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </div>
          ) : (
            <div className="w-6 shrink-0 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
            </div>
          )}

          {/* Icon or Thumbnail */}
          <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-border bg-background flex items-center justify-center shadow-xs group-hover:border-primary/30 transition-colors">
            {hasImage ? (
              <Image
                src={node.image!}
                alt={node.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-sm">
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen className="h-5 w-5" />
                  ) : (
                    <Folder className="h-5 w-5" />
                  )
                ) : (
                  node.name.charAt(0).toUpperCase()
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-text truncate group-hover:text-primary transition-colors">
                {highlightMatch(node.name)}
              </span>

              {/* Child count badge */}
              {hasChildren && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  <Layers className="h-3 w-3" />
                  {node.children.length} {node.children.length === 1 ? "sub" : "subs"}
                </span>
              )}

              {depth > 0 && (
                <span className="text-[10px] font-medium text-muted bg-muted-bg px-1.5 py-0.5 rounded-md">
                  Level {depth + 1}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted font-mono truncate max-w-[200px] sm:max-w-xs">
                <LinkIcon className="h-3 w-3 opacity-60 shrink-0" />
                {highlightMatch(node.slug)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions (clicks stopped from propagating to row) */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Contextual Add Sub-Category Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddSub(node);
            }}
            className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-semibold transition shadow-xs"
            title={`Add a new sub-category inside "${node.name}"`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Sub</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="cursor-pointer p-2 rounded-xl text-muted hover:text-text hover:bg-muted-bg border border-transparent hover:border-border transition-colors"
            title="Edit Category"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            disabled={isDeleting}
            className="cursor-pointer p-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Category"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Nested Children Tree */}
      {hasChildren && isExpanded && (
        <div className="relative mt-2 space-y-2 pl-3 sm:pl-4 border-l-2 border-primary/20 ml-3 sm:ml-4">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={idOf(child)}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onAddSub={onAddSub}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingId={deletingId}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
