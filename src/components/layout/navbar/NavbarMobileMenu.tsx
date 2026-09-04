"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, UserRole } from "./NavbarLinks";
import { mainNavItems } from "./NavbarLinks";

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
}: NavbarMobileMenuProps) {
  const pathname = usePathname();
  const navLinks = isAuthenticated ? mainNavItems[role] : mainNavItems.guest;

  if (!open) return null;

  return (
    <div className="border-t border-border py-3 xl:hidden">
      <div className="grid gap-1">
        {/* Server-rendered category accordion */}
        {categoryMenuSlot}

        {/* Authenticated user info card */}
        {isAuthenticated && (
          <div className="mb-2 rounded-xl bg-muted-bg p-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-text">{user?.name}</p>
              {roleBadge}
            </div>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        )}

        {/* Nav links */}
        {navLinks.map((item: NavItem) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                active ? "bg-primary/10 text-primary" : "text-text hover:bg-muted-bg"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {isAuthenticated ? (
          <>
            <Link
              href={dashboardHref}
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted-bg"
            >
              Open Dashboard
            </Link>
            <button
              type="button"
              onClick={() => { onClose(); onSignOut(); }}
              className="mt-2 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-left text-sm font-bold text-error"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted-bg"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="mt-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
