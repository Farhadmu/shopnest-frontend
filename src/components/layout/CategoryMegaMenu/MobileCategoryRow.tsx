"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { idOf, type CategoryNode } from "@/lib/utils/category-tree";

interface MobileCategoryRowProps {
  node: CategoryNode;
}

export function MobileCategoryRow({ node }: MobileCategoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="flex items-center">
        <Link
          href={`/products?category=${encodeURIComponent(node.name)}`}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted-bg"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse subcategories" : "Expand subcategories"}
            aria-expanded={expanded}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-muted-bg"
          >
            <FaChevronDown
              size={11}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2">
          {node.children.map((child) => (
            <Link
              key={idOf(child)}
              href={`/products?category=${encodeURIComponent(child.name)}`}
              className="rounded-lg px-3 py-2 text-xs font-medium text-muted hover:bg-muted-bg hover:text-text"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}