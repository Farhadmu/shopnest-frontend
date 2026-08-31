"use client";

/**
 * A tiny browser-only event bus for data that appears in multiple customer
 * surfaces (cart count, wishlist count and order status). API helpers emit an
 * event only after MongoDB confirms the mutation, so header/mobile badges can
 * refresh without waiting for a route change or a polling interval.
 */
export const COMMERCE_UPDATED_EVENT = "shopnest:commerce-updated";

export function notifyCommerceUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMMERCE_UPDATED_EVENT));
}

export function subscribeToCommerceUpdates(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(COMMERCE_UPDATED_EVENT, listener);
  return () => window.removeEventListener(COMMERCE_UPDATED_EVENT, listener);
}
