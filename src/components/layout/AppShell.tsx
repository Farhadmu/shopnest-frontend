"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) return <main className="min-h-screen w-full">{children}</main>;

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      {/* 🟢 Clean Max-Width setup without default 'container' class */}
      <main className="mx-auto w-full max-w-360 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
