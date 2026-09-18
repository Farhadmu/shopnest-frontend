"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyItem {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageSrc?: string;
}

interface FlyToCartParams {
  startElement?: HTMLElement | null;
  startRect?: { x: number; y: number; width?: number; height?: number };
  imageSrc?: string;
}

interface FlyToCartContextType {
  triggerFlyToCart: (params: FlyToCartParams) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyItem[]>([]);

  const triggerFlyToCart = useCallback(({ startElement, startRect, imageSrc }: FlyToCartParams) => {
    if (typeof window === "undefined") return;

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (startRect) {
      startX = startRect.x + (startRect.width ? startRect.width / 2 : 0);
      startY = startRect.y + (startRect.height ? startRect.height / 2 : 0);
    } else if (startElement) {
      const rect = startElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // Determine target destination (navbar cart or mobile bottom nav cart)
    const isMobile = window.innerWidth < 768;
    const mobileBtn = document.getElementById("mobile-bottom-cart-btn");
    const navbarBtn = document.getElementById("navbar-cart-btn");

    const targetEl = isMobile && mobileBtn ? mobileBtn : (navbarBtn || mobileBtn);

    let targetX = window.innerWidth - 80;
    let targetY = 32;

    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect();
      if (targetRect.width > 0 && targetRect.height > 0) {
        targetX = targetRect.left + targetRect.width / 2;
        targetY = targetRect.top + targetRect.height / 2;
      }
    }

    const newItem: FlyItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      startX,
      startY,
      targetX,
      targetY,
      imageSrc,
    };

    setFlyingItems((prev) => [...prev, newItem]);
  }, []);

  const handleAnimationComplete = useCallback((id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    // Trigger impact bounce on cart buttons
    window.dispatchEvent(new CustomEvent("cart_icon_bump"));
  }, []);

  return (
    <FlyToCartContext.Provider value={{ triggerFlyToCart }}>
      {children}

      {/* High-z-index Flying Thumbnails Portal */}
      <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((item) => {
            const dy = item.targetY - item.startY;
            const isMovingUp = dy < 0;
            // Peak arc height calculation (safe within visible viewport)
            const peakY = isMovingUp
              ? Math.max(16, Math.min(item.startY, item.targetY) - 35)
              : Math.max(18, item.startY - 75);

            return (
              <motion.div
                key={item.id}
                initial={{
                  x: item.startX,
                  y: item.startY,
                  scale: 0.65,
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: [item.startX, item.targetX],
                  y: [item.startY, peakY, item.targetY],
                  scale: [0.65, 1.15, 0.95, 0.4, 0.05],
                  opacity: [1, 1, 1, 1, 0],
                  rotate: [0, -10, 8, -4, 0],
                }}
                transition={{
                  duration: 0.75,
                  x: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                  y: {
                    duration: 0.75,
                    times: [0, 0.44, 1],
                    ease: ["easeOut", "easeInOut"],
                  },
                  scale: {
                    duration: 0.75,
                    times: [0, 0.18, 0.6, 0.9, 1],
                    ease: "easeInOut",
                  },
                  opacity: {
                    duration: 0.75,
                    times: [0, 0.85, 0.92, 0.97, 1],
                    ease: "easeOut",
                  },
                  rotate: {
                    duration: 0.75,
                    ease: "easeInOut",
                  },
                }}
                onAnimationComplete={() => handleAnimationComplete(item.id)}
                style={{
                  position: "fixed",
                  left: -28,
                  top: -28,
                  width: 56,
                  height: 56,
                  pointerEvents: "none",
                }}
                className="relative flex items-center justify-center"
              >
                {/* Ambient dynamic glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary via-rose-500 to-amber-400 opacity-60 blur-md animate-pulse" />

                {/* Sleek glass squircle container */}
                <div className="relative flex h-full w-full items-center justify-center rounded-2xl border-2 border-white/80 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-white/20 dark:bg-slate-900/95">
                  {item.imageSrc && !item.imageSrc.startsWith("linear-gradient") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageSrc}
                      alt="Flying product"
                      className="h-full w-full rounded-xl object-cover shadow-xs"
                    />
                  ) : (
                    <span className="text-2xl drop-shadow-sm">🛍️</span>
                  )}

                  {/* Micro +1 glowing badge */}
                  <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-primary to-rose-500 px-1 text-[9px] font-black text-white shadow-md ring-1.5 ring-white dark:ring-slate-900">
                    +1
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error("useFlyToCart must be used within a FlyToCartProvider");
  }
  return context;
}
