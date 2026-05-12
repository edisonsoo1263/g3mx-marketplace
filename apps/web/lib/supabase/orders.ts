"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/data/orders";

interface OrderRow {
  id: string;
  buyer_user_id: string;
  service: Order["service"];
  booster: Order["booster"];
  ranks: Order["ranks"];
  pricing: Order["pricing"];
  options: Order["options"];
  status: string;
  sla: Order["sla"];
  timeline: Order["timeline"];
  unread_messages: number;
  created_at: string;
  updated_at: string;
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    buyerUserId: row.buyer_user_id,
    service: row.service,
    booster: row.booster,
    ranks: row.ranks,
    pricing: row.pricing,
    options: row.options,
    status: row.status as OrderStatus,
    sla: row.sla,
    timeline: row.timeline,
    unreadMessages: row.unread_messages,
  };
}

function orderToRow(order: Order): Omit<OrderRow, "created_at" | "updated_at"> {
  return {
    id: order.id,
    buyer_user_id: order.buyerUserId ?? "",
    service: order.service,
    booster: order.booster,
    ranks: order.ranks,
    pricing: order.pricing,
    options: order.options,
    status: order.status,
    sla: order.sla,
    timeline: order.timeline,
    unread_messages: order.unreadMessages,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────

export async function fetchOrdersByBuyer(buyerUserId: string): Promise<Order[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("buyer_user_id", buyerUserId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] fetchOrdersByBuyer error:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToOrder(r as unknown as OrderRow));
}

export async function insertOrder(order: Order): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("orders").insert(orderToRow(order));
  if (error) {
    console.error("[supabase] insertOrder error:", error.message);
    return false;
  }
  return true;
}

export async function updateOrderRecord(
  id: string,
  patch: Partial<Order>,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  // Map camelCase patch fields to snake_case columns
  const rowPatch: Record<string, unknown> = {};
  if (patch.status !== undefined) rowPatch.status = patch.status;
  if (patch.timeline !== undefined) rowPatch.timeline = patch.timeline;
  if (patch.ranks !== undefined) rowPatch.ranks = patch.ranks;
  if (patch.pricing !== undefined) rowPatch.pricing = patch.pricing;
  if (patch.unreadMessages !== undefined)
    rowPatch.unread_messages = patch.unreadMessages;
  if (patch.sla !== undefined) rowPatch.sla = patch.sla;

  const { error } = await sb.from("orders").update(rowPatch).eq("id", id);
  if (error) {
    console.error("[supabase] updateOrderRecord error:", error.message);
    return false;
  }
  return true;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("orders").delete().eq("id", id);
  if (error) {
    console.error("[supabase] deleteOrder error:", error.message);
    return false;
  }
  return true;
}
