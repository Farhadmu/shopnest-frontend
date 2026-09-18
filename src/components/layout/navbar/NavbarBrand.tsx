"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";

interface NavbarBrandProps {
  onClose?: () => void;
  onSearchOpen: () => void;
}

export function NavbarBrand({ onClose, onSearchOpen }: NavbarBrandProps) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
      {/* Logo */}
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-1.5 sm:gap-2"
        onClick={onClose}
      >
        <div className="relative aspect-square h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10">
          <Image
            src="/logo-white.png"
            fill
            sizes="48px"
            alt="ShopNest"
            priority
            className="object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
          />
        </div>
        <span className="bg-linear-to-r from-white via-slate-100 to-violet-400 bg-clip-text text-lg font-black tracking-tight text-transparent sm:text-xl">
          ShopNest
        </span>
      </Link>

      {/* Search trigger (desktop only) */}
      <button
        type="button"
        onClick={onSearchOpen}
        aria-label="Open search"
        className="hidden md:grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white/70 transition hover:bg-white/25 hover:text-white cursor-pointer active:scale-95"
      >
        <FaSearch size={13} />
      </button>
    </div>
  );
}
