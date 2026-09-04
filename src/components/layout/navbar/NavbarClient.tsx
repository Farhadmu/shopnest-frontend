"use client";

import React, { useState, useEffect } from "react";
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

  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; name?: string; email?: string; role?: "customer" | "seller" | "admin"; image?: string }
    | undefined;

  const role: UserRole = user?.role || (user ? "customer" : "guest");
  const isAuthenticated = !!user;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    return "/dashboard/user";
  };

  const totalCartCount = drawerItemCount || cartCount;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-360 px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 lg:gap-5">

          {/* Brand + desktop search */}
          <NavbarBrand
            onClose={() => setMobileMenuOpen(false)}
            search={search}
            setSearch={setSearch}
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
            dashboardHref={getDashboardHref()}
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
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-text xl:hidden"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            }
          />
        </div>

        {/* Mobile search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = search.trim();
            router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
            setMobileMenuOpen(false);
          }}
          className="pb-3 md:hidden"
        >
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

        {/* Mobile dropdown */}
        <NavbarMobileMenu
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
    </header>
  );
}
