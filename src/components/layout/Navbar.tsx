"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { IconType } from "react-icons";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaShoppingBag,
  FaUser,
  FaSignOutAlt,
  FaStore,
  FaShieldAlt,
  FaBox,
  FaPlus,
  FaHeart,
  FaRobot,
  FaCog,
  FaChevronDown,
} from "react-icons/fa";
import { APP_NAME } from "@/lib/constants";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSession, signOut } from "@/lib/auth-client";
import { getCart } from "@/lib/api/cart";
import {
  getGuestCart,
  getGuestWishlist,
  syncGuestDataToServer,
  clearGuestCart,
  clearGuestWishlist,
} from "@/lib/guest-store";

// Types for navigation structures
interface NavItem {
  href: string;
  label: string;
}

interface DropdownItem {
  icon: IconType | string;
  label: string;
  href: string;
  isPrimary?: boolean;
}

type UserRole = "customer" | "seller" | "admin" | "guest";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const user = session?.user as
    | {
      id?: string;
      name?: string;
      email?: string;
      role?: "customer" | "seller" | "admin";
      image?: string;
    }
    | undefined;

  const role: UserRole = user?.role || (user ? "customer" : "guest");
  const isAuthenticated = !!user;

  // Sync cart item count cleanly without triggering synchronous setState warnings
  useEffect(() => {
    let isMounted = true;

    const updateCount = () => {
      if (isAuthenticated) {
        // If user is authenticated and any guest items linger in localStorage, sync and clear
        const localCart = getGuestCart();
        const localWishlist = getGuestWishlist();
        if ((localCart?.items && localCart.items.length > 0) || (localWishlist && localWishlist.length > 0)) {
          syncGuestDataToServer().finally(() => {
            if (!isMounted) return;
            getCart()
              .then((c) => {
                if (!isMounted) return;
                const totalQty = (c?.items || []).reduce(
                  (acc, item) => acc + (item.quantity || 1),
                  0
                );
                setCartCount(totalQty);
              })
              .catch(() => {
                if (isMounted) setCartCount(0);
              });
          });
          return;
        }

        getCart()
          .then((c) => {
            if (!isMounted) return;
            const totalQty = (c?.items || []).reduce(
              (acc, item) => acc + (item.quantity || 1),
              0
            );
            setCartCount(totalQty);
          })
          .catch(() => {
            if (isMounted) setCartCount(0);
          });
      } else {
        const guestCart = getGuestCart();
        const totalQty = (guestCart?.items || []).reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        if (isMounted) setCartCount(totalQty);
      }
    };

    updateCount();

    const handleGuestUpdate = () => {
      if (!isAuthenticated) {
        const guestCart = getGuestCart();
        const totalQty = (guestCart?.items || []).reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        if (isMounted) setCartCount(totalQty);
      }
    };

    window.addEventListener("guest_cart_updated", handleGuestUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("guest_cart_updated", handleGuestUpdate);
    };
  }, [isAuthenticated, pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setMobileMenuOpen(false);
  };

  // Main Header Links Array
  const mainNavItems: Record<UserRole, NavItem[]> = {
    guest: [
      { href: "/products", label: "Products" },
      { href: "/ai-advisor", label: "AI Advisor" },
      { href: "/stores", label: "Stores" },
      { href: "/compare", label: "Compare" },
    ],
    seller: [
      { href: "/products", label: "Shop" },
      { href: "/dashboard/seller/orders", label: "Orders" },
      { href: "/stores", label: "Stores" },
      { href: "/compare", label: "Compare" },
    ],
    admin: [
      { href: "/products", label: "Shop" },
      { href: "/dashboard/admin/orders", label: "Orders" },
    ],
    customer: [
      { href: "/products", label: "Shop" },
      { href: "/stores", label: "Stores" },
      { href: "/compare", label: "Compare" },
      { href: "/dashboard/user/ai-advisor", label: "AI Advisor" },
    ],
  };

  // User Dropdown Items Config Array
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
      { icon: FaStore, label: "Become a Seller", href: "/dashboard/seller/dashboard", isPrimary: true },
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
    ],
  };

  const navLinks = isAuthenticated ? mainNavItems[role] : mainNavItems.guest;
  const dropdownLinks = isAuthenticated && role !== "guest" ? userDropdownItems[role] || [] : [];

  const getDashboardHref = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    return "/dashboard/user";
  };

  const getRoleBadge = () => {
    if (role === "admin") {
      return (
        <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
          Admin
        </span>
      );
    }
    if (role === "seller") {
      return (
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
          Seller
        </span>
      );
    }
    return (
      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
        Customer
      </span>
    );
  };

  const renderDropdownItems = () =>
    dropdownLinks.map((item: DropdownItem) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setUserDropdownOpen(false)}
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
    });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 lg:gap-5">
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-3 lg:gap-5">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl dark:bg-linear-to-br from-primary to-violet-500 shadow-lg shadow-primary/20">
                <Image
                  src="/shopnest-logo.png"
                  width={40}
                  height={40}
                  alt="ShopNest"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="hidden bg-linear-to-r from-text via-primary to-violet-500 bg-clip-text text-xl font-black tracking-tight text-transparent sm:inline">
                {APP_NAME}
              </span>
            </Link>

            {/* Expand-on-Hover Search Bar (Desktop) */}
            <form
              onSubmit={submitSearch}
              className="hidden md:flex shrink-0 items-center"
            >
              <div className="group relative flex h-11 w-11 items-center overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 ease-in-out hover:w-80 focus-within:w-80 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 pr-3">
                <button
                  type="submit"
                  aria-label="Search"
                  className="grid h-11 w-11 shrink-0 place-items-center text-muted transition-colors hover:text-primary"
                >
                  <FaSearch size={14} />
                </button>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, stores..."
                  className="w-full bg-transparent pr-3 text-sm text-text outline-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 placeholder:text-muted"
                  aria-label="Search ShopNest"
                />
              </div>
            </form>
          </div>

          {/* Center: Main Navigation Links */}
          <nav className="hidden items-center gap-1.5 lg:flex mx-auto">
            {navLinks.map((item: NavItem) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${active
                      ? "bg-primary/10 text-primary"
                      : "text-muted hover:bg-muted-bg hover:text-text"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated && (
              <Link
                href={getDashboardHref()}
                className="hidden h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary md:flex"
              >
                <span>Dashboard</span>
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

            <Link
              href="/cart"
              aria-label="Cart"
              title="Shopping Cart"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
            >
              <FaShoppingBag size={14} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-black text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <NotificationBell />
            <ThemeToggle compact />

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface p-1.5 transition hover:border-primary/50 hover:bg-muted-bg"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-linear-to-br from-primary to-violet-600 text-xs font-black text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser size={12} />}
                  </div>
                  <span className="hidden max-w-25 truncate text-xs font-bold text-text sm:inline">
                    {user?.name || "Account"}
                  </span>
                  <FaChevronDown size={10} className="text-muted" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="mb-2 rounded-xl bg-muted-bg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-text">
                          {user?.name || "User"}
                        </p>
                        {getRoleBadge()}
                      </div>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>

                    <div className="grid gap-0.5 text-xs font-bold">
                      {renderDropdownItems()}
                    </div>

                    <div className="my-2 border-t border-border" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-lg p-2.5 text-xs font-bold text-error transition hover:bg-error/10"
                    >
                      <FaSignOutAlt size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:text-text lg:inline"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-hover sm:inline"
                >
                  Get started
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-text xl:hidden"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={submitSearch} className="pb-3 md:hidden">
          <div className="flex h-11 items-center rounded-xl border border-border bg-surface px-3 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
            <FaSearch className="text-muted" size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ShopNest..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
            />
          </div>
        </form>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-3 xl:hidden">
            <div className="grid gap-1">
              {isAuthenticated && (
                <div className="mb-2 rounded-xl bg-muted-bg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-text">{user?.name}</p>
                    {getRoleBadge()}
                  </div>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              )}

              {navLinks.map((item: NavItem) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted-bg"
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-primary hover:bg-muted-bg"
                  >
                    Open Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-left text-sm font-bold text-error"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text hover:bg-muted-bg"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};