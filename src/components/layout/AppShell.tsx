"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PersonalCommerceAssistant } from "@/components/ai/PersonalCommerceAssistant";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background text-text">
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text pb-16 md:pb-0">
      <Navbar />
      {/* 🟢 Clean Max-Width setup without default 'container' class */}
      <main className="mx-auto w-full max-w-360 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <PersonalCommerceAssistant />
    </div>
  );
}
