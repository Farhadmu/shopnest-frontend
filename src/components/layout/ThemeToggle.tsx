"use client";

import { useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver(() => {
    callback();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("storage", callback);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("shopnest-theme", next ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="group relative inline-flex h-8 w-15 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted-bg p-1 shadow-inner transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Background Decorative Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
          <FaSun className={`text-warm transition-opacity duration-300 ${dark ? "opacity-40" : "opacity-0"}`} />
          <FaMoon className={`text-primary transition-opacity duration-300 ${dark ? "opacity-0" : "opacity-40"}`} />
        </div>

        {/* Sliding Knob */}
        <span
          className={`pointer-events-none relative grid h-6 w-6 transform place-items-center rounded-full bg-surface shadow-md ring-1 ring-border/40 transition-transform duration-300 ease-out group-hover:scale-105 ${
            dark ? "translate-x-7" : "translate-x-0"
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