"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { idOf, type CategoryNode } from "@/lib/utils/category-tree";

interface MobileCategoryRowProps {
  node: CategoryNode;
  onClose?: () => void;
}

export function MobileCategoryRow({ node, onClose }: MobileCategoryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  const handleNavigate = () => {
    onClose?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("close_mobile_menu"));
    }
  };

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <div className="flex items-center">
        <Link
          href={`/products?category=${encodeURIComponent(node.name)}`}
          onClick={handleNavigate}
          className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-text hover:bg-primary/10 hover:text-primary transition"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse subcategories" : "Expand subcategories"}
            aria-expanded={expanded}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-muted-bg hover:text-text cursor-pointer"
          >
            <FaChevronDown
              size={11}
              className={`transition-transform duration-200 ${expanded ? "rotate-180 text-primary" : ""}`}
            />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mb-1 ml-3 flex flex-col gap-0.5 border-l-2 border-primary/20 pl-2">
          {node.children.map((child) => (
            <Link
              key={idOf(child)}
              href={`/products?category=${encodeURIComponent(child.name)}`}
              onClick={handleNavigate}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-primary/10 hover:text-primary transition"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}