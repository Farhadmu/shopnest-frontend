"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "@/lib/auth-client";
import {
  getWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveWishlist,
  WishlistItem,
} from "@/lib/api/wishlist";
import {
  getGuestWishlist,
  addGuestWishlistItem,
  removeGuestWishlistItem,
  clearGuestWishlist,
  syncGuestDataToServer,
} from "@/lib/guest-store";
import {
  notifyCommerceUpdated,
  subscribeToCommerceUpdates,
} from "@/lib/commerce-events";

export interface WishlistProductInput {
  id: string;
  title?: string;
  price?: number;
  image?: string;
  images?: string[];
  category?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistProductInput) => Promise<{ added: boolean }>;
  addToWishlist: (product: WishlistProductInput) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const isAuthenticated = Boolean(session?.user);

  const refreshWishlist = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      if (!isAuthenticated) {
        const guestItems = getGuestWishlist();
        setItems(guestItems);
        setIsLoading(false);
        return;
      }

      // Check if any guest wishlist exists to sync after login
      const guestItems = getGuestWishlist();
      if (guestItems.length > 0) {
        try {
          await syncGuestDataToServer();
        } catch {
          // Ignore sync failure
        }
      }

      const res = await getWishlist();
      if (Array.isArray(res)) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      // Fallback for guest or network glitches
      if (!isAuthenticated) {
        setItems(getGuestWishlist());
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!sessionLoading) {
      refreshWishlist();
    }
  }, [sessionLoading, isAuthenticated, refreshWishlist]);

  // Listen to cross-component commerce updates & guest store events
  useEffect(() => {
    const handleGuestUpdate = () => {
      if (!isAuthenticated) {
        setItems(getGuestWishlist());
      }
    };

    window.addEventListener("guest_wishlist_updated", handleGuestUpdate);
    const unsubscribe = subscribeToCommerceUpdates(() => {
      refreshWishlist();
    });

    return () => {
      window.removeEventListener("guest_wishlist_updated", handleGuestUpdate);
      unsubscribe();
    };
  }, [isAuthenticated, refreshWishlist]);

  const idSet = useMemo(() => {
    return new Set(items.map((i) => i.productId));
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => {
      if (!productId) return false;
      return idSet.has(productId);
    },
    [idSet]
  );

  const addToWishlist = useCallback(
    async (product: WishlistProductInput) => {
      if (!product?.id) return;

      const newItem: WishlistItem = {
        productId: product.id,
        addedAt: new Date().toISOString(),
        title: product.title,
        price: product.price,
        image: product.image || product.images?.[0],
        images: product.images,
        category: product.category,
      };

      // Optimistic update
      setItems((prev) => {
        if (prev.some((i) => i.productId === product.id)) return prev;
        return [...prev, newItem];
      });

      if (!isAuthenticated) {
        addGuestWishlistItem({
          productId: product.id,
          title: product.title,
          price: product.price,
          image: newItem.image,
          images: product.images,
          category: product.category,
        });
        notifyCommerceUpdated();
        return;
      }

      try {
        const updated = await apiAddToWishlist(product.id);
        if (Array.isArray(updated)) {
          setItems(updated);
        }
        notifyCommerceUpdated();
      } catch (err) {
        console.error("Failed to add to server wishlist:", err);
        // Rollback on error
        setItems((prev) => prev.filter((i) => i.productId !== product.id));
        throw err;
      }
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!productId) return;

      const prevItems = [...items];
      // Optimistic removal
      setItems((prev) => prev.filter((i) => i.productId !== productId));

      if (!isAuthenticated) {
        removeGuestWishlistItem(productId);
        notifyCommerceUpdated();
        return;
      }

      try {
        const updated = await apiRemoveWishlist(productId);
        if (Array.isArray(updated)) {
          setItems(updated);
        }
        notifyCommerceUpdated();
      } catch (err) {
        console.error("Failed to remove from server wishlist:", err);
        // Rollback
        setItems(prevItems);
        throw err;
      }
    },
    [items, isAuthenticated]
  );

  const toggleWishlist = useCallback(
    async (product: WishlistProductInput): Promise<{ added: boolean }> => {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
        return { added: false };
      } else {
        await addToWishlist(product);
        return { added: true };
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  const value = useMemo<WishlistContextType>(
    () => ({
      items,
      itemCount: items.length,
      isLoading,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      refreshWishlist,
    }),
    [
      items,
      isLoading,
      isInWishlist,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      refreshWishlist,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
