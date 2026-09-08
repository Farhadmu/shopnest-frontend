"use client";

import { useEffect } from "react";

export function ThemeBootstrap() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shopnest-theme");
      const dark = saved
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // Theme preference is optional and unavailable in some browser contexts.
    }
  }, []);

  return null;
}
