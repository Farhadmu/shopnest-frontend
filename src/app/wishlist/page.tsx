"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getWishlist, removeFromWishlist, WishlistItem } from "@/lib/api/wishlist";
import { getGuestWishlist, removeGuestWishlistItem } from "@/lib/guest-store";
import { LoadingState } from "@/components/common/LoadingState";

export default function WishlistPage() {
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);

    if (!session?.user) {
      // Guest mode
      const guestItems = getGuestWishlist();
      setItems(guestItems);
      setIsLoading(false);
      return;
    }

    // Logged-in mode
    getWishlist()
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      })
      .catch(() => {
        setItems([]);
        setIsLoading(false);
      });
  }, [session]);

  useEffect(() => {
    if (!isPending) {
      load();
    }
  }, [isPending, load]);

  // Listen for guest wishlist updates
  useEffect(() => {
    if (!session?.user) {
      const handleGuestWishlistUpdate = () => {
        setItems(getGuestWishlist());
      };
      window.addEventListener("guest_wishlist_updated", handleGuestWishlistUpdate);
      return () => {
        window.removeEventListener("guest_wishlist_updated", handleGuestWishlistUpdate);
      };
    }
  }, [session]);

  const handleRemove = async (productId: string) => {
    if (!session?.user) {
      const updated = removeGuestWishlistItem(productId);
      setItems(updated);
      return;
    }

    try {
      await removeFromWishlist(productId);
      load();
    } catch {
      // Ignore error
    }
  };

  if (isPending || isLoading) {
    return <LoadingState message="Loading your wishlist..." />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background/60 pb-20 pt-6 text-text">

      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/4 top-10 h-[400px] w-[400px] animate-pulse rounded-full bg-pink-900 blur-[130px] dark:bg-pink-500/20" />
      <div
        className="pointer-events-none absolute bottom-10 right-1/4 h-[450px] w-[450px] animate-pulse rounded-full bg-purple-900 blur-[140px] dark:bg-purple-500/20"
        style={{ animationDuration: "6s" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-pink-500 shadow-sm backdrop-blur-md">
            ❤️ Saved Items {!session?.user && "(Guest Mode)"}
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-text sm:text-4xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted">
            {!session?.user
              ? "Saved locally on this device. Sign in anytime to sync your wishlist across all devices."
              : "Your saved products for future purchase."}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/80 p-16 text-center backdrop-blur-xl">
            <div className="text-5xl">💝</div>
            <h2 className="mt-4 text-lg font-black text-text">No saved products yet</h2>
            <p className="mt-2 text-sm text-muted">
              Browse the marketplace and heart the products you love.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-xl shadow-primary/30 transition hover:bg-primary-hover"
            >
              Discover Products →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((i) => (
              <div
                key={i.productId}
                className="group relative flex flex-col rounded-3xl border border-border/80 bg-surface/80 p-5 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/40 hover:shadow-pink-500/10"
              >
                {/* Product image placeholder */}
                <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-muted-bg text-5xl">
                  🛍️
                </div>

                <div className="mt-4 flex-1">
                  <h2 className="font-black text-text line-clamp-2">
                    Product #{i.productId.slice(-8)}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Saved {new Date(i.addedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/products/${i.productId}`}
                    className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-primary-hover"
                  >
                    View Product
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(i.productId)}
                    className="rounded-xl border border-error/30 bg-error/10 px-3 py-2.5 text-xs font-bold text-error transition hover:bg-error hover:text-white cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
