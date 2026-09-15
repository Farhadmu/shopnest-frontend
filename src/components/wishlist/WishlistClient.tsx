"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { getWishlist, removeFromWishlist, WishlistItem } from "@/lib/api/wishlist";
import { getProductById, Product } from "@/lib/api/products";
import {
  getGuestWishlist,
  removeGuestWishlistItem,
  clearGuestWishlist,
  syncGuestDataToServer,
} from "@/lib/guest-store";
import { LoadingState } from "@/components/common/LoadingState";
import { useConfirm } from "@/context/ConfirmDialogContext";
import { SmartWishlistGroups } from "@/components/wishlist/SmartWishlistGroups";
import { WishlistProductCard } from "@/components/wishlist/WishlistProductCard";
import { updateWishlistGroup, WishlistGroupItem } from "@/lib/api/customer-intelligence-features";
import { FaHeart, FaShoppingBag } from "react-icons/fa";

export default function WishlistClient() {
  const { data: session, isPending } = useSession();
  const confirm = useConfirm();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<WishlistGroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProductDetails = useCallback(async (wishlistItems: WishlistItem[]) => {
    const entries = await Promise.all(
      wishlistItems.map(async (item) => {
        try {
          const product = await getProductById(item.productId);
          return [item.productId, product] as const;
        } catch {
          return null;
        }
      })
    );

    setProducts(Object.fromEntries(entries.filter((entry): entry is readonly [string, Product] => entry !== null)));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);

    if (!session?.user) {
      const guestItems = getGuestWishlist();
      setItems(guestItems);
      await loadProductDetails(guestItems);
      setIsLoading(false);
      return;
    }

    const guestItems = getGuestWishlist();
    const syncPromise = guestItems.length > 0 ? syncGuestDataToServer() : Promise.resolve();

    syncPromise.finally(async () => {
      clearGuestWishlist();
      getWishlist()
        .then(async (data) => {
          setItems(data);
          await loadProductDetails(data);
          setIsLoading(false);
        })
        .catch(() => {
          setItems([]);
          setProducts({});
          setIsLoading(false);
        });
    });
  }, [loadProductDetails, session]);

  useEffect(() => {
    if (!isPending) {
      let cancelled = false;
      const loadTask = Promise.resolve().then(() => {
        if (!cancelled) load();
      });
      return () => {
        cancelled = true;
        void loadTask;
      };
    }
  }, [isPending, load]);

  useEffect(() => {
    if (!session?.user) {
      const handleGuestWishlistUpdate = () => {
        const guestItems = getGuestWishlist();
        setItems(guestItems);
        void loadProductDetails(guestItems);
      };
      window.addEventListener("guest_wishlist_updated", handleGuestWishlistUpdate);
      return () => window.removeEventListener("guest_wishlist_updated", handleGuestWishlistUpdate);
    }
  }, [loadProductDetails, session]);

  const handleRemove = async (productId: string) => {
    const productTitle = products[productId]?.title || `Product #${productId.slice(-8)}`;
    const shouldRemove = await confirm({
      title: "Remove from wishlist?",
      message: `${productTitle} will be removed from your saved items.`,
      confirmText: "Remove",
      cancelText: "Keep item",
      variant: "danger",
    });

    if (!shouldRemove) return;

    if (!session?.user) {
      setItems(removeGuestWishlistItem(productId));
      return;
    }

    const previousItems = items;
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));

    try {
      await removeFromWishlist(productId);
      clearGuestWishlist();
    } catch {
      setItems(previousItems);
    }
  };

  const handleToggleCollection = async (group: WishlistGroupItem, productId: string) => {
    const productIds = group.productIds.includes(productId)
      ? group.productIds.filter((id) => id !== productId)
      : [...group.productIds, productId];
    const previousGroups = groups;
    const nextGroup = { ...group, productIds };

    setGroups((currentGroups) =>
      currentGroups.map((currentGroup) =>
        currentGroup.id === group.id ? nextGroup : currentGroup
      )
    );

    try {
      const updatedGroup = await updateWishlistGroup(group.id, { productIds });
      setGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.id === updatedGroup.id ? updatedGroup : currentGroup
        )
      );
    } catch {
      setGroups(previousGroups);
    }
  };

  const visibleItems = selectedGroup
    ? items.filter((item) => groups.find((group) => group.id === selectedGroup)?.productIds.includes(item.productId))
    : items;
  const visibleItemCount = visibleItems.length;

  if (isPending || isLoading) {
    return <LoadingState message="Loading your wishlist..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 text-text">
      <div className="mx-auto max-w-7xl rounded-[2rem] px-4 py-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
              <FaHeart size={10} />
              <span>Saved Items</span>
              {!session?.user && <span className="border-l border-pink-500/30 pl-2">Guest Mode</span>}
            </div>
            <h1 className="mt-2.5 text-3xl font-black leading-none tracking-tight text-text sm:text-4xl">
              My <span className="text-primary">Wishlist</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-5 text-muted">
              {!session?.user
                ? "Saved locally on this device. Sign in anytime to sync your wishlist across all devices."
                : "Your saved products for future purchase."}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <FaShoppingBag size={13} />
            </span>
            <span>
              <strong className="block text-lg font-black leading-none text-text">{visibleItemCount}</strong>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
                Saved {visibleItemCount === 1 ? "item" : "items"}
              </span>
            </span>
          </div>
        </div>

        <div className="mb-5 rounded-3xl border border-border bg-surface p-3 shadow-sm sm:p-4">
          <SmartWishlistGroups
            selectedGroupId={selectedGroup}
            onSelectGroup={setSelectedGroup}
            onGroupsChange={setGroups}
          />
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/80 p-16 text-center backdrop-blur-xl">
            <div className="text-5xl">💝</div>
            <h2 className="mt-4 text-lg font-black text-text">No saved products yet</h2>
            <p className="mt-2 text-sm text-muted">Browse the marketplace and heart the products you love.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-xl shadow-primary/30 transition hover:bg-primary-hover"
            >
              Discover Products →
            </Link>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/70 p-10 text-center">
            <p className="text-sm font-bold text-text">This collection is empty</p>
            <p className="mt-1 text-xs text-muted">Add products to this collection from any product card.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visibleItems.map((item) => (
              <WishlistProductCard
                key={item.productId}
                item={item}
                product={products[item.productId]}
                groups={groups}
                onToggleCollection={handleToggleCollection}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
