import Link from "next/link";
import React from "react";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
        <Image src="/shopnest-logo.png" width={40} height={40} alt="ShopNest Logo" />
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <Link href="/cart" className="hover:text-primary transition-colors">
            Cart
          </Link>
          <Link href="/wishlist" className="hover:text-primary transition-colors">
            Wishlist
          </Link>
          <Link href="/ai-advisor" className="hover:text-primary transition-colors">
            AI Advisor
          </Link>
          <Link href="/seller/dashboard" className="hover:text-primary transition-colors">
            Seller Hub
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground hover:text-primary px-3 py-1.5 rounded-lg transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-primary text-white hover:bg-primary-hover px-4 py-2 rounded-lg transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};
