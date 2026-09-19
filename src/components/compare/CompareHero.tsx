"use client";

import React, { useState } from "react";
import { FiPlus, FiShare2, FiBookmark, FiTrash2, FiClock, FiCheck, FiLayers } from "react-icons/fi";
import { toast } from "@/context/ToastContext";
import { useSession } from "@/lib/auth-client";
import { saveCompareHistory } from "@/lib/api/customer-intelligence-features";

interface CompareHeroProps {
  productCount: number;
  maxLimit: number;
  productIds: string[];
  onOpenAddModal: () => void;
  onOpenHistoryDrawer: () => void;
  onClearAll: () => void;
  canCompare: boolean;
}

export function CompareHero({
  productCount,
  maxLimit,
  productIds,
  onOpenAddModal,
  onOpenHistoryDrawer,
  onClearAll,
  canCompare,
}: CompareHeroProps) {
  const { data: session } = useSession();
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Comparison link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.info("Failed to copy link. You can copy the URL from your browser address bar.");
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.info("Sign in to save this comparison to your account history.");
      return;
    }
    if (productIds.length < 2) {
      toast.error("Add at least 2 products to save a comparison.");
      return;
    }

    setIsSaving(true);
    try {
      await saveCompareHistory(`Compare (${productCount} Products)`, productIds, "Workspace");
      toast.success("Comparison saved to your history!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save comparison.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-6 sm:p-8 shadow-sm">
      {/* Background glow subtle effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
            <FiLayers className="w-3.5 h-3.5" />
            Decision Intelligence Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
            Compare Products Side-by-Side
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Evaluate specifications, real verified reviews, seller trust scores, delivery timelines, and AI-powered value trade-offs in one structured workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Comparison Count Pill */}
          <div className="px-3.5 py-2 rounded-xl bg-muted-bg border border-border text-xs font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Compared: <span className="text-primary font-black">{productCount}</span> / {maxLimit}
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistoryDrawer}
            className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted-bg border border-border text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="View Comparison History"
          >
            <FiClock className="text-muted" /> History
          </button>

          {/* Share Button */}
          {canCompare && (
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted-bg border border-border text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Copy Shareable Link"
            >
              {isCopied ? <FiCheck className="text-emerald-500" /> : <FiShare2 className="text-primary" />}
              {isCopied ? "Copied" : "Share"}
            </button>
          )}

          {/* Save to History Button */}
          {canCompare && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted-bg border border-border text-xs font-bold text-foreground transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60"
              title="Save to Account"
            >
              <FiBookmark className="text-amber-500" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            disabled={productCount >= maxLimit}
            className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <FiPlus className="w-4 h-4" /> Add Product
          </button>

          {/* Clear All */}
          {productCount > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 text-muted hover:text-red-500 rounded-xl hover:bg-red-500/10 transition-all text-xs"
              title="Clear Comparison"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
