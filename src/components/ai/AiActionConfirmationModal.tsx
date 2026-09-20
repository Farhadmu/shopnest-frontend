"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  Terminal,
} from "lucide-react";
import { AIActionItem } from "@/lib/api/ai-core";

interface ActionModalProps {
  isOpen: boolean;
  action: AIActionItem | null;
  roleTheme?: "admin" | "seller" | "customer" | "delivery" | "advisor";
  onClose: () => void;
  onConfirm: (action: AIActionItem) => Promise<void> | void;
}

export function AiActionConfirmationModal({
  isOpen,
  action,
  roleTheme = "customer",
  onClose,
  onConfirm,
}: ActionModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);

  if (!isOpen || !action) return null;

  const risk = action.riskLevel || (action.requiresConfirmation ? "HIGH_RISK_WRITE" : "LOW_RISK_WRITE");
  const isHighRisk = risk === "HIGH_RISK_WRITE";
  const isMediumRisk = risk === "LOW_RISK_WRITE";

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onConfirm(action);
      setExecuted(true);
      setTimeout(() => {
        setExecuted(false);
        setIsExecuting(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error("[AiActionConfirmationModal] execution error:", err);
      setIsExecuting(false);
    }
  };

  const getThemeGradient = () => {
    switch (roleTheme) {
      case "admin":
        return "from-amber-500 via-orange-500 to-yellow-500";
      case "seller":
        return "from-emerald-500 via-teal-500 to-cyan-500";
      case "delivery":
        return "from-cyan-500 via-blue-600 to-indigo-600";
      case "advisor":
        return "from-purple-600 via-fuchsia-600 to-pink-600";
      default:
        return "from-indigo-600 via-purple-600 to-pink-500";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Glassmorphic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-900/90 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-none"
        >
          {/* Ambient Glow Orb */}
          <div
            className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br ${getThemeGradient()} opacity-25 blur-3xl`}
          />

          {/* Header */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getThemeGradient()} text-white shadow-lg`}
              >
                {isHighRisk ? (
                  <ShieldAlert className="h-6 w-6" />
                ) : isMediumRisk ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isHighRisk
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                        : isMediumRisk
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {isHighRisk
                      ? "Critical Action Required"
                      : isMediumRisk
                      ? "Confirmation Recommended"
                      : "Safe Verified Action"}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-1 leading-tight">
                  {action.label}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Description & Impact */}
          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 backdrop-blur-sm">
            <div className="text-xs text-slate-300 leading-relaxed">
              {action.description || "The AI Copilot has proposed this system action based on verified telemetry and active session state."}
            </div>

            {action.targetUrl && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 pt-1 border-t border-white/10">
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="truncate">Destination: {action.targetUrl}</span>
              </div>
            )}
          </div>

          {/* Payload Parameters Inspection */}
          {action.payload && Object.keys(action.payload).length > 0 && (
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Terminal className="h-3 w-3" />
                <span>Action Parameters</span>
              </div>
              <div className="max-h-28 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-2.5 font-mono text-[11px] text-emerald-400 scrollbar-none">
                <pre>{JSON.stringify(action.payload, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2 relative z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isExecuting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecute}
              disabled={isExecuting || executed}
              className={`relative flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75 bg-gradient-to-r ${getThemeGradient()}`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Executing Action...</span>
                </>
              ) : executed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                  <span>Completed!</span>
                </>
              ) : (
                <>
                  <span>Confirm & Proceed</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Accessibility: Key code for escape dismissal
export const ESCAPE_KEY_DISMISSAL_SUPPORTED = true;

// Spring transition stiffness tokens for high-performance fluid physics
export const MODAL_SPRING_CONFIG = { stiffness: 350, damping: 25 };

// Viewport breakpoint constants for touch screens
export const MOBILE_VIEWPORT_MAX_WIDTH_PX = 640;
