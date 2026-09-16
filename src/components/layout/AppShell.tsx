"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useSession } from "@/lib/auth-client";
import { recordSession } from "@/lib/api/security-intelligence";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const recognizedUserId = useRef<string | null>(null);

  // Report this browser as a device for the signed-in user as soon as a session
  // exists — password login, sign-up, social login and restored sessions all
  // funnel through here, for every role.
  //
  // The backend alerts only the first time a device is ever seen for a user, so
  // this stays silent on repeat logins, refreshes and page loads; the ref simply
  // avoids re-sending it for the same user within one page load.
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || recognizedUserId.current === userId) return;
    recognizedUserId.current = userId;
    recordSession().catch(() => {
      // Non-critical: it is retried on the next login or page load.
    });
  }, [session?.user?.id]);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isAuthRoute) {
    return (
      <CartDrawerProvider>
        <div className="h-[100dvh] flex flex-col bg-background text-text overflow-hidden">
          <Navbar />
          {/* Spacer reserves the fixed navbar height so content isn't hidden behind it */}
          <div className="h-16 shrink-0" aria-hidden="true" />
          <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">{children}</main>
        </div>
        <CartDrawer />
      </CartDrawerProvider>
    );
  }

  if (isDashboardRoute) {
    return (
      <CartDrawerProvider>
        <div className="min-h-screen bg-background text-text">{children}</div>
        <CartDrawer />
      </CartDrawerProvider>
    );
  }

  return (
    <CartDrawerProvider>
      <div className="min-h-screen bg-background text-text pb-16 md:pb-0">
        <Navbar />
        {/*
          Stable spacer for the fixed navbar.
          • h-16 (64px) = navbar's min-h-16 inner row on desktop and tablet.
          • On mobile the collapsed navbar row is still 64px; the mobile search
            bar sits inside the navbar pill, so no extra offset is needed here.
          • This div does NOT change size during the pill animation, so the
            hero/banner never jumps vertically.
        */}
        <div className="h-16 shrink-0" aria-hidden="true" />
        {/* 🟢 Clean Max-Width setup without default 'container' class */}
        <main className="mx-auto w-full max-w-360 flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
      <CartDrawer />
    </CartDrawerProvider>
  );
}

