"use client";

import type { Game, GameInput } from "@/lib/types/games";

/**
 * Client-side helpers for the games API.
 *
 * Two flavours of helpers:
 *   - Public (no auth)      — used by /games and /games/[slug]
 *   - Admin (Privy bearer)  — used by /admin/games. Caller passes the token
 *     fetched from `await getAccessToken()` (from usePrivy).
 *
 * All helpers return parsed JSON or throw with a useful error message.
 */

async function jsonOrThrow<T>(res: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore — leave body as null
  }
  if (!res.ok) {
    const msg =
      (body as { error?: string } | null)?.error ??
      `Request failed with ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

function authHeader(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public ────────────────────────────────────────────────────

export async function listPublicGames(opts?: {
  category?: string;
  platform?: string;
  service?: "boosting" | "account_trading" | "top_up";
}): Promise<Game[]> {
  const sp = new URLSearchParams();
  if (opts?.category) sp.set("category", opts.category);
  if (opts?.platform) sp.set("platform", opts.platform);
  if (opts?.service) sp.set("service", opts.service);
  const qs = sp.toString();
  const res = await fetch(`/api/games${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  return (await jsonOrThrow<{ games: Game[] }>(res)).games;
}

export async function getPublicGame(slug: string): Promise<Game> {
  const res = await fetch(`/api/games/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  return (await jsonOrThrow<{ game: Game }>(res)).game;
}

// ── Admin (token required) ────────────────────────────────────

export async function checkAdmin(token: string | null): Promise<{
  is_admin: boolean;
  user_id?: string;
}> {
  if (!token) return { is_admin: false };
  const res = await fetch("/api/admin/me", {
    headers: authHeader(token),
    cache: "no-store",
  });
  if (res.status === 401) return { is_admin: false };
  return jsonOrThrow<{ is_admin: boolean; user_id?: string }>(res);
}

export async function listAllGames(
  token: string,
  opts?: {
    category?: string;
    platform?: string;
    tier?: 1 | 2 | 3;
    includeDeleted?: boolean;
    q?: string;
  },
): Promise<Game[]> {
  const sp = new URLSearchParams();
  if (opts?.category) sp.set("category", opts.category);
  if (opts?.platform) sp.set("platform", opts.platform);
  if (opts?.tier) sp.set("tier", String(opts.tier));
  if (opts?.includeDeleted) sp.set("include_deleted", "1");
  if (opts?.q) sp.set("q", opts.q);
  const qs = sp.toString();
  const res = await fetch(`/api/admin/games${qs ? `?${qs}` : ""}`, {
    headers: authHeader(token),
    cache: "no-store",
  });
  return (await jsonOrThrow<{ games: Game[] }>(res)).games;
}

export async function createGame(
  token: string,
  input: GameInput,
): Promise<Game> {
  const res = await fetch("/api/admin/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(input),
  });
  return (await jsonOrThrow<{ game: Game }>(res)).game;
}

export async function updateGame(
  token: string,
  id: string,
  patch: Partial<GameInput>,
): Promise<Game> {
  const res = await fetch(`/api/admin/games/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(patch),
  });
  return (await jsonOrThrow<{ game: Game }>(res)).game;
}

export async function toggleGame(
  token: string,
  id: string,
  is_active?: boolean,
): Promise<Game> {
  const res = await fetch(`/api/admin/games/${id}/toggle`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: typeof is_active === "boolean" ? JSON.stringify({ is_active }) : "{}",
  });
  return (await jsonOrThrow<{ game: Game }>(res)).game;
}

export async function deleteGame(
  token: string,
  id: string,
  hard = false,
): Promise<void> {
  const res = await fetch(
    `/api/admin/games/${id}${hard ? "?hard=1" : ""}`,
    {
      method: "DELETE",
      headers: authHeader(token),
    },
  );
  await jsonOrThrow<{ ok?: boolean; game?: Game }>(res);
}
