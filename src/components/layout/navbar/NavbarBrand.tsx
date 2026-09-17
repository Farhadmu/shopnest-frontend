"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";


interface NavbarBrandProps {
  onClose?: () => void;
  search: string;
  setSearch: (v: string) => void;
  isScrolled?: boolean;
}

export function NavbarBrand({ onClose, search, setSearch, isScrolled = false }: NavbarBrandProps) {
  const router = useRouter();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    onClose?.();
  };

  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5 lg:gap-5">
      {/* Logo */}
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-1.5 sm:gap-2"
        onClick={onClose}
      >
        <div className="relative aspect-square h-7.5 w-7.5 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-8 sm:w-8 md:h-8.5 md:w-8.5">
          <Image
            src="/logo-white.png"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt="ShopNest"
            priority
            className="object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
          />
        </div>
        <span className="bg-linear-to-r from-white via-slate-100 to-violet-400 bg-clip-text text-base font-black tracking-tight text-transparent sm:text-lg">
          ShopNest
        </span>
      </Link>

      {/* Expand-on-hover desktop / mobile-scrolled search */}
      <form onSubmit={submitSearch} className={`${isScrolled ? "flex" : "hidden md:flex"} min-w-0 shrink-0 items-center`}>
        <div className="group relative flex h-9 w-9 shrink-0 items-center overflow-hidden rounded-full border border-white/25 bg-white/15 transition-all duration-300 ease-in-out hover:w-52 focus-within:w-52 xl:hover:w-64 xl:focus-within:w-64 focus-within:bg-white/25 pr-2.5">
          <button
            type="submit"
            aria-label="Search"
            className="grid h-9 w-9 shrink-0 place-items-center text-white/70 transition-colors hover:text-white"
          >
            <FaSearch size={13} />
          </button>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, stores..."
            className="w-full min-w-0 bg-transparent pr-2.5 text-xs text-white outline-none opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 placeholder:text-white/50"
            aria-label="Search ShopNest"
          />
        </div>
      </form>
    </div>
  );
}
