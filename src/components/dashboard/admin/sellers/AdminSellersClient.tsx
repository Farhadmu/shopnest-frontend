"use client";

import React, { useState, useMemo } from "react";
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
import { SellerSuspendModal } from "./SellerSuspendModal";

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
  const [suspendingStore, setSuspendingStore] = useState<AdminStoreRecord | null>(null);

  const filterStoresLocally = (list: AdminStoreRecord[], status = statusFilter, search = searchQuery) => {
    let result = list;
    if (status === "appeals") {
      result = result.filter((s) => s.status === "suspended" && Boolean(s.appeal?.reason));
    } else if (status && status !== "all") {
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
      await updateAdminSellerStatus(id, {
        status,
        rejectionReason: reason,
        suspensionReason: status === "suspended" ? reason : undefined,
      });
      await loadStores();

      if (selectedSellerDetails && (selectedSellerDetails.id === id || selectedSellerDetails._id === id)) {
        setSelectedSellerDetails((prev) =>
          prev
            ? {
                ...prev,
                status,
                rejectionReason: reason,
                suspensionReason: status === "suspended" ? reason : undefined,
              }
            : null
        );
      }
      setRejectingStore(null);
      setSuspendingStore(null);
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
      appeals: allStores.filter((s) => s.status === "suspended" && Boolean(s.appeal?.reason)).length,
    };
  }, [allStores]);

  return (
    <div className="space-y-6">
      {/* 5 Interactive Metric Cards with Direct Filter Trigger */}
      <SellerStatsCards
        counts={counts}
        activeFilter={statusFilter}
        onFilterSelect={handleStatusChange}
      />

      {/* Search, Filter & Refresh Controls Bar */}
      <SellerFilterBar
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onRefresh={() => loadStores()}
        counts={counts}
      />

      {/* Stores List Container */}
      <div className="space-y-4">
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
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-xs">
            <EmptyState
              icon="🏬"
              title="No seller stores found"
              description="No applications match your selected filter or search parameters."
            />
          </div>
        ) : (
          /* Reusable Seller Table */
          <SellerTable
            stores={stores}
            onViewDetails={handleViewDetails}
            onApprove={(id) => handleUpdateStatus(id, "approved")}
            onRejectPrompt={(s) => setRejectingStore(s)}
            onSuspendPrompt={(s) => setSuspendingStore(s)}
            actionLoadingId={actionLoadingId}
          />
        )}
      </div>

      {/* Comprehensive KYC & Info Dossier Modal */}
      <SellerKycModal
        seller={selectedSellerDetails}
        onClose={() => setSelectedSellerDetails(null)}
        onApprove={(id) => handleUpdateStatus(id, "approved")}
        onRejectPrompt={(s) => {
          setSelectedSellerDetails(null);
          setRejectingStore(s);
        }}
        onSuspendPrompt={(s) => {
          setSelectedSellerDetails(null);
          setSuspendingStore(s);
        }}
        isProcessing={Boolean(actionLoadingId)}
      />

      {/* Rejection Feedback Modal */}
      <SellerRejectModal
        store={rejectingStore}
        onClose={() => setRejectingStore(null)}
        onConfirmReject={(id, reason) => handleUpdateStatus(id, "rejected", reason)}
        isProcessing={Boolean(actionLoadingId)}
      />

      {/* Suspension Reason Modal */}
      <SellerSuspendModal
        store={suspendingStore}
        onClose={() => setSuspendingStore(null)}
        onConfirmSuspend={(id, reason) => handleUpdateStatus(id, "suspended", reason)}
        isProcessing={Boolean(actionLoadingId)}
      />
    </div>
  );
}
