"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useSession, signOut } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCart } from "@/lib/api/cart";
import {
  getGuestCart,
  getGuestWishlist,
  syncGuestDataToServer,
} from "@/lib/guest-store";
import { NavbarBrand } from "./NavbarBrand";
import { NavbarLinks } from "./NavbarLinks";
import { NavbarActions } from "./NavbarActions";
import { NavbarUserMenu, NavbarAuthButtons } from "./NavbarUserMenu";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { NavbarSearchOverlay } from "./NavbarSearchOverlay";
import type { UserRole } from "./NavbarLinks";
import { RoleBadge } from "./NavbarRoleBadge";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarClientProps {
  /** Server-rendered CategoryMegaMenu for desktop nav */
  desktopCategoryMenu: React.ReactNode;
  /** Server-rendered MobileCategoryMenu for mobile drawer */
  mobileCategoryMenu: React.ReactNode;
}

export function NavbarClient({ desktopCategoryMenu, mobileCategoryMenu }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, itemCount: drawerItemCount } = useCartDrawer();
  const { itemCount: wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobile, setIsMobile] = useState(false);

  const isHydrated = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: "customer" | "seller" | "admin" | "delivery_man" | "delivery"; image?: string }
    | undefined;

  const role: UserRole = isHydrated ? (user?.role as UserRole) || (user ? "customer" : "guest") : "guest";
  const isAuthenticated = isHydrated && !!user;

  // Scroll detection with hysteresis to eliminate fluttering/bouncing at boundary
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && y > 35) return true;
        if (prev && y < 15) return false;
        return prev;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateScroll();
    checkMobile();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkMobile, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Sync cart count
  useEffect(() => {
    let isMounted = true;

    const updateCount = () => {
      if (isAuthenticated) {
        const localCart = getGuestCart();
        const localWishlist = getGuestWishlist();
        if (
          (localCart?.items && localCart.items.length > 0) ||
          (localWishlist && localWishlist.length > 0)
        ) {
          syncGuestDataToServer().finally(() => {
            if (!isMounted) return;
            getCart()
              .then((c) => {
                if (!isMounted) return;
                const qty = (c?.items || []).reduce((a, i) => a + (i.quantity || 1), 0);
                setCartCount(qty);
              })
              .catch(() => { if (isMounted) setCartCount(0); });
          });
          return;
        }
        getCart()
          .then((c) => {
            if (!isMounted) return;
            const qty = (c?.items || []).reduce((a, i) => a + (i.quantity || 1), 0);
            setCartCount(qty);
          })
          .catch(() => { if (isMounted) setCartCount(0); });
      } else {
        const guestCart = getGuestCart();
        const qty = (guestCart?.items || []).reduce((a, i) => a + (i.quantity || 1), 0);
        if (isMounted) setCartCount(qty);
      }
    };

    updateCount();

    const handleGuestUpdate = () => {
      if (!isAuthenticated) {
        const guestCart = getGuestCart();
        const qty = (guestCart?.items || []).reduce((a, i) => a + (i.quantity || 1), 0);
        if (isMounted) setCartCount(qty);
      }
    };

    window.addEventListener("guest_cart_updated", handleGuestUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("guest_cart_updated", handleGuestUpdate);
    };
  }, [isAuthenticated, pathname]);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const getDashboardHref = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    if (role === "delivery_man" || role === "delivery") return "/dashboard/delivery";
    return "/dashboard/user";
  };

  const totalCartCount = drawerItemCount || cartCount;
  const isPill = isScrolled && !mobileMenuOpen;

  return (
    <>
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 w-full"
    >
      {/*
        LAYERED PILL MORPH — professional approach:
        ┌─ Shell div ─────────────────────────────────────────┐
        │  Animates: border-radius, margin, box-shadow        │
        │  ┌─ BG Layer 1 (absolute) ── gradient ────────────┐ │
        │  │  Animates: opacity (fades OUT on scroll)        │ │
        │  └────────────────────────────────────────────────┘ │
        │  ┌─ BG Layer 2 (absolute) ── frosted glass ───────┐ │
        │  │  Animates: opacity (fades IN on scroll)         │ │
        │  └────────────────────────────────────────────────┘ │
        │  ┌─ Border Layer (absolute) ── inset box-shadow ──┐ │
        │  │  Animates: box-shadow (bottom-line → ring)      │ │
        │  └────────────────────────────────────────────────┘ │
        │  ┌─ Content (relative z-10) ──────────────────────┐ │
        │  │  NEVER MOVES — no width/padding animation       │ │
        │  └────────────────────────────────────────────────┘ │
        └─────────────────────────────────────────────────────┘
      */}
      {/*
        SPLIT SHELL APPROACH — outer div has NO overflow-hidden so dropdowns
        (category flyout, user menu) can extend below the bar. Background
        clipping lives in a separate pointer-events-none absolute child.
      */}
      <div
        className="relative mx-auto transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: isPill ? "min(1240px, calc(100% - 32px))" : "100%",
          boxShadow: isPill
            ? "0 8px 32px -8px rgba(0,0,0,0.18), 0 4px 8px -4px rgba(0,0,0,0.08)"
            : "none",
        }}
      >
        {/* ── Clipped background shell (overflow-hidden lives here, NOT on the outer div) ── */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          aria-hidden="true"
          style={{ borderRadius: isPill ? "0 0 24px 24px" : "0px" }}
        >
          {/* BG Layer 1: gradient (visible at top) */}
          <div
            className="absolute inset-0 bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-950 dark:via-purple-950 dark:to-violet-950"
            style={{ opacity: isPill ? 0 : 1, transition: "opacity 0.2s ease" }}
          />
          {/* BG Layer 2: frosted glass (visible when scrolled) */}
          <div
            className="absolute inset-0 bg-base-100/85 backdrop-blur-2xl"
            style={{ opacity: isPill ? 1 : 0, transition: "opacity 0.2s ease" }}
          />
          {/* Border layer */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: "inherit",
              boxShadow: isPill
                ? "inset 0 0 0 1px rgba(255,255,255,0.12)"
                : "inset 0 -1px 0 0 rgba(255,255,255,0.12)",
              transition: "box-shadow 0.25s cubic-bezier(0.25, 1, 0.3, 1)",
            }}
          />
        </div>

        {/* ── Content layer — z-index above bg, NO overflow restriction ── */}
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-2 lg:gap-4 xl:gap-5">

            {/* Brand + desktop search trigger */}
            <NavbarBrand
              onClose={() => setMobileMenuOpen(false)}
              onSearchOpen={() => setSearchOpen(true)}
            />

            {/* Desktop nav links + server category menu */}
            <div className="relative z-30">
              <NavbarLinks
                role={role}
                isAuthenticated={isAuthenticated}
                categoryMenu={desktopCategoryMenu}
              />
            </div>

            {/* Right-side actions */}
            <NavbarActions
              isAuthenticated={isAuthenticated}
              cartCount={totalCartCount}
              wishlistCount={wishlistCount}
              onOpenCart={openCart}
              userSlot={
                isAuthenticated ? (
                  <NavbarUserMenu
                    user={user}
                    role={role}
                    onOpenCart={openCart}
                    onSignOut={handleSignOut}
                  />
                ) : (
                  <NavbarAuthButtons onClose={() => setMobileMenuOpen(false)} />
                )
              }
              mobileToggle={
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/15 text-white transition hover:bg-white/25 lg:hidden cursor-pointer active:scale-95"
                >
                  {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
              }
            />
          </div>

          {/* Mobile search bar — always rendered, hidden when scrolled & menu closed */}
          {(!isScrolled || mobileMenuOpen) && (
            <div className="overflow-hidden pb-3 md:hidden">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = search.trim();
                  router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
                  setMobileMenuOpen(false);
                }}
              >
                <div className="flex h-11 items-center rounded-xl border border-white/25 bg-white/15 px-3 focus-within:bg-white/25">
                  <FaSearch className="text-white/70" size={14} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ShopNest..."
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/50"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Mobile menu drawer */}
          {mobileMenuOpen && (
            <NavbarMobileMenu
              key={pathname}
              open={mobileMenuOpen}
              isAuthenticated={isAuthenticated}
              user={user}
              role={role}
              dashboardHref={getDashboardHref()}
              onClose={() => setMobileMenuOpen(false)}
              onSignOut={handleSignOut}
              categoryMenuSlot={mobileCategoryMenu}
              roleBadge={<RoleBadge role={role} />}
            />
          )}
        </div>
      </div>
    </motion.header>

      {/* Full-width search overlay — rendered outside the pill shell */}
      <NavbarSearchOverlay
        open={searchOpen}
        value={search}
        onChange={setSearch}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}

