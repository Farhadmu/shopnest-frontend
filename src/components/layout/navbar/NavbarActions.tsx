"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface NavbarActionsProps {
  isAuthenticated: boolean;
  cartCount: number;
  wishlistCount?: number;
  onOpenCart: () => void;
  /** Slot: user menu or auth buttons, passed from parent to allow server/client composition */
  userSlot: React.ReactNode;
  /** Slot: mobile hamburger button */
  mobileToggle: React.ReactNode;
}

export function NavbarActions({
  isAuthenticated,
  cartCount,
  wishlistCount = 0,
  onOpenCart,
  userSlot,
  mobileToggle,
}: NavbarActionsProps) {
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    const handleBump = () => {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 450);
    };

    window.addEventListener("cart_icon_bump", handleBump);
    return () => window.removeEventListener("cart_icon_bump", handleBump);
  }, []);

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <Link
        href="/wishlist"
        aria-label={`Wishlist (${wishlistCount} items)`}
        title="Wishlist"
        className="relative hidden h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 lg:grid active:scale-95"
      >
        <FaHeart size={13} className="text-white" />
        {wishlistCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        )}
      </Link>

      <motion.button
        type="button"
        id="navbar-cart-btn"
        onClick={onOpenCart}
        animate={isBumping ? { scale: [1, 1.32, 0.88, 1.15, 0.98, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        aria-label={`Shopping Cart (${cartCount} items)`}
        title="Shopping Cart"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 cursor-pointer active:scale-95"
      >
        {/* Radiant impact shockwave when thumbnail lands */}
        {isBumping && (
          <span className="pointer-events-none absolute -inset-1.5 rounded-full border-2 border-rose-400 bg-rose-500/25 animate-ping opacity-80" />
        )}
        <FaCartPlus size={13} />
        {cartCount > 0 && (
          <motion.span
            animate={isBumping ? { scale: [1, 1.45, 0.9, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-md ring-1 ring-white/50"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </motion.span>
        )}
      </motion.button>

      <NotificationBell />
      <ThemeToggle compact />

      {userSlot}
      {mobileToggle}
    </div>
  );
}
