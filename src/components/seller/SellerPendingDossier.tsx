import React from "react";
import { MyStore } from "@/lib/api/sellers";
import { FiRefreshCw, FiEdit3, FiShield } from "react-icons/fi";

export interface SellerPendingDossierProps {
  store: MyStore;
  onRefresh: () => void;
  onEdit: () => void;
}

export function SellerPendingDossier({
  store,
  onRefresh,
  onEdit,
}: SellerPendingDossierProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-primary">Store Dossier</span>
          <h2 className="text-lg font-black text-text">{store.storeName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-text hover:bg-muted-bg transition cursor-pointer"
          >
            <FiRefreshCw size={12} /> Check Status
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition cursor-pointer"
          >
            <FiEdit3 size={12} /> Edit Details
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        <div className="rounded-2xl border border-border bg-muted-bg/30 p-4 space-y-2">
          <p className="font-bold text-text">Store Identity</p>
          <p className="text-muted">
            <strong className="text-text">Category:</strong> {store.businessInfo?.category || "General"}
          </p>
          <p className="text-muted">
            <strong className="text-text">Description:</strong> {store.description}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-muted-bg/30 p-4 space-y-2">
          <p className="font-bold text-text">Legal & Payout Info</p>
          <p className="text-muted">
            <strong className="text-text">Owner:</strong> {store.businessInfo?.ownerName || "Provided"}
          </p>
          <p className="text-muted">
            <strong className="text-text">Phone:</strong> {store.businessInfo?.contactPhone || "Provided"}
          </p>
          <p className="text-muted">
            <strong className="text-text">NID / License:</strong> {store.businessInfo?.nidOrTradeLicense || "Verified"}
          </p>
          <p className="text-muted">
            <strong className="text-text">Payout Channel:</strong>{" "}
            {store.businessInfo?.payoutMethod?.toUpperCase()} ({store.businessInfo?.payoutAccountNumber})
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-primary/5 p-4 text-[11px] text-muted flex items-start gap-2.5">
        <FiShield className="text-primary mt-0.5 shrink-0" size={16} />
        <span>
          Need immediate priority verification for your registered enterprise? Contact seller-support@shopnest.com with your trade license copy.
        </span>
      </div>
    </div>
  );
}
