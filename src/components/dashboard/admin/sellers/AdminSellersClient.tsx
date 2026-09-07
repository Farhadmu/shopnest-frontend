"use client";

import React, { useState, useMemo } from "react";
import { Panel } from "@/components/dashboard/DashboardUI";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import {
  listAdminSellers,
  updateAdminSellerStatus,
  getAdminSellerDetails,
  AdminStoreRecord,
  AdminSellerFullDetails,
  StoreStatus,
} from "@/lib/api/sellers";
import { SellerStatsCards, SellerCounts } from "./SellerStatsCards";
import { SellerFilterBar } from "./SellerFilterBar";
import { SellerTable } from "./SellerTable";
import { SellerKycModal } from "./SellerKycModal";
import { SellerRejectModal } from "./SellerRejectModal";

export interface AdminSellersClientProps {
  initialStores: AdminStoreRecord[];
}

export function AdminSellersClient({ initialStores }: AdminSellersClientProps) {
  const [stores, setStores] = useState<AdminStoreRecord[]>(initialStores);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [selectedSellerDetails, setSelectedSellerDetails] = useState<AdminSellerFullDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [rejectingStore, setRejectingStore] = useState<AdminStoreRecord | null>(null);

  const loadStores = async (status = statusFilter, search = searchQuery) => {
    setLoading(true);
    try {
      const data = await listAdminSellers({
        status: status !== "all" ? status : undefined,
        search: search.trim() || undefined,
      });
      setStores((data as any)?.data ?? data ?? []);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    loadStores(newStatus, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStores(statusFilter, searchQuery);
  };

  const handleViewDetails = async (store: AdminStoreRecord) => {
    const storeId = store._id || store.id;
    setLoadingDetails(true);
    try {
      const full = await getAdminSellerDetails(storeId);
      setSelectedSellerDetails((full as any)?.data ?? full ?? (store as AdminSellerFullDetails));
    } catch {
      setSelectedSellerDetails(store as AdminSellerFullDetails);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: StoreStatus, reason?: string) => {
    setActionLoadingId(id);
    try {
      await updateAdminSellerStatus(id, { status, rejectionReason: reason });
      await loadStores();

      if (selectedSellerDetails && (selectedSellerDetails.id === id || selectedSellerDetails._id === id)) {
        setSelectedSellerDetails((prev) => (prev ? { ...prev, status, rejectionReason: reason } : null));
      }
      setRejectingStore(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update seller status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Counts
  const counts: SellerCounts = useMemo(() => {
    return {
      all: stores.length,
      pending: stores.filter((s) => s.status === "pending").length,
      approved: stores.filter((s) => s.status === "approved").length,
      rejected: stores.filter((s) => s.status === "rejected").length,
      suspended: stores.filter((s) => s.status === "suspended").length,
    };
  }, [stores]);

  return (
    <>
      {/* 4 Summary Stat Cards */}
      <SellerStatsCards counts={counts} />

      <Panel title="Seller Store Applications">
        {/* Search, Filter & Refresh Controls */}
        <SellerFilterBar
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onRefresh={() => loadStores()}
          counts={counts}
        />

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
                <div className="h-5 w-48 rounded-lg bg-muted-bg mb-2" />
                <div className="h-4 w-72 rounded-lg bg-muted-bg" />
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState
            icon="🏬"
            title="No seller stores found"
            description="No applications match your selected filter or search parameters."
          />
        ) : (
          /* Reusable Seller Table */
          <SellerTable
            stores={stores}
            onViewDetails={handleViewDetails}
            onApprove={(id) => handleUpdateStatus(id, "approved")}
            onRejectPrompt={(s) => setRejectingStore(s)}
            onSuspend={(id) => handleUpdateStatus(id, "suspended")}
            actionLoadingId={actionLoadingId}
          />
        )}
      </Panel>

      {/* Comprehensive KYC & Info Dossier Modal */}
      <SellerKycModal
        seller={selectedSellerDetails}
        onClose={() => setSelectedSellerDetails(null)}
        onApprove={(id) => handleUpdateStatus(id, "approved")}
        onRejectPrompt={(s) => {
          setSelectedSellerDetails(null);
          setRejectingStore(s);
        }}
        onSuspend={(id) => handleUpdateStatus(id, "suspended")}
        isProcessing={Boolean(actionLoadingId)}
      />

      {/* Rejection Feedback Modal */}
      <SellerRejectModal
        store={rejectingStore}
        onClose={() => setRejectingStore(null)}
        onConfirmReject={(id, reason) => handleUpdateStatus(id, "rejected", reason)}
        isProcessing={Boolean(actionLoadingId)}
      />
    </>
  );
}
