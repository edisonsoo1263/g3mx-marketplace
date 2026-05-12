"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getOrders,
  ORDERS_UPDATED_EVENT,
} from "@/lib/data/userOrders";
import type { Order } from "@/lib/data/orders";

/**
 * useOrders — Supabase-backed orders for the current authenticated buyer.
 * Returns an empty array when logged out.
 */
export function useOrders(): Order[] {
  const { user, isReady } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setOrders([]);
      return;
    }
    const userId = user.id;
    let cancelled = false;

    async function refresh() {
      const data = await getOrders(userId);
      if (!cancelled) setOrders(data);
    }
    void refresh();

    function onUpdate() {
      void refresh();
    }
    window.addEventListener(ORDERS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(ORDERS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [user, isReady]);

  return orders;
}
