"use client";

import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("shopnest-theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary ${compact ? "h-10 w-10" : "h-10 gap-2 px-3"}`}
    >
      {dark ? <FaSun className="text-amber-400" /> : <FaMoon />}
      {!compact && <span className="hidden text-xs font-semibold sm:inline">{dark ? "Light" : "Night"}</span>}
    </button>
  );
}
