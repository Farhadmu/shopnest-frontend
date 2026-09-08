"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDashboardLinkActive } from "@/lib/utils/nav";
import type { DashboardLink } from "@/components/dashboard/DashboardUI";

export interface SidebarNavListProps {
  links: DashboardLink[];
  /** Called after a link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

/**
 * Reusable scrollable nav list for the dashboard sidebar. Renders icon +
 * label rows with an active-state highlight. Used by both the desktop
 * fixed rail and the mobile drawer in DashboardSidebarLayout.
 */
export function SidebarNavList({ links, onNavigate }: SidebarNavListProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5 custom-scrollbar">
      {links.map((item) => {
        const isActive = isDashboardLinkActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-muted-bg hover:text-text"
            }`}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px] transition-colors ${
                isActive ? "bg-primary text-white" : "bg-muted-bg text-muted group-hover:text-text"
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
