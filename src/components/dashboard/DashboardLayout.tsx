"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { FaArrowRight, FaSignOutAlt, FaStore, FaShieldAlt, FaUser, FaHome } from "react-icons/fa";
import { useSession, signOut } from "@/lib/auth-client";
import {
  userDashboardLinks,
  sellerDashboardLinks,
  adminDashboardLinks,
} from "@/lib/constants/dashboard-nav";
import type { DashboardLink } from "@/components/dashboard/DashboardUI";
import { SidebarBrand } from "@/components/dashboard/sidebar/SidebarBrand";
import { SidebarNavList } from "@/components/dashboard/sidebar/SidebarNavList";
import { SidebarUserFooter } from "@/components/dashboard/sidebar/SidebarUserFooter";
import { DashboardTopbar } from "@/components/dashboard/sidebar/DashboardTopbar";

interface DashboardSidebarLayoutProps {
  role?: string;
  links?: DashboardLink[];
  children: ReactNode;
}

const SIDEBAR_WIDTH = "17rem"; // 272px

function resolveRoleAndLinks(
  pathname: string,
  initialRole?: string,
  initialLinks?: DashboardLink[]
): { role: string; links: DashboardLink[] } {
  if (initialRole && initialLinks) return { role: initialRole, links: initialLinks };

  if (pathname.startsWith("/dashboard/seller")) {
    return { role: "Seller", links: sellerDashboardLinks };
  }
  if (pathname.startsWith("/dashboard/admin")) {
    return { role: "Administrator", links: adminDashboardLinks };
  }
  return { role: "Customer", links: userDashboardLinks };
}

function roleIconFor(role: string) {
  const lower = role.toLowerCase();
  if (lower.includes("admin")) return <FaShieldAlt />;
  if (lower.includes("seller")) return <FaStore />;
  return <FaUser />;
}

/**
 * Persistent fixed sidebar + top bar shell for every /dashboard/* page.
 * Composed from small reusable pieces in ./sidebar/* rather than inline
 * closures, so each piece can be reused or tested on its own.
 */
export function DashboardSidebarLayout({
  role: initialRole,
  links: initialLinks,
  children,
}: DashboardSidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const { role, links } = resolveRoleAndLinks(pathname, initialRole, initialLinks);
  const userName = session?.user?.name || "Member";
  const userEmail = session?.user?.email || "";

  const handleLogout = () =>
    signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop fixed sidebar */}
      <aside
        style={{ width: SIDEBAR_WIDTH }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface lg:flex"
      >
        <SidebarBrand role={role} />
        <SidebarNavList links={links} />
        <div className="border-t border-border p-2.5">
          <Link
            href="/"
            className="inline-flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-muted transition hover:bg-muted-bg hover:text-primary"
          >
            <FaHome size={11} /> Go to Home
          </Link>
        </div>
        <SidebarUserFooter userName={userName} userEmail={userEmail} role={role} onLogout={handleLogout} />
      </aside>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{ width: SIDEBAR_WIDTH }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col bg-surface shadow-xl lg:hidden"
            >
              <SidebarBrand role={role} onNavigate={() => setMobileDrawerOpen(false)} />
              <SidebarNavList links={links} onNavigate={() => setMobileDrawerOpen(false)} />
              <div className="flex items-center justify-between gap-2 border-t border-border p-2.5">
                <Link
                  href="/"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-text hover:text-primary"
                >
                  <FaHome size={10} /> Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-text hover:text-primary"
                >
                  Store Catalog <FaArrowRight size={10} />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-muted hover:text-error"
                >
                  <FaSignOutAlt size={11} /> Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content column, offset by the fixed sidebar width on desktop */}
      <div className="lg:pl-[17rem]">
        <DashboardTopbar
          role={role}
          roleIcon={roleIconFor(role)}
          userName={userName}
          mobileMenuOpen={mobileDrawerOpen}
          onToggleMobileMenu={() => setMobileDrawerOpen((v) => !v)}
        />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
