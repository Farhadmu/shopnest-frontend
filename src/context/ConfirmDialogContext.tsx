"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string | null;
  variant?: ConfirmVariant;
  onConfirm?: () => Promise<void> | void;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
  isOpen: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ConfirmVariant, { icon: string; color: string; btnClass: string; iconBg: string }> = {
  danger: {
    icon: "⚠️",
    color: "text-error",
    btnClass: "bg-error hover:bg-error/90 text-white shadow-error/20",
    iconBg: "bg-error/10",
  },
  warning: {
    icon: "⚡",
    color: "text-warning",
    btnClass: "bg-warning hover:bg-warning/90 text-white shadow-warning/20",
    iconBg: "bg-warning/10",
  },
  info: {
    icon: "ℹ️",
    color: "text-primary",
    btnClass: "bg-primary hover:bg-primary/90 text-white shadow-primary/20",
    iconBg: "bg-primary/10",
  },
};

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resolveRef = useRef<(value: boolean) => void>(() => {});
  const onConfirmRef = useRef<ConfirmOptions["onConfirm"]>(undefined);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      onConfirmRef.current = options.onConfirm;
      setState({
        ...options,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText === null ? null : (options.cancelText ?? "Cancel"),
        variant: options.variant ?? "danger",
        resolve,
        isOpen: true,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => (prev ? { ...prev, isOpen: false } : null));
    setIsLoading(false);
    resolveRef.current(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!state) return;
    setIsLoading(true);

    try {
      if (onConfirmRef.current) {
        await onConfirmRef.current();
      }
      setState((prev) => (prev ? { ...prev, isOpen: false } : null));
      resolveRef.current(true);
    } catch {
      resolveRef.current(false);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state?.isOpen) {
        handleClose();
      }
    };
    if (state?.isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [state?.isOpen, handleClose]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

    const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, damping: 24, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
  };

  const variantStyle = state ? VARIANT_STYLES[state.variant ?? "danger"] : VARIANT_STYLES.danger;

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state?.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-desc"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${variantStyle.iconBg}`}>
                    {variantStyle.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 id="confirm-dialog-title" className="text-lg font-bold text-text">
                      {state.title}
                    </h3>
                    <p id="confirm-dialog-desc" className="mt-1 text-sm text-muted leading-relaxed">
                      {state.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border bg-background/60 px-6 py-4">
                {state.cancelText && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.cancelText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`cursor-pointer rounded-lg px-5 py-2 text-sm font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${variantStyle.btnClass}`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </span>
                  ) : (
                    state.confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return context.confirm;
}
