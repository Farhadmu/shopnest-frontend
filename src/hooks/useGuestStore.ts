"use client";

import { useEffect, useState } from "react";
import {
  getGuestCart,
  getGuestWishlist,
  addGuestCartItem,
  updateGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
  addGuestWishlistItem,
  removeGuestWishlistItem,
  clearGuestWishlist,
  syncGuestDataToServer,
} from "@/lib/guest-store";
import { Cart } from "@/lib/api/cart";
import { WishlistItem } from "@/lib/api/wishlist";

export function useGuestStore() {
  const [guestCart, setGuestCart] = useState<Cart>({ items: [], subtotal: 0 });
  const [guestWishlist, setGuestWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // Initial load
    setGuestCart(getGuestCart());
    setGuestWishlist(getGuestWishlist());

    const handleCartUpdate = () => {
      setGuestCart(getGuestCart());
    };

    const handleWishlistUpdate = () => {
      setGuestWishlist(getGuestWishlist());
    };

    window.addEventListener("guest_cart_updated", handleCartUpdate);
    window.addEventListener("guest_wishlist_updated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("guest_cart_updated", handleCartUpdate);
      window.removeEventListener("guest_wishlist_updated", handleWishlistUpdate);
    };
  }, []);

  return {
    guestCart,
    guestWishlist,
    addToCart: addGuestCartItem,
    updateCartQuantity: updateGuestCartItemQuantity,
    removeFromCart: removeGuestCartItem,
    clearCart: clearGuestCart,
    addToWishlist: addGuestWishlistItem,
    removeFromWishlist: removeGuestWishlistItem,
    clearWishlist: clearGuestWishlist,
    syncToServer: syncGuestDataToServer,
  };
}
