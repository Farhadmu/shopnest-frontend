import React, { ReactNode } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { NavbarUserMenu } from "@/components/layout/navbar/NavbarUserMenu";
import type { UserRole } from "@/components/layout/navbar/NavbarLinks";
import { signOut } from "@/lib/auth-client";

export interface DashboardTopbarProps {
  role: string;
  roleIcon?: ReactNode;
  userName?: string;
  userImage?: string;
  userEmail?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "customer" | "seller" | "admin" | "delivery_man" | "delivery";
    image?: string;
  };
  onSignOut?: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

/**
 * Reusable sticky top bar shown above the dashboard content column
 * (to the right of the fixed sidebar). Holds the mobile menu toggle,
 * notification bell, and the navbar-style user menu avatar.
 */
export function DashboardTopbar({
  role,
  userName = "Member",
  userImage = "",
  userEmail = "",
  user,
  onSignOut,
  mobileMenuOpen,
  onToggleMobileMenu,
}: DashboardTopbarProps) {
  const resolvedRole = (user?.role ||
    (role.toLowerCase().includes("admin")
      ? "admin"
      : role.toLowerCase().includes("seller")
      ? "seller"
      : role.toLowerCase().includes("delivery")
      ? "delivery_man"
      : "customer")) as UserRole;

  const resolvedUser = user || {
    name: userName,
    email: userEmail,
    image: userImage,
    role: resolvedRole as any,
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text lg:hidden cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
      </button>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <NotificationBell variant="dashboard" />
        <NavbarUserMenu
          user={resolvedUser}
          role={resolvedRole}
          variant="dashboard"
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
}
