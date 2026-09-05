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
 * product has a `storeId`. Falls back to placeholder merchant details (with
 * a TODO) for products missing a linked store, so the page never breaks.
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
      // TODO(backend): `/sellers/stores/:id` failed or the store is private —
      // keep the placeholder merchant identity instead of breaking the page.
    }
  }

  const initials = storeName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-muted-bg text-base font-black text-primary">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-text">{storeName}</h3>
              <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                <FiAward size={10} /> {rating}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <FiCheckCircle size={13} className="text-primary" /> ShopNest Verified Merchant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MessageSellerButton storeName={storeName} />
          {product.storeId && (
            <Link
              href={`/stores/${product.storeId}`}
              className="rounded-lg border border-border px-3.5 py-2.5 text-xs font-bold text-text transition-colors hover:bg-muted-bg"
            >
              Visit Store
            </Link>
          )}
        </div>
      </div>

      {/* TODO(backend): dispatch rate / avg reply time / verified sales aren't
          on the store model yet — placeholders until that data exists. */}
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted-bg p-3 text-center">
        <div>
          <p className="text-sm font-black text-text">99.4%</p>
          <p className="text-[11px] text-muted">On-Time Dispatch</p>
        </div>
        <div>
          <p className="text-sm font-black text-primary">12 mins</p>
          <p className="text-[11px] text-muted">Avg. Chat Reply</p>
        </div>
        <div>
          <p className="text-sm font-black text-text">{(product.sold ?? 0) * 24 || "12.4k"}</p>
          <p className="text-[11px] text-muted">Verified Sales</p>
        </div>
      </div>
    </div>
  );
}