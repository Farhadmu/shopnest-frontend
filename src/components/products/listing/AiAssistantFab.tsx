import React from "react";
import Link from "next/link";
import { FiZap, FiArrowRight } from "react-icons/fi";

export function AiAssistantFab() {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden sm:block">
      <Link
        href="/compare"
        className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-text px-4 py-3 text-background shadow-2xl transition-transform hover:-translate-y-1"
      >
        <span className="relative grid place-items-center">
          <FiZap size={18} className="text-primary" />
        </span>
        <span className="flex flex-col text-left pr-1">
          <span className="text-[9px] font-black uppercase leading-none tracking-wider text-primary">
            Smart Assistant
          </span>
          <span className="mt-0.5 text-xs font-bold leading-tight">Compare Vendors</span>
        </span>
        <FiArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}