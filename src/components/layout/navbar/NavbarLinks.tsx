"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { Sparkles } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
}

export interface DropdownItem {
  icon: IconType | string;
  label: string;
  href: string;
  isPrimary?: boolean;
}

export type UserRole = "customer" | "seller" | "admin" | "delivery_man" | "delivery" | "guest";

export const mainNavItems: Record<UserRole, NavItem[]> = {
  guest: [
    { href: "/products", label: "Products" },
    { href: "/ai-advisor", label: "AI Advisor" },
    { href: "/stores", label: "Stores" },
    { href: "/compare", label: "Compare" },
  ],
  seller: [
    { href: "/products", label: "Products" },
    { href: "/dashboard/seller/orders", label: "Orders" },
    { href: "/stores", label: "Stores" },
    { href: "/compare", label: "Compare" },
  ],
  admin: [
    { href: "/products", label: "Products" },
    { href: "/dashboard/admin/orders", label: "Orders" },
  ],
  customer: [
    { href: "/products", label: "Products" },
    { href: "/stores", label: "Stores" },
    { href: "/compare", label: "Compare" },
    { href: "/dashboard/user/ai-advisor", label: "AI Advisor" },
  ],
  delivery_man: [
    { href: "/dashboard/delivery", label: "Delivery Cockpit" },
    { href: "/dashboard/delivery/available", label: "Available Orders" },
    { href: "/dashboard/delivery/my-deliveries", label: "My Missions" },
    { href: "/dashboard/delivery/copilot", label: "AI Copilot" },
  ],
  delivery: [
    { href: "/dashboard/delivery", label: "Delivery Cockpit" },
    { href: "/dashboard/delivery/available", label: "Available Orders" },
    { href: "/dashboard/delivery/my-deliveries", label: "My Missions" },
    { href: "/dashboard/delivery/copilot", label: "AI Copilot" },
  ],
};

interface NavbarLinksProps {
  role: UserRole;
  isAuthenticated: boolean;
  /** Slot for CategoryMegaMenu (server component) injected by parent */
  categoryMenu?: React.ReactNode;
}

export function NavbarLinks({ role, isAuthenticated, categoryMenu }: NavbarLinksProps) {
  const pathname = usePathname();
  const navLinks = (isAuthenticated ? mainNavItems[role] : mainNavItems.guest) || mainNavItems.guest;

  return (
    <nav className="hidden min-w-0 items-center gap-1 lg:gap-1.5 lg:flex xl:mx-auto" aria-label="Main navigation">
      {categoryMenu}
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
              className={`group shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 xl:px-3.5 xl:text-sm ${active
                  ? "border-white/60 bg-white/25 text-white shadow-[0_0_12px_rgba(255,255,255,0.25)] ring-1 ring-white/30"
                  : "border-white/35 bg-white/15 text-white shadow-xs hover:border-white/60 hover:bg-white/25 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                }`}
            >
              <Sparkles
                className="h-3.5 w-3.5 text-amber-300 fill-amber-300/80 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
              />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-xl px-2 py-1.5 text-xs font-semibold transition xl:px-3 xl:py-2 xl:text-sm ${active
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/15 hover:text-white"
              }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
