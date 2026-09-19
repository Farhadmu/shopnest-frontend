"use client";

import React from "react";
import Link from "next/link";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  cartCount: number;
  onOpenCart: () => void;
  /** Slot: user menu or auth buttons, passed from parent to allow server/client composition */
  userSlot: React.ReactNode;
  /** Slot: mobile hamburger button */
  mobileToggle: React.ReactNode;
}

export function NavbarActions({
  isAuthenticated,
  cartCount,
  onOpenCart,
  userSlot,
  mobileToggle,
}: NavbarActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        title="Wishlist"
        className="hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 lg:grid active:scale-95"
      >
        <FaHeart size={13} />
      </Link>

      <button
        type="button"
        id="navbar-cart-btn"
        onClick={onOpenCart}
        aria-label={`Shopping Cart (${cartCount} items)`}
        title="Shopping Cart"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 cursor-pointer active:scale-95"
      >
        <FaCartPlus size={13} />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in">
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
