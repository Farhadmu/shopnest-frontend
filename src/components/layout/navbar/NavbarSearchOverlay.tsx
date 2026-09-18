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

  // Auto-focus and dispatch open/close events
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new CustomEvent("search_overlay_opened"));
      // Slight delay so the animation starts before focus
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      window.dispatchEvent(new CustomEvent("search_overlay_closed"));
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

  const handleTagClick = (tag: string) => {
    onChange(tag);
    router.push(`/products?search=${encodeURIComponent(tag)}`);
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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
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
            className="fixed inset-x-0 top-0 z-[61] px-3 pt-3 pb-6 sm:px-6"
            // Stop clicks inside the panel from hitting the backdrop
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface/95 text-text shadow-2xl backdrop-blur-2xl overflow-hidden">
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5">
                {/* Search icon */}
                <FaSearch className="shrink-0 text-primary" size={16} />

                {/* Input */}
                <input
                  ref={inputRef}
                  type="search"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Search products, categories, brands..."
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-text outline-none placeholder:text-muted"
                  aria-label="Search ShopNest"
                />

                {/* Clear / close */}
                <button
                  type="button"
                  onClick={() => (value ? onChange("") : onClose())}
                  aria-label={value ? "Clear search" : "Close search"}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-muted-bg hover:text-text cursor-pointer"
                >
                  <FaTimes size={14} />
                </button>
              </form>

              {/* Google Play Style Quick Trending Pills */}
              <div className="border-t border-border/80 bg-muted-bg/40 px-4 py-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-muted mr-1 flex items-center gap-1">
                  Trending:
                </span>
                {["Wireless Earbuds", "Smart Watch", "Sneakers", "Mechanical Keyboard", "Coffee Maker"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="rounded-full bg-surface hover:bg-primary/15 hover:text-primary border border-border px-3 py-1 text-xs font-semibold text-text transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Hint row */}
              <div className="border-t border-border/60 px-4 py-2 text-[11px] text-muted flex items-center justify-between">
                <span>Press <kbd className="rounded border border-border bg-muted-bg px-1.5 py-0.5 font-mono text-[10px] text-text">Enter</kbd> to search</span>
                <span>Tap <kbd className="rounded border border-border bg-muted-bg px-1.5 py-0.5 font-mono text-[10px] text-text">Esc</kbd> to dismiss</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
