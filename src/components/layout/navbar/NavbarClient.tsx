"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { useSession, signOut } from "@/lib/auth-client";
import { useCartDrawer } from "@/context/CartDrawerContext";
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
import type { UserRole } from "./NavbarLinks";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarClientProps {
  /** Server-rendered CategoryMegaMenu for desktop nav */
  desktopCategoryMenu: React.ReactNode;
  /** Server-rendered MobileCategoryMenu for mobile drawer */
  mobileCategoryMenu: React.ReactNode;
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
  if (role === "delivery_man" || role === "delivery")
    return (
      <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-sky-600 dark:text-sky-400">
        Delivery Partner
      </span>
    );
  return (
    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
      Customer
    </span>
  );
}

export function NavbarClient({ desktopCategoryMenu, mobileCategoryMenu }: NavbarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCart, itemCount: drawerItemCount } = useCartDrawer();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: "customer" | "seller" | "admin" | "delivery_man" | "delivery"; image?: string }
    | undefined;

  const role: UserRole = isHydrated ? (user?.role as UserRole) || (user ? "customer" : "guest") : "guest";
  const isAuthenticated = isHydrated && !!user;

  // Scroll detection with 20px threshold and passive RAF throttling
  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isPill ? "px-3 sm:px-4" : "px-0"
      }`}
    >
      <motion.div
        layout
        transition={{
          duration: 0.35,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={`w-full transition-all duration-300 ${
          isPill
            ? "container mx-auto mt-2 rounded-full bg-base-100/80 backdrop-blur-md shadow-lg border border-white/20"
            : "max-w-full rounded-none bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-950 dark:via-purple-950 dark:to-violet-950 shadow-sm border-b border-white/15"
        }`}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex min-h-13 sm:min-h-14 items-center justify-between gap-2 lg:gap-4 xl:gap-5">

            {/* Brand + desktop search */}
            <NavbarBrand
              onClose={() => setMobileMenuOpen(false)}
              search={search}
              setSearch={setSearch}
              isScrolled={isScrolled}
            />

            {/* Desktop nav links + server category menu */}
            <NavbarLinks
              role={role}
              isAuthenticated={isAuthenticated}
              categoryMenu={desktopCategoryMenu}
            />

            {/* Right-side actions */}
            <NavbarActions
              isAuthenticated={isAuthenticated}
              cartCount={totalCartCount}
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

          {/* Mobile search bar */}
          <AnimatePresence>
            {(!isScrolled || mobileMenuOpen) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden md:hidden"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = search.trim();
                    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
                    setMobileMenuOpen(false);
                  }}
                  className="pb-3"
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile dropdown */}
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
        </div>
      </motion.div>
    </header>
  );
}
