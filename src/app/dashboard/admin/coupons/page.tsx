"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { StatCard } from "@/components/dashboard/DashboardUI";
import { CouponModal } from "@/components/coupons/CouponModal";
import { CouponTable } from "@/components/coupons/CouponTable";
import { CouponRequestCard } from "@/components/coupons/CouponRequestCard";
import { approveCoupon, deleteCoupon, getCoupons, rejectCoupon } from "@/lib/api/coupons";
import { getErrorMessage } from "@/lib/core/errors";
import { useConfirm } from "@/context/ConfirmDialogContext";
import type { Coupon } from "@/types/coupon";

type AdminTab = "pending" | "all" | "sitewide";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
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

  const pending = useMemo(
    () => coupons.filter((c) => c.placement === "homepage" && c.approvalStatus === "pending"),
    [coupons]
  );
  const siteWide = useMemo(() => coupons.filter((c) => c.createdByRole === "admin"), [coupons]);

  const handleApprove = async (id: string) => {
    try {
      await approveCoupon(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectCoupon(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            Marketplace Governance
          </span>
          <h1 className="text-2xl font-bold text-text">Coupon Governance &amp; Approvals</h1>
          <p className="text-muted">
            Review seller homepage requests, audit every platform coupon, and manage admin site-wide campaigns.
          </p>
        </div>
        <Button
          variant="primary"
          className="cursor-pointer text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto"
          onPress={() => setIsModalOpen(true)}
        >
          + Add Site-Wide Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="🎟️" label="Total Coupons" value={coupons.length} note="Across the marketplace" />
        <StatCard icon="⏳" label="Pending Requests" value={pending.length} note="Awaiting your review" color="warning" />
        <StatCard
          icon="✅"
          label="Approved & Live"
          value={coupons.filter((c) => c.approvalStatus === "approved" && c.isActive).length}
          note="Currently active"
          color="success"
        />
        <StatCard icon="🌐" label="Admin Site-Wide" value={siteWide.length} note="Platform-funded campaigns" color="accent" />
      </div>

      {/* =====================================================
          VIEW FILTER BAR (Analytics Style)
      ===================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
        {/* Coupon View Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-muted">
            Coupon View:
          </span>

          <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
            {tab === "pending"
              ? "Pending Requests"
              : tab === "all"
                ? "All Platform Coupons"
                : "Admin Site-Wide"}{" "}
            Selected
          </span>
        </div>

        {/* Tab Buttons (Fixed position, no jumping) */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted-bg p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "pending"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            Pending Requests
          </button>
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            All Platform Coupons
          </button>
          <button
            type="button"
            onClick={() => setTab("sitewide")}
            className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 transition ${
              tab === "sitewide"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-text hover:shadow-sm"
            }`}
          >
            Admin Site-Wide
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && isLoading && <LoadingState message="Loading coupons..." />}

      {!error && !isLoading && tab === "pending" && (
        pending.length === 0 ? (
          <EmptyState title="No pending requests" description="All homepage placement requests are handled." />
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((coupon) => (
              <CouponRequestCard key={coupon.id} coupon={coupon} onApprove={handleApprove} onReject={handleReject} />
            ))}
          </div>
        )
      )}

      {!error && !isLoading && tab === "all" && (
        coupons.length === 0 ? (
          <EmptyState title="No coupons yet" description="No coupons have been created on the platform." />
        ) : (
          <CouponTable
            coupons={coupons}
            showOwner
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      )}

      {!error && !isLoading && tab === "sitewide" && (
        siteWide.length === 0 ? (
          <EmptyState
            title="No site-wide coupons yet"
            description="Create a platform-funded coupon that applies across the marketplace."
            actionLabel="Add Site-Wide Coupon"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">
                {siteWide.length} Active Site-Wide Campaign{siteWide.length > 1 ? "s" : ""}
              </span>
              <Button
                variant="primary"
                className="cursor-pointer text-xs font-bold shadow-sm"
                onPress={() => setIsModalOpen(true)}
              >
                + Add Site-Wide Coupon
              </Button>
            </div>
            <CouponTable coupons={siteWide} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )
      )}

      <CouponModal
        mode="admin"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreated={load}
        couponToEdit={editingCoupon}
      />
    </div>
  );
}