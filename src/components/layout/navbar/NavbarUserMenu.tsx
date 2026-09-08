"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import {
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaShieldAlt,
  FaBox,
  FaPlus,
  FaHeart,
  FaRobot,
  FaCog,
  FaShoppingBag,
  FaChevronDown,
} from "react-icons/fa";
import type { DropdownItem, UserRole } from "./NavbarLinks";

const userDropdownItems: Record<Exclude<UserRole, "guest">, DropdownItem[]> = {
  customer: [
    { icon: "📊", label: "Customer Dashboard", href: "/dashboard/user" },
    { icon: "📈", label: "Spending Analytics", href: "/dashboard/user/analytics" },
    { icon: FaShieldAlt, label: "Security Center", href: "/dashboard/user/security" },
    { icon: FaBox, label: "Orders & Tracking", href: "/dashboard/user/orders" },
    { icon: FaShoppingBag, label: "Smart Cart", href: "/cart" },
    { icon: FaHeart, label: "Wishlist", href: "/wishlist" },
    { icon: FaRobot, label: "AI Shopping Advisor", href: "/dashboard/user/ai-advisor" },
    { icon: FaUser, label: "Profile Settings", href: "/dashboard/user/profile" },
    { icon: FaStore, label: "Become a Seller", href: "/become-seller", isPrimary: true },
  ],
  seller: [
    { icon: FaStore, label: "Seller Overview", href: "/dashboard/seller" },
    { icon: "📈", label: "Sales Analytics", href: "/dashboard/seller/analytics" },
    { icon: "🔮", label: "Sales Forecast", href: "/dashboard/seller/forecast" },
    { icon: "📦", label: "Smart Inventory", href: "/dashboard/seller/inventory" },
    { icon: "🩺", label: "Store Health", href: "/dashboard/seller/store-health" },
    { icon: "👥", label: "Customer Insights", href: "/dashboard/seller/customers" },
    { icon: FaBox, label: "Product Management", href: "/dashboard/seller/products" },
    { icon: FaPlus, label: "Add New Product", href: "/dashboard/seller/products/add" },
    { icon: "🚚", label: "Order Fulfillment", href: "/dashboard/seller/orders" },
    { icon: FaRobot, label: "AI Seller Tools", href: "/dashboard/seller/ai-tools" },
    { icon: FaUser, label: "Profile Settings", href: "/dashboard/seller/profile" },
    { icon: FaCog, label: "Store Settings", href: "/dashboard/seller/store-settings" },
  ],
  admin: [
    { icon: FaShieldAlt, label: "Command Center", href: "/dashboard/admin" },
    { icon: "📈", label: "Platform Analytics", href: "/dashboard/admin/analytics" },
    { icon: FaShieldAlt, label: "Security Center", href: "/dashboard/admin/security" },
    { icon: "🚨", label: "Risk & Fraud Detection", href: "/dashboard/admin/risk" },
    { icon: "📑", label: "Incident Management", href: "/dashboard/admin/incidents" },
    { icon: "📜", label: "Governance Audit Logs", href: "/dashboard/admin/audit-logs" },
    { icon: FaUser, label: "User Management", href: "/dashboard/admin/users" },
    { icon: FaStore, label: "Seller Verification", href: "/dashboard/admin/sellers" },
    { icon: FaBox, label: "Product Moderation", href: "/dashboard/admin/products" },
    { icon: "📦", label: "Order Operations", href: "/dashboard/admin/orders" },
    { icon: FaUser, label: "Profile Settings", href: "/dashboard/admin/profile" },
  ],
};

interface NavbarUserMenuProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "customer" | "seller" | "admin";
    image?: string;
  };
  role: UserRole;
  onOpenCart: () => void;
  onSignOut: () => void;
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin")
    return (
      <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
        Admin
      </span>
    );
  if (role === "seller")
    return (
      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
        Seller
      </span>
    );
  return (
    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
      Customer
    </span>
  );
}

export function NavbarUserMenu({ user, role, onOpenCart, onSignOut }: NavbarUserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownLinks = role !== "guest" ? userDropdownItems[role as Exclude<UserRole, "guest">] || [] : [];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface p-1.5 transition hover:border-primary/50 hover:bg-muted-bg"
        aria-expanded={open}
        aria-label="Open account menu"
      >
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-primary to-violet-600 text-xs font-black text-white">
          {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser size={12} />}
        </div>
        <span className="hidden max-w-25 truncate text-xs font-bold text-text sm:inline">
          {user?.name || "Account"}
        </span>
        <FaChevronDown size={10} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in fade-in zoom-in-95">
          {/* User info header */}
          <div className="mb-2 rounded-xl bg-muted-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-black text-text">{user?.name || "User"}</p>
              <RoleBadge role={role} />
            </div>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="grid gap-0.5 text-xs font-bold">
            {dropdownLinks.map((item: DropdownItem) => {
              const Icon = item.icon;
              if (item.href === "/cart") {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => { setOpen(false); onOpenCart(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left text-text transition hover:bg-primary/10 hover:text-primary cursor-pointer"
                  >
                    {typeof Icon === "string" ? (
                      <span className="text-sm">{Icon}</span>
                    ) : (
                      <Icon className="text-muted" size={13} />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg p-2.5 transition ${item.isPrimary
                    ? "text-primary hover:bg-primary/10"
                    : "text-text hover:bg-primary/10 hover:text-primary"
                    }`}
                >
                  {typeof Icon === "string" ? (
                    <span className="text-sm">{Icon}</span>
                  ) : (
                    <Icon className="text-muted" size={13} />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-2 border-t border-border" />
          <button
            type="button"
            onClick={() => { setOpen(false); onSignOut(); }}
            className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-xs font-bold text-error transition hover:bg-error/10"
          >
            <FaSignOutAlt size={13} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

interface NavbarAuthButtonsProps {
  onClose?: () => void;
}

export function NavbarAuthButtons({ onClose }: NavbarAuthButtonsProps) {
  return (
    <>
      <Link
        href="/login"
        onClick={onClose}
        className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:text-text lg:inline"
      >
        Log in
      </Link>
      <Link
        href="/register">
        <Button
          
          size="sm"
          className="hidden bg-primary rounded-xl px-4 text-sm font-bold text-white shadow-lg shadow-primary sm:flex"
          onClick={onClose}
        >
          Get started
        </Button>
      </Link>
    </>
  );
}
