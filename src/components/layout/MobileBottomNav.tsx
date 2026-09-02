"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiGrid, FiShoppingCart, FiHeart, FiUser } from "react-icons/fi";
import { getCart } from "@/lib/api/cart";
import { getWishlist } from "@/lib/api/wishlist";
import { useSession } from "@/lib/auth-client";
import { subscribeToCommerceUpdates } from "@/lib/commerce-events";
import { useCartDrawer } from "@/context/CartDrawerContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openCart, itemCount: drawerItemCount } = useCartDrawer();
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const [cartData, wishlistData] = await Promise.allSettled([
          getCart(),
          getWishlist(),
        ]);
        if (!isMounted) return;
        if (cartData.status === "fulfilled" && cartData.value?.items) {
          const totalQty = cartData.value.items.reduce((sum, i) => sum + i.quantity, 0);
          setCartCount(totalQty);
        }
        if (wishlistData.status === "fulfilled" && Array.isArray(wishlistData.value)) {
          setWishlistCount(wishlistData.value.length);
        }
      } catch {
        // Silently catch for guest users
      }
    };

    fetchCounts();
    const unsubscribe = subscribeToCommerceUpdates(fetchCounts);
    const interval = setInterval(fetchCounts, 30000);
    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [pathname]);

  const role = (session?.user as { role?: string } | undefined)?.role ?? "customer";
  if (role === "seller" || role === "admin") return null;

  const currentCartCount = drawerItemCount || cartCount;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: FiHome,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/products",
      icon: FiGrid,
      isActive: pathname.startsWith("/products"),
    },
    {
      label: "Cart",
      href: "#cart",
      isCartButton: true,
      icon: FiShoppingCart,
      badge: currentCartCount > 0 ? currentCartCount : undefined,
      isActive: pathname === "/cart",
    },
    {
      label: "Saved",
      href: "/wishlist",
      icon: FiHeart,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
      isActive: pathname === "/wishlist",
    },
    {
      label: session?.user ? "Account" : "Login",
      href: session?.user ? "/dashboard" : "/login",
      icon: FiUser,
      isActive: pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/profile",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-pb"
      style={{ minHeight: "var(--mobile-nav-height)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCartButton) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={openCart}
                aria-label={`Shopping Cart (${currentCartCount} items)`}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  item.isActive
                    ? "text-primary font-bold scale-105"
                    : "text-muted hover:text-foreground font-medium"
                }`}
              >
                <div className="relative">
                  <Icon className="text-xl" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-[#7C3AED] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                {item.isActive && (
                  <span className="absolute -bottom-0.5 w-5 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                item.isActive
                  ? "text-primary font-bold scale-105"
                  : "text-muted hover:text-foreground font-medium"
              }`}
            >
              <div className="relative">
                <Icon className="text-xl" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {item.isActive && (
                <span className="absolute -bottom-0.5 w-5 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

