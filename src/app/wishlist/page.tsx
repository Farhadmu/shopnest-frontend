import type { Metadata } from "next";
import WishlistClient from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist | ShopNest",
  description: "View and manage your saved ShopNest products.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
