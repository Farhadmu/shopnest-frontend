"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

interface NavbarSearchOverlayProps {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}

export function NavbarSearchOverlay({
  open,
  value,
  onChange,
  onClose,
}: NavbarSearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      // Slight delay so the animation starts before focus
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    onChange("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="search-panel"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-x-0 top-0 z-[61] px-4 pt-4 pb-6 sm:px-6"
            // Stop clicks inside the panel from hitting the backdrop
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-base-100/95 shadow-2xl backdrop-blur-2xl">
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
                {/* Search icon */}
                <FaSearch className="shrink-0 text-base-content/40" size={16} />

                {/* Input */}
                <input
                  ref={inputRef}
                  type="search"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Search products, stores, categories…"
                  className="min-w-0 flex-1 bg-transparent text-base text-base-content outline-none placeholder:text-base-content/35"
                  aria-label="Search ShopNest"
                />

                {/* Clear / close */}
                <button
                  type="button"
                  onClick={() => (value ? onChange("") : onClose())}
                  aria-label={value ? "Clear search" : "Close search"}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base-content/40 transition hover:bg-base-200 hover:text-base-content cursor-pointer"
                >
                  <FaTimes size={13} />
                </button>
              </form>

              {/* Optional: hint row */}
              <div className="border-t border-base-200 px-4 py-2 text-xs text-base-content/35">
                Press <kbd className="rounded bg-base-200 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to search &nbsp;·&nbsp; <kbd className="rounded bg-base-200 px-1 py-0.5 font-mono text-[10px]">Esc</kbd> to dismiss
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
