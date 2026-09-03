import React from "react";
import Link from "next/link";
import { MyStore } from "@/lib/api/sellers";
import { FiAlertTriangle } from "react-icons/fi";

export interface SellerSuspendedCardProps {
  store: MyStore;
}

export function SellerSuspendedCard({ store }: SellerSuspendedCardProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg">
        <FiAlertTriangle size={32} />
      </div>
      <h1 className="mt-4 text-2xl font-black text-text">Store Account Suspended</h1>
      <p className="mt-2 text-xs text-muted">
        Your seller store <strong>{store.storeName}</strong> has been suspended due to platform policy compliance. Please reach out to our Merchant Compliance desk.
      </p>
      <Link
        href="/support"
        className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-xs font-black text-white hover:bg-primary-hover transition"
      >
        Open Compliance Ticket
      </Link>
    </div>
  );
}
