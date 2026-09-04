"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FaHeart, FaShoppingBag } from "react-icons/fa";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  dashboardHref: string;
  cartCount: number;
  onOpenCart: () => void;
  /** Slot: user menu or auth buttons, passed from parent to allow server/client composition */
  userSlot: React.ReactNode;
  /** Slot: mobile hamburger button */
  mobileToggle: React.ReactNode;
}

export function NavbarActions({
  isAuthenticated,
  dashboardHref,
  cartCount,
  onOpenCart,
  userSlot,
  mobileToggle,
}: NavbarActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {isAuthenticated && (
        <Link
          href={dashboardHref}
          className="hidden h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary md:flex"
        >
          Dashboard
        </Link>
      )}

      <Link
        href="/wishlist"
        aria-label="Wishlist"
        title="Wishlist"
        className="hidden h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary sm:grid"
      >
        <FaHeart size={14} />
      </Link>

      <button
        type="button"
        id="navbar-cart-btn"
        onClick={onOpenCart}
        aria-label={`Shopping Cart (${cartCount} items)`}
        title="Shopping Cart"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary cursor-pointer active:scale-95"
      >
        <FaShoppingBag size={14} />
        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[11px] font-black text-white shadow-sm shadow-purple-500/25 animate-in zoom-in">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>

      <NotificationBell />
      <ThemeToggle compact />

      {userSlot}
      {mobileToggle}
    </div>
  );
}
