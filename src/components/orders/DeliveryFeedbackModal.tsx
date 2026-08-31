"use client";

import React, { useState } from "react";
import { FiTruck, FiStar, FiX, FiCheckCircle } from "react-icons/fi";
import { submitDeliveryFeedback } from "@/lib/api/customer-intelligence-features";

export function DeliveryFeedbackModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [speedRating, setSpeedRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [courierBehaviorRating, setCourierBehaviorRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const overall = Math.round((speedRating + packagingRating + courierBehaviorRating) / 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitDeliveryFeedback({
        orderId,
        speedRating,
        packagingRating,
        courierBehaviorRating,
        overallRating: overall,
        feedbackText,
      });
      setIsDone(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err?.message || "Failed to submit delivery feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarSelector = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 text-xs">
      <span className="font-semibold text-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <FiStar
              size={16}
              className={star <= value ? "fill-amber-400 text-amber-400" : "text-border"}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary">
            <FiTruck size={20} />
            <h3 className="text-sm font-extrabold text-foreground">Delivery Experience Feedback</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground">
            <FiX size={18} />
          </button>
        </div>

        {isDone ? (
          <div className="py-8 text-center space-y-2">
            <FiCheckCircle className="mx-auto text-4xl text-emerald-500" />
            <h4 className="font-extrabold text-foreground text-sm">Thank You for Your Feedback!</h4>
            <p className="text-xs text-muted">
              Your courier rating helps improve delivery reliability for everyone across Bangladesh.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <StarSelector label="Delivery Speed & Punctuality" value={speedRating} onChange={setSpeedRating} />
              <StarSelector label="Package Safety & Condition" value={packagingRating} onChange={setPackagingRating} />
              <StarSelector label="Courier Rider Behavior & Service" value={courierBehaviorRating} onChange={setCourierBehaviorRating} />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">Additional Feedback (Optional)</label>
              <textarea
                rows={2}
                placeholder="Share any details about the delivery or rider experience..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                disabled={isSubmitting}
                className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Delivery Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
