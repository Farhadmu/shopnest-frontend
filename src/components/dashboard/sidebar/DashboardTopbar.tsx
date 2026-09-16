import Image from "next/image";
import React, { ReactNode } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { NotificationBell } from "@/components/layout/NotificationBell";

export interface DashboardTopbarProps {
  role: string;
  roleIcon: ReactNode;
  userName: string;
  userImage: string;
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
  userImage,
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
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <div className="hidden items-center gap-2 sm:flex">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-black text-white">
              {userInitial}
            </div>
          )}
          <span className="text-xs font-bold text-text">{userName}</span>
        </div>
      </div>
    </header>
  );
}
