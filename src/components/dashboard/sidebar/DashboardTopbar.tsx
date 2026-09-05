import React, { ReactNode } from "react";
import Link from "next/link";
import { FaBars, FaTimes, FaBell, FaSearch, FaHome } from "react-icons/fa";

export interface DashboardTopbarProps {
  role: string;
  roleIcon: ReactNode;
  userName: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

/**
 * Reusable sticky top bar shown above the dashboard content column
 * (to the right of the fixed sidebar). Holds the mobile menu toggle,
 * a quick-search box, notification bell, and the current user chip.
 */
export function DashboardTopbar({
  role,
  roleIcon,
  userName,
  mobileMenuOpen,
  onToggleMobileMenu,
}: DashboardTopbarProps) {
  const userInitial = (userName?.[0] || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text lg:hidden"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
      </button>

      <Link
        href="/"
        title="Go to Home"
        aria-label="Go to Home"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text transition hover:border-primary hover:text-primary"
      >
        <FaHome size={14} />
      </Link>

      <div className="hidden items-center gap-2 rounded-lg bg-muted-bg px-2.5 py-1.5 text-xs font-bold text-muted sm:flex">
        <span className="text-primary">{roleIcon}</span>
        <span>{role} Dashboard</span>
      </div>

      <div className="relative hidden max-w-xs flex-1 md:flex">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted" />
        <input
          type="text"
          placeholder="Quick search..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-xs text-text outline-none transition focus:border-primary"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-muted-bg hover:text-text"
          aria-label="Notifications"
        >
          <FaBell size={14} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-black text-white">
            {userInitial}
          </div>
          <span className="text-xs font-bold text-text">{userName}</span>
        </div>
      </div>
    </header>
  );
}
