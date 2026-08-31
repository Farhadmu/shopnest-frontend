"use client";

import React, { useState } from "react";
import { FiAlertOctagon, FiX, FiCheckCircle, FiUpload } from "react-icons/fi";
import { submitProductReport } from "@/lib/api/customer-intelligence-features";

export function ProductReportModal({
  productId,
  productTitle,
  isOpen,
  onClose,
}: {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<
    "wrong_info" | "misleading_image" | "wrong_specs" | "suspicious_seller" | "damaged_product" | "other"
  >("wrong_info");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await submitProductReport({
        productId,
        productTitle,
        category,
        description,
        evidenceUrls: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      alert(err?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <FiAlertOctagon size={20} />
            <h3 className="text-sm font-extrabold text-foreground">Report Listing Problem</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground">
            <FiX size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <FiCheckCircle className="mx-auto text-4xl text-emerald-500" />
            <h4 className="font-extrabold text-foreground text-sm">Report Submitted Successfully</h4>
            <p className="text-xs text-muted">
              Thank you for keeping ShopNest safe. Our admin compliance team will investigate this listing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">Issue Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="wrong_info">Wrong or Inaccurate Information</option>
                <option value="misleading_image">Misleading / Stolen Image</option>
                <option value="wrong_specs">Incorrect Hardware / Material Specs</option>
                <option value="suspicious_seller">Suspicious Seller / Counterfeit Item</option>
                <option value="damaged_product">Defective / Damaged Item Listing</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Describe the Problem *</label>
              <textarea
                rows={3}
                placeholder="Explain what is misleading, wrong, or violating platform guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Evidence Photo / Screenshot URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
