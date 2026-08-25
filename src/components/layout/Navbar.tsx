"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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

  const role = user?.role || (user ? "customer" : "guest");
  const isAuthenticated = !!user;

  // Sync cart item count
  useEffect(() => {
    if (isAuthenticated) {
      getCart()
        .then((c) => {
          const totalQty = (c?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
          setCartCount(totalQty);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
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

  // Compute navigation links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { href: "/products", label: "Shop" },
        { href: "/ai-advisor", label: "AI Advisor" },
        { href: "/stores", label: "Stores" },
        { href: "/register", label: "Sell on ShopNest" },
      ];
    }

    if (role === "seller") {
      return [
        { href: "/products", label: "Shop" },
        { href: "/stores", label: "Stores" },
        { href: "/seller/dashboard", label: "Seller Hub" },
        { href: "/seller/products/add", label: "+ Add Product" },
        { href: "/seller/orders", label: "Orders" },
        { href: "/seller/ai-tools", label: "AI Seller Tools" },
      ];
    }

    if (role === "admin") {
      return [
        { href: "/products", label: "Shop" },
        { href: "/admin/dashboard", label: "Admin Control" },
        { href: "/admin/users", label: "Users" },
        { href: "/admin/sellers", label: "Sellers" },
        { href: "/admin/products", label: "Moderation" },
        { href: "/admin/security", label: "Security" },
      ];
    }

    // Default Customer Role (No "Sell on ShopNest" in main nav)
    return [
      { href: "/products", label: "Shop" },
      { href: "/ai-advisor", label: "AI Advisor" },
      { href: "/stores", label: "Stores" },
      { href: "/orders", label: "My Orders" },
      { href: "/wishlist", label: "Wishlist" },
    ];
  };

  const navLinks = getNavLinks();

  const getDashboardHref = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "seller") return "/seller/dashboard";
    return "/dashboard";
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center gap-3 lg:gap-5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/20">
              <Image
                src="/shopnest-logo.png"
                width={40}
                height={40}
                alt="ShopNest"
                className="h-10 w-10 object-contain"
              />
            </div>
            <span className="hidden bg-gradient-to-r from-text via-primary to-violet-500 bg-clip-text text-xl font-black tracking-tight text-transparent sm:inline">
              {APP_NAME}
            </span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={submitSearch}
            className="hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-xl"
          >
            <div className="group flex h-11 items-center rounded-xl border border-border bg-surface px-3 transition focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10">
              <FaSearch className="shrink-0 text-muted" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, categories, stores..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-muted"
                aria-label="Search ShopNest"
              />
              <kbd className="hidden rounded-md border border-border bg-muted-bg px-2 py-1 text-[10px] font-semibold text-muted lg:inline">
                ⌘ K
              </kbd>
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-1 xl:flex">
            {navLinks.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
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
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* Dashboard Shortcut for logged in users */}
            {isAuthenticated && (
              <Link
                href={getDashboardHref()}
                className="hidden h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text transition hover:border-primary/40 hover:text-primary md:flex"
              >
                <span>Dashboard</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              title="Wishlist"
              className="hidden h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary sm:grid"
            >
              <FaHeart size={14} />
            </Link>

            {/* Cart with Live Badge */}
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

            {/* Notifications */}
            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle compact />

            {/* Authenticated User Menu vs Guest Log In / Get Started */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface p-1.5 transition hover:border-primary/50 hover:bg-muted-bg"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-xs font-black text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser size={12} />}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-xs font-bold text-text sm:inline">
                    {user?.name || "Account"}
                  </span>
                  <FaChevronDown size={10} className="text-muted" />
                </button>

                {/* Profile Dropdown Popup */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-surface p-2 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    {/* User Header */}
                    <div className="mb-2 rounded-xl bg-muted-bg p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-black text-text">
                          {user?.name || "User"}
                        </p>
                        {getRoleBadge()}
                      </div>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>

                    {/* Role-Specific Links */}
                    <div className="grid gap-0.5 text-xs font-bold">
                      {role === "customer" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <span className="text-sm">📊</span> Customer Dashboard
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaBox className="text-muted" size={13} /> Orders & Tracking
                          </Link>
                          <Link
                            href="/cart"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaShoppingBag className="text-muted" size={13} /> Smart Cart
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaHeart className="text-muted" size={13} /> Wishlist
                          </Link>
                          <Link
                            href="/ai-advisor"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaRobot className="text-muted" size={13} /> AI Shopping Advisor
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaUser className="text-muted" size={13} /> Profile & Security
                          </Link>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-primary transition hover:bg-primary/10"
                          >
                            <FaStore size={13} /> Become a Seller
                          </Link>
                        </>
                      )}

                      {role === "seller" && (
                        <>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaStore className="text-muted" size={13} /> Seller Overview
                          </Link>
                          <Link
                            href="/seller/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaBox className="text-muted" size={13} /> Product Management
                          </Link>
                          <Link
                            href="/seller/products/add"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaPlus className="text-muted" size={13} /> Add New Product
                          </Link>
                          <Link
                            href="/seller/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <span className="text-sm">📦</span> Order Fulfillment
                          </Link>
                          <Link
                            href="/seller/inventory"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <span className="text-sm">📊</span> Smart Inventory
                          </Link>
                          <Link
                            href="/seller/ai-tools"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaRobot className="text-muted" size={13} /> AI Seller Tools
                          </Link>
                          <Link
                            href="/seller/store-settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaCog className="text-muted" size={13} /> Store Settings
                          </Link>
                        </>
                      )}

                      {role === "admin" && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaShieldAlt className="text-muted" size={13} /> Platform Overview
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaUser className="text-muted" size={13} /> User Management
                          </Link>
                          <Link
                            href="/admin/sellers"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaStore className="text-muted" size={13} /> Seller Verification
                          </Link>
                          <Link
                            href="/admin/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaBox className="text-muted" size={13} /> Product Moderation
                          </Link>
                          <Link
                            href="/admin/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <span className="text-sm">📦</span> Order Operations
                          </Link>
                          <Link
                            href="/admin/security"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg p-2.5 text-text transition hover:bg-primary/10 hover:text-primary"
                          >
                            <FaShieldAlt className="text-muted" size={13} /> Security Center
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="my-2 border-t border-border" />

                    {/* Logout Button */}
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
              /* Guest Log in and Get started */
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

            {/* Mobile Menu Button */}
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

              {navLinks.map((item) => (
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
