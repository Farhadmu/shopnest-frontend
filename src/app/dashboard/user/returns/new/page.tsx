"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell, Panel } from "@/components/dashboard/DashboardUI";
import { userDashboardLinks } from "@/lib/constants/dashboard-nav";
import { getReturnEligibility, createReturnRequest, type ReturnEligibility } from "@/lib/api/returns";
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiUpload,
  FiAlertCircle,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";

const REASONS = [
  "Damaged Product",
  "Wrong Product",
  "Defective Product",
  "Missing Parts",
  "Not as Described",
  "Wrong Size",
  "Quality Issue",
  "Other",
];

export default function CustomerReturnFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const productId = searchParams.get("productId") || "";

  const [eligibility, setEligibility] = useState<ReturnEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [pickupAddress, setPickupAddress] = useState("");
  const [imageInput, setImageInput] = useState("");

  const loadEligibility = useCallback(async () => {
    if (!orderId || !productId) return;
    setLoading(true);
    try {
      const data = await getReturnEligibility(orderId, productId);
      setEligibility(data);
      if (data.pickupAddress) setPickupAddress(data.pickupAddress);
    } catch (err: any) {
      setError(err?.message || "Failed to load return eligibility");
    } finally {
      setLoading(false);
    }
  }, [orderId, productId]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const handleAddEvidence = () => {
    if (!imageInput.trim()) return;
    if (evidenceUrls.length >= 5) return;
    setEvidenceUrls((prev) => [...prev, imageInput.trim()]);
    setImageInput("");
  };

  const handleRemoveEvidence = (idx: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility || !reason || !description) {
      setError("Please fill in all required fields");
      return;
    }
    if (quantity < 1 || quantity > (eligibility.orderedQuantity || 1)) {
      setError(`Quantity must be between 1 and ${eligibility.orderedQuantity}`);
      return;
    }
    if (description.length > 500) {
      setError("Description must not exceed 500 characters");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createReturnRequest({
        orderId: eligibility.orderId,
        productId,
        productTitle: eligibility.productTitle,
        productImage: eligibility.productImage || undefined,
        sellerId: eligibility.sellerId,
        type: "return",
        reason,
        description,
        quantity,
        evidenceUrls,
        pickupAddress,
        sellerReturnAddress: "",
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId || !productId) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-2xl font-black text-foreground">Invalid Return Request</h1>
          <p className="mt-2 text-sm text-muted">Missing order or product information. Please initiate return from your order details page.</p>
          <Link href="/dashboard/user/orders" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
            <FiArrowLeft /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground">Checking Return Eligibility...</h2>
      </div>
    );
  }

  if (!eligibility || !eligibility.isEligible) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <FiXCircle className="mx-auto text-4xl text-red-500 mb-3" />
          <h1 className="text-2xl font-black text-foreground">Return Not Eligible</h1>
          <p className="mt-2 text-sm text-muted">
            {eligibility?.reason || "This product is not eligible for return. It may be outside the return window or already returned."}
          </p>
          <Link href={`/dashboard/user/orders/${orderId}`} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
            <FiArrowLeft /> Back to Order
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
          <FiCheckCircle className="mx-auto text-4xl text-emerald-500 mb-3" />
          <h1 className="text-2xl font-black text-foreground">Return Request Submitted</h1>
          <p className="mt-2 text-sm text-muted">Your return request has been submitted successfully. The seller will review it shortly.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard/user/returns" className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold">
              View My Returns
            </Link>
            <Link href="/dashboard/user/orders" className="px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expectedRefund = Number((eligibility.unitPrice * quantity).toFixed(2));

  return (
    <DashboardShell
      role="Customer"
      title="Submit Return Request"
      subtitle="Fill in the details below to initiate your return."
      links={userDashboardLinks}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Product Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {eligibility.productImage && (
              <img src={eligibility.productImage} alt={eligibility.productTitle} className="w-20 h-20 rounded-xl object-cover border border-border" />
            )}
            <div className="flex-1">
              <h3 className="text-base font-black text-foreground">{eligibility.productTitle}</h3>
              <p className="text-xs text-muted mt-1">Order: #{eligibility.orderIdShort}</p>
              <p className="text-xs text-muted">Unit Price: ৳{eligibility.unitPrice?.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">Expected Refund: ৳{expectedRefund.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Reason */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-muted">Return Details</h3>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Return Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="">Select a reason</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Description (max 500 chars) *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                required
                rows={4}
                maxLength={500}
                placeholder="Describe the issue in detail..."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none"
              />
              <p className="text-[10px] text-muted mt-1">{description.length}/500 characters</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Quantity *</label>
              <input
                type="number"
                min={1}
                max={eligibility.orderedQuantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary"
              />
              <p className="text-[10px] text-muted mt-1">Max: {eligibility.orderedQuantity}</p>
            </div>
          </div>

          {/* Evidence Images */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-muted flex items-center gap-1.5">
              <FiUpload className="text-primary" /> Evidence Images (max 5)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddEvidence}
                disabled={evidenceUrls.length >= 5}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </div>
            {evidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="w-16 h-16 rounded-xl object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Address */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-muted flex items-center gap-1.5">
              <FiMapPin className="text-primary" /> Pickup Address
            </h3>
            <textarea
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
              rows={2}
              placeholder="Enter your full address for pickup..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-bold text-red-600 flex items-center gap-2">
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link href={`/dashboard/user/orders/${orderId}`} className="px-5 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted-bg transition">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !reason || !description || !pickupAddress}
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-hover transition disabled:opacity-50 cursor-pointer shadow-md"
            >
              {submitting ? "Submitting..." : "Submit Return Request"}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
