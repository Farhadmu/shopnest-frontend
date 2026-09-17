"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => {
    setTheme(dark ? "light" : "dark");
  };

  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="group relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-white/25 bg-white/15 p-1 shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:bg-white/25 sm:w-14"
      >
        {/* Background Decorative Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
          <FaSun className={`text-warm transition-opacity duration-300 ${dark ? "opacity-40" : "opacity-0"}`} />
          <FaMoon className={`text-primary transition-opacity duration-300 ${dark ? "opacity-0" : "opacity-40"}`} />
        </div>

        {/* Sliding Knob */}
        <span
          className={`pointer-events-none relative grid h-6 w-6 transform place-items-center rounded-full bg-surface shadow-md ring-1 ring-border/40 transition-transform duration-300 ease-out group-hover:scale-105 ${
            dark ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {dark ? (
            <FaMoon className="h-3.5 w-3.5 text-primary transition-transform duration-300 rotate-0 group-hover:-rotate-12" />
          ) : (
            <FaSun className="h-3.5 w-3.5 text-warm transition-transform duration-300 rotate-0 group-hover:rotate-45" />
          )}
        </span>
      </button>

      {!compact && (
        <span className="hidden text-xs font-semibold text-text sm:inline select-none">
          {dark ? "Dark" : "Light"}
        </span>
      )}
    </div>
  );
}