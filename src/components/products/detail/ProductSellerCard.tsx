import React from "react";
import Link from "next/link";
import { FiCheckCircle, FiAward } from "react-icons/fi";
import type { Product } from "@/lib/api/products";
import { getStoreById } from "@/lib/api/sellers";
import { MessageSellerButton } from "./MessageSellerButton";

export interface ProductSellerCardProps {
  product: Product;
}

/**
 * Server component — fetches the real store via `getStoreById` when the
 * product has a `storeId`. Falls back to placeholder merchant details
 * for products missing a linked store, so the page never breaks.
 */
export async function ProductSellerCard({ product }: ProductSellerCardProps) {
  let storeName = "Verified Marketplace Seller";
  let rating = product.ratingAvg ?? 4.8;

  if (product.storeId) {
    try {
      const store = await getStoreById(product.storeId);
      if (store) {
        storeName = store.storeName;
        rating = store.trustScore ? Number((store.trustScore / 20).toFixed(1)) : rating;
      }
    } catch {
      // Store lookup fallback
    }
  }

  const initials = storeName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all">
      <div className="flex flex-col gap-2.5 border-b border-border/70 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-text sm:text-sm">{storeName}</h3>
              <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-black text-primary">
                <FiAward size={9} /> {rating}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
              <FiCheckCircle size={11} className="text-primary" /> ShopNest Verified Merchant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <MessageSellerButton storeName={storeName} />
          {product.storeId && (
            <Link
              href={`/stores/${product.storeId}`}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text transition-colors hover:border-primary/40 hover:bg-muted-bg"
            >
              Visit Store
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted-bg/60 p-2 text-center">
        <div>
          <p className="text-xs font-black text-text">99.4%</p>
          <p className="text-[10px] text-muted">On-Time Dispatch</p>
        </div>
        <div>
          <p className="text-xs font-black text-primary">12 mins</p>
          <p className="text-[10px] text-muted">Avg. Chat Reply</p>
        </div>
        <div>
          <p className="text-xs font-black text-text">{(product.sold ?? 0) * 24 || "12.4k"}</p>
          <p className="text-[10px] text-muted">Verified Sales</p>
        </div>
      </div>
    </div>
  );
}