"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrders, Order } from "@/lib/api/orders";
import { getCart, Cart } from "@/lib/api/cart";
import { getWishlist, WishlistItem } from "@/lib/api/wishlist";
import { getUnreadCount } from "@/lib/api/notifications";
import { getSecurityOverview, SecurityOverviewData } from "@/lib/api/security-intelligence";

export interface OverviewStats {
  orders: number;
  activeOrders: number;
  deliveredOrders: number;
  cart: number;
  cartSubtotal: number;
  wishlist: number;
  notifications: number;
  totalSpent: number;
}

const emptyStats: OverviewStats = {
  orders: 0,
  activeOrders: 0,
  deliveredOrders: 0,
  cart: 0,
  cartSubtotal: 0,
  wishlist: 0,
  notifications: 0,
  totalSpent: 0,
};

/** Loads comprehensive live customer overview stats from real database APIs. */
export function useOverviewStats(enabled: boolean) {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [cartData, setCartData] = useState<Cart | null>(null);
  const [securityData, setSecurityData] = useState<SecurityOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [orders, cart, wish, notes, secRes] = await Promise.all([
        getOrders().catch(() => [] as Order[]),
        getCart().catch(() => ({ items: [], subtotal: 0 })),
        getWishlist().catch(() => [] as WishlistItem[]),
        getUnreadCount().catch(() => ({ success: true, count: 0 })),
        getSecurityOverview().catch(() => null),
      ]);

      const orderList = Array.isArray(orders) ? orders : [];
      const cartObj = cart && typeof cart === "object" ? cart : { items: [], subtotal: 0 };
      const wishlistList = Array.isArray(wish) ? wish : [];
      const unreadCount = typeof notes?.count === "number" ? notes.count : 0;

      const activeOrdersList = orderList.filter(
        (o) => !["delivered", "cancelled", "returned", "refunded"].includes(o.status)
      );
      const deliveredOrdersList = orderList.filter((o) => o.status === "delivered");
      const totalSpent = orderList
        .filter((o) => ["delivered", "shipped", "out_for_delivery", "processing", "pending"].includes(o.status))
        .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

      const cartItemQty = cartObj.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
      const cartSubtotal = Number(cartObj.subtotal || 0);

      setStats({
        orders: orderList.length,
        activeOrders: activeOrdersList.length,
        deliveredOrders: deliveredOrdersList.length,
        cart: cartItemQty,
        cartSubtotal,
        wishlist: wishlistList.length,
        notifications: unreadCount,
        totalSpent,
      });

      setRecentOrders(orderList.slice(0, 5));
      setActiveOrder(activeOrdersList[0] || null);
      setWishlistItems(wishlistList.slice(0, 4));
      setCartData(cartObj as Cart);
      if (secRes) setSecurityData(secRes);
    } catch {
      setStats(emptyStats);
      setRecentOrders([]);
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchStats();
  }, [enabled, fetchStats]);

  return {
    stats,
    recentOrders,
    activeOrder,
    wishlistItems,
    cartData,
    securityData,
    loading,
    refetch: fetchStats,
  };
}
