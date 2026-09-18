"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiShoppingBag,
  FiHeart,
  FiAlertCircle,
  FiInfo,
  FiX,
  FiArrowRight,
} from "react-icons/fi";

export type ToastType = "success" | "cart" | "wishlist" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

interface ToastContextType {
  show: (type: ToastType, title: string, options?: ToastOptions) => string;
  success: (title: string, options?: ToastOptions) => string;
  cart: (title: string, options?: ToastOptions) => string;
  wishlist: (title: string, options?: ToastOptions) => string;
  error: (title: string, options?: ToastOptions) => string;
  info: (title: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global trigger listener
type ToastListener = (toast: Omit<ToastItem, "id" | "createdAt">) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  show: (type: ToastType, title: string, options?: ToastOptions) => {
    listeners.forEach((listener) =>
      listener({
        type,
        title,
        description: options?.description,
        duration: options?.duration ?? 3800,
        action: options?.action,
      })
    );
  },
  success: (title: string, options?: ToastOptions) => toast.show("success", title, options),
  cart: (title: string, options?: ToastOptions) => toast.show("cart", title, options),
  wishlist: (title: string, options?: ToastOptions) => toast.show("wishlist", title, options),
  error: (title: string, options?: ToastOptions) => toast.show("error", title, options),
  info: (title: string, options?: ToastOptions) => toast.show("info", title, options),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  const show = useCallback(
    (type: ToastType, title: string, options?: ToastOptions): string => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options?.duration ?? 3800;

      const newToast: ToastItem = {
        id,
        type,
        title,
        description: options?.description,
        duration,
        action: options?.action,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        // Keep at most 4 simultaneous toasts to prevent screen clutter
        const next = [...prev, newToast];
        if (next.length > 4) {
          const oldest = next[0];
          const timeout = timeoutsRef.current.get(oldest.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(oldest.id);
          }
          return next.slice(next.length - 4);
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timeoutsRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  // Subscribe standalone toast singleton to context provider
  useEffect(() => {
    const handler: ToastListener = (item) => {
      show(item.type, item.title, {
        description: item.description,
        duration: item.duration,
        action: item.action,
      });
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [show]);

  const success = useCallback((t: string, o?: ToastOptions) => show("success", t, o), [show]);
  const cartMethod = useCallback((t: string, o?: ToastOptions) => show("cart", t, o), [show]);
  const wishlistMethod = useCallback((t: string, o?: ToastOptions) => show("wishlist", t, o), [show]);
  const errorMethod = useCallback((t: string, o?: ToastOptions) => show("error", t, o), [show]);
  const infoMethod = useCallback((t: string, o?: ToastOptions) => show("info", t, o), [show]);

  return (
    <ToastContext.Provider
      value={{
        show,
        success,
        cart: cartMethod,
        wishlist: wishlistMethod,
        error: errorMethod,
        info: infoMethod,
        dismiss,
        dismissAll,
      }}
    >
      {children}

      {/* Global Toast Container - Safe above mobile nav and docked bottom-right on desktop */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 left-4 right-4 z-[999999] flex flex-col-reverse items-center gap-3 sm:bottom-8 sm:left-auto sm:right-8 sm:items-end"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const config = getToastConfig(item.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 35, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`pointer-events-auto relative flex w-full max-w-sm sm:max-w-md items-start gap-3.5 overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${config.containerClass}`}
    >
      {/* Ambient Radial Aura Glow */}
      <div className={`pointer-events-none absolute -left-6 -top-6 h-28 w-28 rounded-full blur-2xl ${config.glowClass}`} />

      {/* Animated Icon Badge */}
      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${config.iconBadgeClass}`}>
        {config.icon}
      </div>

      {/* Text Hierarchy */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-xs sm:text-sm font-bold tracking-tight text-text leading-snug">
          {item.title}
        </h4>
        {item.description && (
          <p className="mt-1 text-[11px] sm:text-xs text-muted leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Optional Action Button */}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer ${config.actionBtnClass}`}
          >
            <span>{item.action.label}</span>
            <FiArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="shrink-0 rounded-lg p-1 text-muted/60 hover:bg-black/5 hover:text-text dark:hover:bg-white/10 transition cursor-pointer"
      >
        <FiX size={15} />
      </button>

      {/* Subtle bottom progress indicator line */}
      <motion.span
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: item.duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${config.progressBarClass}`}
      />
    </motion.div>
  );
}

function getToastConfig(type: ToastType) {
  switch (type) {
    case "success":
      return {
        containerClass:
          "bg-white/90 dark:bg-slate-900/90 border-emerald-500/30 shadow-emerald-500/10",
        glowClass: "bg-emerald-500/25",
        iconBadgeClass:
          "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/30",
        icon: <FiCheckCircle size={18} className="stroke-[2.5]" />,
        actionBtnClass: "bg-emerald-600 text-white hover:bg-emerald-700",
        progressBarClass: "bg-gradient-to-r from-emerald-500 to-teal-400",
      };
    case "cart":
      return {
        containerClass:
          "bg-white/90 dark:bg-slate-900/90 border-primary/30 shadow-primary/10",
        glowClass: "bg-primary/30",
        iconBadgeClass:
          "bg-gradient-to-tr from-primary to-violet-600 text-white shadow-primary/30",
        icon: <FiShoppingBag size={18} className="stroke-[2.5]" />,
        actionBtnClass: "bg-primary text-white hover:bg-primary-hover",
        progressBarClass: "bg-gradient-to-r from-primary to-violet-600",
      };
    case "wishlist":
      return {
        containerClass:
          "bg-white/90 dark:bg-slate-900/90 border-rose-500/30 shadow-rose-500/10",
        glowClass: "bg-rose-500/25",
        iconBadgeClass:
          "bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-rose-500/30",
        icon: <FiHeart size={18} className="fill-white stroke-[2.5]" />,
        actionBtnClass: "bg-rose-600 text-white hover:bg-rose-700",
        progressBarClass: "bg-gradient-to-r from-rose-500 to-pink-500",
      };
    case "error":
      return {
        containerClass:
          "bg-white/90 dark:bg-slate-900/90 border-red-500/30 shadow-red-500/10",
        glowClass: "bg-red-500/25",
        iconBadgeClass:
          "bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-red-500/30",
        icon: <FiAlertCircle size={18} className="stroke-[2.5]" />,
        actionBtnClass: "bg-red-600 text-white hover:bg-red-700",
        progressBarClass: "bg-gradient-to-r from-red-600 to-rose-600",
      };
    case "info":
    default:
      return {
        containerClass:
          "bg-white/90 dark:bg-slate-900/90 border-sky-500/30 shadow-sky-500/10",
        glowClass: "bg-sky-500/25",
        iconBadgeClass:
          "bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-sky-500/30",
        icon: <FiInfo size={18} className="stroke-[2.5]" />,
        actionBtnClass: "bg-sky-600 text-white hover:bg-sky-700",
        progressBarClass: "bg-gradient-to-r from-sky-500 to-indigo-500",
      };
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
