"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";

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

export type UserRole = "customer" | "seller" | "admin" | "guest";

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
};

interface NavbarLinksProps {
  role: UserRole;
  isAuthenticated: boolean;
  /** Slot for CategoryMegaMenu (server component) injected by parent */
  categoryMenu?: React.ReactNode;
}

export function NavbarLinks({ role, isAuthenticated, categoryMenu }: NavbarLinksProps) {
  const pathname = usePathname();
  const navLinks = isAuthenticated ? mainNavItems[role] : mainNavItems.guest;

  return (
    <nav className="hidden items-center gap-1.5 lg:flex mx-auto" aria-label="Main navigation">
      {categoryMenu}
      {navLinks.map((item: NavItem) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
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
  );
}
