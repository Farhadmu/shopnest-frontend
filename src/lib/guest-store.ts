import { addToCart, Cart, CartItem } from "@/lib/api/cart";
import { addToWishlist, WishlistItem } from "@/lib/api/wishlist";

const GUEST_CART_KEY = "shopnest_guest_cart";
const GUEST_WISHLIST_KEY = "shopnest_guest_wishlist";

export interface GuestCartItem extends CartItem {
  productId: string;
  quantity: number;
  price: number;
  title?: string;
  image?: string;
  images?: string[];
  category?: string;
}

export interface GuestWishlistItem {
  productId: string;
  addedAt: string;
  title?: string;
  price?: number;
  image?: string;
  images?: string[];
  category?: string;
}

// ─── Guest Cart Helpers ───

export function getGuestCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], subtotal: 0 };
  }
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { items: [], subtotal: 0 };
    const items: GuestCartItem[] = JSON.parse(raw);
    const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    return { items, subtotal };
  } catch (e) {
    console.error("Failed to parse guest cart from localStorage:", e);
    return { items: [], subtotal: 0 };
  }
}

export function saveGuestCart(items: GuestCartItem[]): Cart {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event("guest_cart_updated"));
    } catch (e) {
      console.error("Failed to save guest cart to localStorage:", e);
    }
  }
  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  return { items, subtotal };
}

export function addGuestCartItem(item: {
  productId: string;
  quantity?: number;
  price?: number;
  title?: string;
  image?: string;
  images?: string[];
  category?: string;
}): Cart {
  const current = getGuestCart();
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const existingIndex = current.items.findIndex((i) => i.productId === item.productId);

  let updatedItems: GuestCartItem[];
  if (existingIndex > -1) {
    updatedItems = current.items.map((i, idx) => {
      if (idx === existingIndex) {
        return {
          ...i,
          ...item,
          quantity: i.quantity + quantity,
        };
      }
      return i;
    });
  } else {
    updatedItems = [
      ...current.items,
      {
        productId: item.productId,
        quantity,
        price: item.price || 0,
        title: item.title,
        image: item.image || item.images?.[0],
        images: item.images,
        category: item.category,
      },
    ];
  }

  return saveGuestCart(updatedItems);
}

export function updateGuestCartItemQuantity(productId: string, quantity: number): Cart {
  const current = getGuestCart();
  if (quantity <= 0) {
    return removeGuestCartItem(productId);
  }
  const updatedItems = current.items.map((i) =>
    i.productId === productId ? { ...i, quantity } : i
  );
  return saveGuestCart(updatedItems);
}

export function removeGuestCartItem(productId: string): Cart {
  const current = getGuestCart();
  const updatedItems = current.items.filter((i) => i.productId !== productId);
  return saveGuestCart(updatedItems);
}

export function clearGuestCart(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event("guest_cart_updated"));
  }
}

// ─── Guest Wishlist Helpers ───

export function getGuestWishlist(): WishlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse guest wishlist from localStorage:", e);
    return [];
  }
}

export function saveGuestWishlist(items: WishlistItem[]): WishlistItem[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
      window.dispatchEvent(new Event("guest_wishlist_updated"));
    } catch (e) {
      console.error("Failed to save guest wishlist to localStorage:", e);
    }
  }
  return items;
}

export function addGuestWishlistItem(item: {
  productId: string;
  title?: string;
  price?: number;
  image?: string;
  images?: string[];
  category?: string;
}): WishlistItem[] {
  const current = getGuestWishlist();
  if (current.some((i) => i.productId === item.productId)) {
    return current;
  }
  const newItem: WishlistItem = {
    productId: item.productId,
    addedAt: new Date().toISOString(),
  };
  const updated = [...current, newItem];
  return saveGuestWishlist(updated);
}

export function removeGuestWishlistItem(productId: string): WishlistItem[] {
  const current = getGuestWishlist();
  const updated = current.filter((i) => i.productId !== productId);
  return saveGuestWishlist(updated);
}

export function clearGuestWishlist(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    window.dispatchEvent(new Event("guest_wishlist_updated"));
  }
}

// ─── Post-Login Sync Function ───

/**
 * Synchronizes any items saved in localStorage into the backend database.
 * Call this immediately after a user successfully logs in.
 */
export async function syncGuestDataToServer(): Promise<{ cartSynced: number; wishlistSynced: number }> {
  let cartSynced = 0;
  let wishlistSynced = 0;

  try {
    // 1. Sync cart items
    const guestCart = getGuestCart();
    if (guestCart.items.length > 0) {
      for (const item of guestCart.items) {
        try {
          await addToCart(item.productId, item.quantity);
          cartSynced++;
        } catch (err) {
          console.warn(`Failed to sync cart item ${item.productId}:`, err);
        }
      }
      clearGuestCart();
    }

    // 2. Sync wishlist items
    const guestWishlist = getGuestWishlist();
    if (guestWishlist.length > 0) {
      for (const item of guestWishlist) {
        try {
          await addToWishlist(item.productId);
          wishlistSynced++;
        } catch (err) {
          console.warn(`Failed to sync wishlist item ${item.productId}:`, err);
        }
      }
      clearGuestWishlist();
    }
  } catch (err) {
    console.error("Error during guest data sync to server:", err);
  }

  return { cartSynced, wishlistSynced };
}
