"use client";

import { useState } from "react";
import { FaChevronDown, FaCheck} from "react-icons/fa";
import { idOf, type CategoryNode } from "@/lib/utils/category-tree";

function nodeMatches(node: CategoryNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  return node.children.some((child) => nodeMatches(child, query));
}

function hasSelectedChild(node: CategoryNode, selected: string): boolean {
  if (!selected) return false;
  const selLower = selected.toLowerCase();
  return node.children.some(
    (child) => child.name.toLowerCase() === selLower || hasSelectedChild(child, selected)
  );
}

interface CategoryRowProps {
  node: CategoryNode;
  depth: number;
  selected: string;
  query: string;
  onSelect: (name: string) => void;
}

export function CategoryRow({ node, depth, selected, query, onSelect }: CategoryRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [clickExpanded, setClickExpanded] = useState(false);

  const hasChildren = node.children.length > 0;
  const isSelected = selected.toLowerCase() === node.name.toLowerCase();
  const containsSelected = hasSelectedChild(node, selected);

  // Auto show children if hovering, clicked, searching, or if a child is selected
  const showChildren = hasChildren && (isHovered || clickExpanded || query.length > 0 || containsSelected);

  if (query && !nodeMatches(node, query.toLowerCase())) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/row"
    >
      <div
        className={`flex items-center gap-1 rounded-xl transition-all duration-200 ${
          isSelected
            ? "bg-primary/10 text-primary font-bold shadow-xs"
            : isHovered
            ? "bg-primary/5 text-primary"
            : "hover:bg-muted-bg text-text font-semibold"
        }`}
        style={{ paddingLeft: depth * 14 }}
      >
        <button
          type="button"
          onClick={() => onSelect(node.name)}
          className="flex-1 truncate px-3 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between"
        >
          <span className="truncate">{node.name}</span>
          {isSelected && <FaCheck size={10} className="text-primary shrink-0 ml-1" />}
        </button>

        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setClickExpanded((v) => !v);
            }}
            aria-label={showChildren ? "Collapse subcategories" : "Expand subcategories"}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-muted-bg hover:text-text transition-colors"
          >
            <FaChevronDown
              size={10}
              className={`transition-transform duration-200 ${showChildren ? "rotate-180 text-primary" : ""}`}
            />
          </button>
        ) : (
          !isSelected && <span className="w-8 shrink-0" />
        )}
      </div>

      {/* Subcategories Indented List */}
      {hasChildren && showChildren && (
        <div className="flex flex-col gap-0.5 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {node.children.map((child) => (
            <CategoryRow
              key={idOf(child)}
              node={child}
              depth={depth + 1}
              selected={selected}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}