"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import type { NavItem, UserRole } from "./NavbarLinks";
import { mainNavItems } from "./NavbarLinks";
import { useWishlist } from "@/context/WishlistContext";

interface NavbarMobileMenuProps {
  open: boolean;
  isAuthenticated: boolean;
  user?: { name?: string; email?: string };
  role: UserRole;
  dashboardHref: string;
  onClose: () => void;
  onSignOut: () => void;
  /** Slot for MobileCategoryMenu server component */
  categoryMenuSlot?: React.ReactNode;
  /** Slot for role badge */
  roleBadge?: React.ReactNode;
  wishlistCount?: number;
}

export function NavbarMobileMenu({
  open,
  isAuthenticated,
  user,
  role,
  dashboardHref,
  onClose,
  onSignOut,
  categoryMenuSlot,
  roleBadge,
  wishlistCount: propWishlistCount,
}: NavbarMobileMenuProps) {
  const pathname = usePathname();
  const wishlistCtx = useWishlist();
  const wishlistCount = propWishlistCount !== undefined ? propWishlistCount : (wishlistCtx?.itemCount ?? 0);
  const navLinks = (isAuthenticated ? mainNavItems[role] : mainNavItems.guest) || mainNavItems.guest;

  if (!open) return null;

  return (
    <div className="border-t border-white/15 py-3 lg:hidden">
      <div className="grid gap-1">
        {/* Authenticated user info card */}
        {isAuthenticated && (
          <div className="mb-2 rounded-xl bg-white/15 p-3 text-white border border-white/20 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{user?.name}</p>
              {roleBadge}
            </div>
            <p className="text-xs text-white/80">{user?.email}</p>
          </div>
        )}

        {/* Nav links */}
        {navLinks.map((item: NavItem) => {
          const isAiAdvisor = item.label === "AI Advisor";
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          if (isAiAdvisor) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition my-1 ${
                  active
                    ? "border-white/60 bg-white/25 text-white shadow-xs"
                    : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300/80" />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                active ? "bg-white/25 text-white font-bold" : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Wishlist Link for Mobile */}
        <Link
          href="/wishlist"
          onClick={onClose}
          className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            pathname === "/wishlist" ? "bg-white/25 text-white font-bold" : "text-white/90 hover:bg-white/15 hover:text-white"
          }`}
        >
          <span>Saved Wishlist</span>
          {wishlistCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-black text-white shadow-xs">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href={dashboardHref}
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15"
            >
              Open Dashboard
            </Link>
            {role === "customer" && (
              <Link
                href="/become-seller"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-amber-200 hover:bg-white/15 flex items-center justify-between"
              >
                <span>🏪 Become a Seller / Status</span>
                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                  Track
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => { onClose(); onSignOut(); }}
              className="mt-2 rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2.5 text-left text-sm font-bold text-rose-200 hover:bg-rose-500/30 cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/15"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="mt-1 rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-violet-700 shadow-sm"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
