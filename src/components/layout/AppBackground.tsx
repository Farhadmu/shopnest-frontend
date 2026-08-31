"use client";

import React from "react";

export function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden select-none"
    >
      {/* 3D Ecommerce Purple Shopping Illustration Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 opacity-90 dark:opacity-85"
        style={{
          backgroundImage: "url('/main-bg.png')",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Subtle modern vignette overlay that enhances depth while keeping the image vibrant */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
    </div>
  );
}
