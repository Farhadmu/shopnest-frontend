"use client";

import { useEffect, useState } from "react";
import { getOrders, Order } from "@/lib/api/orders";
import { getCart } from "@/lib/api/cart";
import { getWishlist } from "@/lib/api/wishlist";
import { getUnreadCount } from "@/lib/api/notifications";
import { getSecurityOverview, SecurityOverviewData } from "@/lib/api/security-intelligence";

export interface OverviewStats {
  orders: number;
  cart: number;
  wishlist: number;
  notifications: number;
  total: number;
}

const emptyStats: OverviewStats = { orders: 0, cart: 0, wishlist: 0, notifications: 0, total: 0 };

/** Loads the four stat cards + recent orders + the security snapshot shown on the customer overview page. */
export function useOverviewStats(enabled: boolean) {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [securityData, setSecurityData] = useState<SecurityOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    Promise.all([
      getOrders().catch(() => [] as Order[]),
      getCart().catch(() => ({ items: [], subtotal: 0 })),
      getWishlist().catch(() => []),
      getUnreadCount().catch(() => ({ success: true, count: 0 })),
      getSecurityOverview().catch(() => null),
    ])
      .then(([orders, cart, wish, notes, secRes]) => {
        const orderList = Array.isArray(orders) ? orders : [];
        const cartData = cart && typeof cart === "object" ? cart : { items: [], subtotal: 0 };
        const wishlistList = Array.isArray(wish) ? wish : [];
        const unreadCount = typeof notes?.count === "number" ? notes.count : 0;

        setStats({
          orders: orderList.length,
          cart: cartData.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0,
          wishlist: wishlistList.length,
          notifications: unreadCount,
          total: orderList.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
        });
        setRecentOrders(orderList.slice(0, 4));
        if (secRes) setSecurityData(secRes);
      })
      .catch(() => {
        setStats(emptyStats);
        setRecentOrders([]);
      })
      .finally(() => setLoading(false));
  }, [enabled]);

  return { stats, recentOrders, securityData, loading };
}
