"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  FaBars,
  FaTimes,
  FaArrowRight,
  FaSignOutAlt,
  FaStore,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";
import { useSession, signOut } from "@/lib/auth-client";
import {
  userDashboardLinks,
  sellerDashboardLinks,
  adminDashboardLinks,
} from "@/lib/constants/dashboard-nav";
import type { DashboardLink } from "@/components/dashboard/DashboardUI";

interface DashboardSidebarLayoutProps {
  role?: string;
  links?: DashboardLink[];
  children: ReactNode;
}

export function DashboardSidebarLayout({
  role: initialRole,
  links: initialLinks,
  children,
}: DashboardSidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { data: session } = useSession();

  // Determine role & navigation links based on props or current path
  let role = initialRole || "Customer";
  let links = initialLinks || userDashboardLinks;

  if (!initialRole || !initialLinks) {
    if (pathname.startsWith("/dashboard/seller")) {
      role = "Seller";
      links = sellerDashboardLinks;
    } else if (pathname.startsWith("/dashboard/admin")) {
      role = "Administrator";
      links = adminDashboardLinks;
    } else if (pathname.startsWith("/dashboard/user")) {
      role = "Customer";
      links = userDashboardLinks;
    }
  }

  const roleIcon =
    role.toLowerCase().includes("admin") ? (
      <FaShieldAlt className="text-primary" />
    ) : role.toLowerCase().includes("seller") ? (
      <FaStore className="text-primary" />
    ) : (
      <FaUser className="text-primary" />
    );

  const userName = session?.user?.name || "Member";
  const userEmail = session?.user?.email || "";
  const userAvatarInitial = (userName?.[0] || "U").toUpperCase();

  const isLinkActive = (itemHref: string) => {
    if (itemHref === "#" || !itemHref) return false;
    if (pathname === itemHref) return true;
    // Highlight parent item if in sub-page (e.g. /dashboard/seller/products/add matches /dashboard/seller/products)
    if (
      itemHref !== "/dashboard/user" &&
      itemHref !== "/dashboard/seller" &&
      itemHref !== "/dashboard/admin" &&
      pathname.startsWith(itemHref)
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-[calc(100vh-9rem)] py-2">
      {/* ── Mobile Drawer Trigger Bar ── */}
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-surface p-3 shadow-xs lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-sm">
            {roleIcon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-black uppercase text-primary">
                {role}
              </span>
              <span className="text-xs font-bold text-text">Dashboard</span>
            </div>
            <p className="text-[11px] text-muted truncate max-w-[170px]">
              {userName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-muted-bg px-3 py-1.5 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileDrawerOpen ? <FaTimes size={12} /> : <FaBars size={12} />}
          <span>{mobileDrawerOpen ? "Close" : "Menu"}</span>
        </button>
      </div>

      {/* ── Mobile Drawer Content ── */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-5 overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-md lg:hidden"
          >
            <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                {role} Navigation
              </span>
              <span className="text-[10px] text-primary font-semibold">
                {links.length} sections
              </span>
            </div>
            <div className="grid max-h-[60vh] gap-1 overflow-y-auto pr-1">
              {links.map((item) => {
                const isActive = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-xs"
                        : "text-text hover:bg-muted-bg"
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm">
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-tight">{item.label}</p>
                      <p className="truncate text-[10px] text-muted mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer Actions */}
            <div className="mt-3 pt-3 border-t border-border/70 flex items-center justify-between gap-2 px-1">
              <Link
                href="/products"
                onClick={() => setMobileDrawerOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text hover:text-primary transition"
              >
                <span>Store Catalog</span>
                <FaArrowRight size={10} />
              </Link>
              <button
                type="button"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-error transition cursor-pointer"
              >
                <FaSignOutAlt size={11} />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout Grid: Desktop Sidebar + Content ── */}
      <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-24 lg:h-[calc(100vh-7.5rem)] rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
          {/* Hub Header Badge */}
          <div className="p-4 border-b border-border/60">
            <div className="rounded-xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3.5 border border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[.2em] text-primary">
                  ShopNest
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="mt-1 text-base font-black text-text">{role} Hub</p>
            </div>
          </div>

          {/* Navigation Links Scroll Area */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            {links.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-xs border border-primary/20"
                      : "text-text hover:bg-muted-bg hover:text-text border border-transparent"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm transition-transform duration-150 group-hover:scale-105 ${
                      isActive ? "bg-primary text-white shadow-xs" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-xs font-bold leading-tight ${
                        isActive ? "text-primary" : "text-text"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] leading-snug text-muted">
                      {item.description}
                    </span>
                  </div>
                  {isActive && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar User Footer */}
          <div className="p-3 border-t border-border/60 bg-muted-bg/30">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-surface p-2 border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary font-black text-xs text-white shadow-xs">
                  {userAvatarInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold text-text leading-tight">
                    {userName}
                  </p>
                  <p className="truncate text-[10px] text-muted leading-tight">
                    {userEmail || role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } })}
                title="Log out"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted hover:border-error/40 hover:text-error hover:bg-error/10 transition cursor-pointer"
              >
                <FaSignOutAlt size={11} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content Slot ── */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
