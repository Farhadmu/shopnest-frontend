"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return (
      <div className="h-screen flex flex-col bg-background text-text overflow-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto lg:overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
