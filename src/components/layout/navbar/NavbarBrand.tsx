"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { APP_NAME } from "@/lib/constants";

interface NavbarBrandProps {
  onClose?: () => void;
  search: string;
  setSearch: (v: string) => void;
}

export function NavbarBrand({ onClose, search, setSearch }: NavbarBrandProps) {
  const router = useRouter();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    onClose?.();
  };

  return (
    <div className="flex items-center gap-3 lg:gap-5">
      {/* Logo */}
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-2.5"
        onClick={onClose}
      >
        <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl dark:bg-linear-to-br from-primary to-violet-500 shadow-lg shadow-primary/20">
          <Image
            src="/shopnest-logo.png"
            width={40}
            height={40}
            alt="ShopNest"
            className="h-10 w-10 object-contain"
          />
        </div>
        <span className="hidden bg-linear-to-r from-text via-primary to-violet-500 bg-clip-text text-xl font-black tracking-tight text-transparent sm:inline">
          {APP_NAME}
        </span>
      </Link>

      {/* Expand-on-hover desktop search */}
      <form onSubmit={submitSearch} className="hidden md:flex shrink-0 items-center">
        <div className="group relative flex h-11 w-11 items-center overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 ease-in-out hover:w-80 focus-within:w-80 focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 pr-3">
          <button
            type="submit"
            aria-label="Search"
            className="grid h-11 w-11 shrink-0 place-items-center text-muted transition-colors hover:text-primary"
          >
            <FaSearch size={14} />
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, stores..."
            className="w-full bg-transparent pr-3 text-sm text-text outline-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 placeholder:text-muted"
            aria-label="Search ShopNest"
          />
        </div>
      </form>
    </div>
  );
}
