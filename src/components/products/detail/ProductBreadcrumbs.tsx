import React from "react";
import Link from "next/link";
import { FiHome, FiChevronRight } from "react-icons/fi";

export interface ProductBreadcrumbsProps {
  category: string;
  title: string;
}

export function ProductBreadcrumbs({ category, title }: ProductBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-muted">
      <Link href="/" className="flex items-center gap-1 hover:text-primary">
        <FiHome size={13} /> Home
      </Link>
      <FiChevronRight size={12} />
      <Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-primary">
        {category || "Products"}
      </Link>
      <FiChevronRight size={12} />
      <span className="max-w-xs truncate text-text">{title}</span>
    </nav>
  );
}