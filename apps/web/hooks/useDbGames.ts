"use client";

import { useEffect, useState } from "react";
import { listPublicGames } from "@/lib/api/games-client";
import type { Game, GameCategory, GamePlatform } from "@/lib/types/games";

interface UseDbGamesResult {
  games: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useDbGames — fetches the active games catalogue from /api/games.
 *
 * SSR-safe: starts empty, hydrates on mount. Re-fetches when any of the
 * optional filter params change. When the API errors (e.g. SQL not yet
 * run), `games` stays empty and `error` is populated.
 */
export function useDbGames(opts?: {
  category?: GameCategory;
  platform?: GamePlatform;
  service?: "boosting" | "account_trading" | "top_up";
}): UseDbGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const category = opts?.category;
  const platform = opts?.platform;
  const service = opts?.service;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPublicGames({ category, platform, service })
      .then((data) => {
        if (!cancelled) setGames(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load games");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, platform, service, tick]);

  return {
    games,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}
