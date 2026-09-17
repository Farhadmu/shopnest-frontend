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
  const [allStores, setAllStores] = useState<AdminStoreRecord[]>(initialStores);
  const [stores, setStores] = useState<AdminStoreRecord[]>(initialStores);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [selectedSellerDetails, setSelectedSellerDetails] = useState<AdminSellerFullDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [rejectingStore, setRejectingStore] = useState<AdminStoreRecord | null>(null);

  const filterStoresLocally = (list: AdminStoreRecord[], status = statusFilter, search = searchQuery) => {
    let result = list;
    if (status && status !== "all") {
      result = result.filter((s) => s.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) => {
        const catName =
          typeof s.businessInfo?.categoryId === "object" && s.businessInfo?.categoryId !== null
            ? (s.businessInfo.categoryId as { name?: string }).name?.toLowerCase() || ""
            : typeof s.businessInfo?.categoryId === "string"
            ? s.businessInfo.categoryId.toLowerCase()
            : "";
        return (
          s.storeName?.toLowerCase().includes(q) ||
          s.slug?.toLowerCase().includes(q) ||
          s.ownerFullName?.toLowerCase().includes(q) ||
          s.ownerEmail?.toLowerCase().includes(q) ||
          s.businessInfo?.ownerName?.toLowerCase().includes(q) ||
          s.businessInfo?.contactPhone?.toLowerCase().includes(q) ||
          s.businessInfo?.nidOrTradeLicense?.toLowerCase().includes(q) ||
          catName.includes(q)
        );
      });
    }
    return result;
  };

  const loadStores = async (status = statusFilter, search = searchQuery) => {
    setLoading(true);
    try {
      const data = await listAdminSellers();
      const freshAll = (data as any)?.data ?? data ?? [];
      setAllStores(freshAll);
      setStores(filterStoresLocally(freshAll, status, search));
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setStores(filterStoresLocally(allStores, newStatus, searchQuery));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStores(filterStoresLocally(allStores, statusFilter, searchQuery));
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setStores(filterStoresLocally(allStores, statusFilter, val));
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

  // Counts calculated from ALL stores, so top summary cards & badges never collapse when filtering
  const counts: SellerCounts = useMemo(() => {
    return {
      all: allStores.length,
      pending: allStores.filter((s) => s.status === "pending").length,
      approved: allStores.filter((s) => s.status === "approved").length,
      rejected: allStores.filter((s) => s.status === "rejected").length,
      suspended: allStores.filter((s) => s.status === "suspended").length,
    };
  }, [allStores]);

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
          onSearchChange={handleSearchChange}
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
