"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/dashboard/DashboardUI";
import { CouponModal } from "@/components/coupons/CouponModal";
import { CouponTable } from "@/components/coupons/CouponTable";
import { getErrorMessage } from "@/lib/core/errors";
import { deleteCoupon, getCoupons } from "@/lib/api/coupons";
import { useConfirm } from "@/context/ConfirmDialogContext";
import type { Coupon } from "@/types/coupon";

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [tab, setTab] = useState<"store" | "private" | "homepage">("store");
  const confirm = useConfirm();

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setCoupons(await getCoupons());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void getCoupons()
      .then((data) => {
        if (isMounted) {
          setCoupons(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // "store" coupons live on the seller's own store page (auto-approved, live instantly).
  // "private" coupons are share-only codes — shown nowhere until the seller distributes the code.
  // Both are already live without needing admin approval, but they live on separate tabs.
  const storeCoupons = useMemo(() => coupons.filter((c) => c.placement === "store"), [coupons]);
  const privateCoupons = useMemo(() => coupons.filter((c) => c.placement === "private"), [coupons]);
  const homepageCoupons = useMemo(() => coupons.filter((c) => c.placement === "homepage"), [coupons]);
  const pendingCount = useMemo(
    () => homepageCoupons.filter((c) => c.approvalStatus === "pending").length,
    [homepageCoupons]
  );

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Coupon?",
      message: "Are you sure you want to delete this coupon? This action cannot be undone.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [confirm]);

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const visible = tab === "store" ? storeCoupons : tab === "private" ? privateCoupons : homepageCoupons;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Coupons &amp; Promotional Deals</h1>
          <p className="text-muted">
            Create store-exclusive discount codes or request placement on the marketplace homepage.
          </p>
        </div>
        <Button
          variant="primary"
          onPress={() => {
            setEditingCoupon(null);
            setIsModalOpen(true);
          }}
        >
          + New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon="🏷️" label="Store Coupons" value={storeCoupons.length} note="Active on your store page" />
        <StatCard icon="🔒" label="Private Coupons" value={privateCoupons.length} note="Share-only codes" color="accent" />
        <StatCard
          icon="🚀"
          label="Homepage Requests"
          value={homepageCoupons.length}
          note="Awaiting or live on homepage"
          color="accent"
        />
        <StatCard icon="⏳" label="Pending Review" value={pendingCount} note="Waiting on admin approval" color="warning" />
        <StatCard
          icon="🎟️"
          label="Total Redemptions"
          value={coupons.reduce((sum, c) => sum + c.usedCount, 0)}
          note="Across all coupons"
          color="success"
        />
      </div>

      {/* =====================================================
          VIEW FILTER BAR (Admin / Analytics Style)
      ===================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        {/* Coupon View Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-muted">
            Coupon View:
          </span>

          <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
            {tab === "store" ? "My Store Coupons" : tab === "private" ? "Private Coupons" : "Homepage Requests"}{" "}
            Selected
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted-bg p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("store")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "store"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            My Store Coupons
          </button>
          <button
            type="button"
            onClick={() => setTab("private")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "private"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            Private / Share Only
          </button>
          <button
            type="button"
            onClick={() => setTab("homepage")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "homepage"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            Homepage Requests
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={loadCoupons} />}
      {!error && isLoading && <LoadingState message="Loading coupons..." />}

      {!error && !isLoading && visible.length === 0 && (
        <EmptyState
          title={
            tab === "store"
              ? "No store coupons yet"
              : tab === "private"
                ? "No private coupons yet"
                : "No homepage requests yet"
          }
          description={
            tab === "store"
              ? "Create a coupon to offer discounts to your customers."
              : tab === "private"
                ? "Create a private discount code to share directly with your customers — it won't appear on your store or the homepage."
                : "Submit a coupon for review to feature it on the marketplace homepage."
          }
          actionLabel="Create Coupon"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {!error && !isLoading && visible.length > 0 && (
        <CouponTable coupons={visible} onDelete={handleDelete} onEdit={handleEdit} />
      )}

      <CouponModal
        mode="seller"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreated={loadCoupons}
        couponToEdit={editingCoupon}
      />
    </div>
  );
}
