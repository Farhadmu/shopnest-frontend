"use client";

import { useMemo, useRef, useState } from "react";
import { FaChevronDown, FaLayerGroup, FaSearch, FaTimes, FaCheck } from "react-icons/fa";
import { idOf, type CategoryNode } from "@/lib/utils/category-tree";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { CategoryRow } from "./CategoryRow";

function nodeMatches(node: CategoryNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  return node.children.some((child) => nodeMatches(child, query));
}

interface CategoryPickerViewProps {
  tree: CategoryNode[];
  selected: string;
  onSelect: (name: string) => void;
}

export function CategoryPickerView({ tree, selected, onSelect }: CategoryPickerViewProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, () => setOpen(false));

  const filteredTree = useMemo(() => {
    if (!query) return tree;
    const q = query.toLowerCase();
    return tree.filter((root) => nodeMatches(root, q));
  }, [tree, query]);

  const pick = (name: string) => {
    onSelect(name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-background px-4 py-3 text-left text-xs font-bold text-text outline-none transition-all hover:border-primary/50 focus:border-primary shadow-sm"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FaLayerGroup size={11} className="shrink-0 text-primary" />
          <span className="truncate">{selected || "All Categories"}</span>
        </span>
        <FaChevronDown size={11} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-65 max-w-[320px] rounded-2xl border border-border bg-surface p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2">
            <FaSearch size={11} className="shrink-0 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-transparent text-xs text-text outline-none placeholder:text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 text-muted hover:text-text"
                aria-label="Clear search"
              >
                <FaTimes size={11} />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => pick("")}
              className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black transition ${
                !selected ? "bg-primary/10 text-primary" : "text-text hover:bg-muted-bg"
              }`}
            >
              <span>All Categories</span>
              {!selected && <FaCheck size={10} className="text-primary shrink-0" />}
            </button>

            {filteredTree.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs font-semibold text-muted">No categories match.</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {filteredTree.map((root) => (
                  <CategoryRow
                    key={idOf(root)}
                    node={root}
                    depth={0}
                    selected={selected}
                    query={query}
                    onSelect={pick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}