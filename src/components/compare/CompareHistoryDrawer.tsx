"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiClock, FiTrash2, FiExternalLink } from "react-icons/fi";
import { useSession } from "@/lib/auth-client";
import {
  getCompareHistory,
  clearCompareHistory,
} from "@/lib/api/customer-intelligence-features";
import { toast } from "@/context/ToastContext";

interface CompareHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadComparison: (productIds: string[]) => void;
}

export function CompareHistoryDrawer({
  isOpen,
  onClose,
  onLoadComparison,
}: CompareHistoryDrawerProps) {
  const { data: session } = useSession();
  const [historyItems, setHistoryItems] = useState<
    Array<{ id: string; title: string; productIds: string[]; category: string; createdAt: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !session?.user) return;
    setIsLoading(true);
    getCompareHistory()
      .then((res) => setHistoryItems(Array.isArray(res) ? res : []))
      .catch(() => setHistoryItems([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, session?.user]);

  const handleClear = async () => {
    try {
      await clearCompareHistory();
      setHistoryItems([]);
      toast.success("Comparison history cleared");
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear history");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted-bg/30">
          <div className="flex items-center gap-2">
            <FiClock className="text-primary w-5 h-5" />
            <div>
              <h3 className="font-extrabold text-sm text-foreground">
                Comparison History
              </h3>
              <p className="text-xs text-muted">Previously saved product comparisons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!session?.user ? (
            <div className="py-16 text-center text-xs text-muted space-y-2">
              <p className="font-bold text-foreground">Sign In to View History</p>
              <p>Your saved comparisons are linked to your account.</p>
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-xs text-muted">
              Loading comparison history...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted space-y-1">
              <p className="font-bold text-foreground">No saved comparisons</p>
              <p>When you compare products, click "Save" to keep them in your history.</p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-muted-bg/40 border border-border hover:border-primary/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-foreground">{item.title}</span>
                  <span className="text-muted text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {item.productIds?.length || 0} products compared • Category: {item.category}
                </p>

                <button
                  onClick={() => {
                    onLoadComparison(item.productIds || []);
                    onClose();
                  }}
                  className="w-full mt-2 py-1.5 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  Open Comparison
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {session?.user && historyItems.length > 0 && (
          <div className="p-4 border-t border-border bg-muted-bg/20 flex items-center justify-between">
            <button
              onClick={handleClear}
              className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted-bg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
