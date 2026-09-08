import React from "react";
import Link from "next/link";

export interface SidebarBrandProps {
  /** e.g. "Seller", "Administrator", "Customer" */
  role: string;
  /** Called when the brand link navigates away (e.g. to close a mobile drawer). */
  onNavigate?: () => void;
}

/**
 * Reusable brand header shown at the top of the dashboard sidebar
 * (desktop fixed rail and the mobile slide-in drawer both use this).
 * The whole block links back to the storefront home page.
 */
export function SidebarBrand({ role, onNavigate }: SidebarBrandProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      title="Go to Home"
      className="flex h-16 items-center gap-2.5 border-b border-border px-4 transition hover:bg-muted-bg/60"
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-black text-white">
        S
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-black text-text">ShopNest</p>
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
          {role} Hub
        </p>
      </div>
    </Link>
  );
}
