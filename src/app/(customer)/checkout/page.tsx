import { Suspense } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { protectedFetch } from "@/lib/core/server";
import type { Cart } from "@/lib/api/cart";
import type { Address } from "@/lib/api/addresses";

export const metadata = {
  title: "Checkout | ShopNest",
  description: "Complete your ShopNest order securely.",
};

async function CheckoutServer() {
  // Fetch both in parallel server-side — no loading spinner on initial render.
  // `no-store` ensures the cart is never stale (user may have just added items).
  const [cart, addresses] = await Promise.allSettled([
    protectedFetch<Cart>("/cart", { cache: "no-store" }),
    protectedFetch<Address[]>("/addresses", { cache: "no-store" }),
  ]);

  const initialCart = cart.status === "fulfilled" ? cart.value : null;
  const initialAddresses = addresses.status === "fulfilled" ? addresses.value : [];

  return (
    <CheckoutClient
      initialCart={initialCart}
      initialAddresses={initialAddresses}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState message="Preparing checkout..." />}>
      <CheckoutServer />
    </Suspense>
  );
}
