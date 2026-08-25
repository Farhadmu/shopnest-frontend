"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist, WishlistItem } from "@/lib/api/wishlist";
export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const load = () => {
    getWishlist()
      .then(setItems)
      .catch(() => setItems([]));
  };
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-3xl font-black">My Wishlist</h1>
        <p className="mt-2 text-sm text-muted">Your saved products for future purchase.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted">
          No saved products yet.{" "}
          <Link href="/products" className="font-bold text-primary">
            Discover products →
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.productId} className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-4xl">🛍️</div>
              <h2 className="mt-4 font-black">Product #{i.productId.slice(-8)}</h2>
              <p className="mt-1 text-xs text-muted">
                Saved {new Date(i.addedAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/products/${i.productId}`}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-xs font-bold text-white"
                >
                  View
                </Link>
                <button
                  onClick={() => removeFromWishlist(i.productId).then(load)}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
