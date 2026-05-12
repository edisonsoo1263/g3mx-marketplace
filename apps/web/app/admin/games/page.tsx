"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  Check,
  Lock,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldOff,
  Sparkles,
  Trash2,
  X as XIcon,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { GameFormModal } from "@/components/admin/GameFormModal";
import { cn } from "@/lib/utils/cn";
import {
  checkAdmin,
  createGame,
  deleteGame,
  listAllGames,
  toggleGame,
  updateGame,
} from "@/lib/api/games-client";
import {
  GAME_CATEGORIES,
  pickGameName,
  type Game,
  type GameCategory,
  type GameInput,
} from "@/lib/types/games";

type Status = "idle" | "loading" | "ready" | "unauthorized" | "error";

export default function AdminGamesPage() {
  const { ready: privyReady, authenticated, getAccessToken, login } = usePrivy();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<"" | "1" | "2" | "3">("");
  const [cat, setCat] = useState<GameCategory | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "active" | "inactive">(
    "",
  );

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Refresh games list, auth-aware
  const refresh = useCallback(async () => {
    if (!authenticated) return;
    setStatus("loading");
    setErrorMsg(null);
    try {
      const t = await getAccessToken();
      setToken(t);
      const adminCheck = await checkAdmin(t);
      if (!adminCheck.is_admin) {
        setStatus("unauthorized");
        return;
      }
      const data = await listAllGames(t ?? "", {
        tier: tier ? (Number(tier) as 1 | 2 | 3) : undefined,
        category: cat || undefined,
        q: q.trim() || undefined,
      });
      setGames(data);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Load failed");
    }
  }, [authenticated, getAccessToken, tier, cat, q]);

  useEffect(() => {
    if (!privyReady) return;
    if (!authenticated) {
      setStatus("idle");
      return;
    }
    void refresh();
  }, [privyReady, authenticated, refresh]);

  // Active-filter is client-side (cheaper than another server roundtrip)
  const filteredGames = useMemo(() => {
    if (!activeFilter) return games;
    return games.filter((g) =>
      activeFilter === "active" ? g.is_active : !g.is_active,
    );
  }, [games, activeFilter]);

  async function handleSubmit(input: GameInput) {
    if (!token) throw new Error("Missing token");
    if (editingGame) {
      await updateGame(token, editingGame.id, input);
    } else {
      await createGame(token, input);
    }
    await refresh();
  }

  async function handleToggle(g: Game) {
    if (!token) return;
    try {
      const updated = await toggleGame(token, g.id, !g.is_active);
      setGames((prev) =>
        prev.map((row) => (row.id === g.id ? updated : row)),
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Toggle failed");
    }
  }

  async function handleDelete(g: Game) {
    if (!token) return;
    const ok = window.confirm(
      `Soft-delete "${pickGameName(g.name)}"? It'll disappear from public listings; you can restore it from the DB.`,
    );
    if (!ok) return;
    try {
      await deleteGame(token, g.id);
      await refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function openCreate() {
    setEditingGame(null);
    setModalOpen(true);
  }
  function openEdit(g: Game) {
    setEditingGame(g);
    setModalOpen(true);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>

        <header className="space-y-3 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <PixelBadge tone="cyan">
              <Sparkles className="size-3" /> Admin
            </PixelBadge>
            <h1
              className="font-display font-black tracking-tight text-white"
              style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
            >
              Games catalog
            </h1>
            <p className="text-white/75 max-w-2xl text-sm">
              Source of truth for every supported title — boosting / account
              trading / top-up flags drive what sellers can list against each
              game.
            </p>
          </div>
          {status === "ready" && (
            <button
              type="button"
              onClick={openCreate}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
                "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
                "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
                "transition-[filter,transform] duration-150 shrink-0",
              )}
            >
              <Plus className="size-4" /> New game
            </button>
          )}
        </header>

        {!privyReady || status === "loading" ? (
          <Skeleton />
        ) : !authenticated ? (
          <Gate
            title="Sign in to access admin"
            sub="Admin panel requires a Privy session."
            onAction={() => login()}
            actionLabel="Sign in"
          />
        ) : status === "unauthorized" ? (
          <Gate
            title="Admin access required"
            sub={`Your Privy user id isn't on the admin whitelist. Add it to ADMIN_PRIVY_USER_IDS on Vercel and redeploy.`}
            tone="danger"
            icon={ShieldOff}
          />
        ) : status === "error" ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6 text-sm text-[var(--color-danger)]">
            {errorMsg ?? "Failed to load."}
            <button
              type="button"
              onClick={() => void refresh()}
              className="ml-3 underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/45" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void refresh();
                  }}
                  placeholder="Search slug or name"
                  className={cn(
                    "w-full h-10 pl-9 pr-3 rounded-md text-sm text-white",
                    "bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]",
                    "focus:border-[var(--color-neon-cyan)] outline-none transition-colors",
                  )}
                />
              </div>
              <Select
                value={tier}
                onChange={(v) => setTier(v as "" | "1" | "2" | "3")}
                options={[
                  { value: "", label: "All tiers" },
                  { value: "1", label: "Tier 1" },
                  { value: "2", label: "Tier 2" },
                  { value: "3", label: "Tier 3" },
                ]}
              />
              <Select
                value={cat}
                onChange={(v) => setCat((v || "") as GameCategory | "")}
                options={[
                  { value: "", label: "All categories" },
                  ...GAME_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
              <Select
                value={activeFilter}
                onChange={(v) =>
                  setActiveFilter(v as "" | "active" | "inactive")
                }
                options={[
                  { value: "", label: "Active+Inactive" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] text-sm text-white/85 hover:text-white hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
              >
                <RefreshCw className="size-3.5" /> Refresh
              </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-bg-deep)]/60 text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
                    <tr>
                      <Th>Game</Th>
                      <Th>Publisher</Th>
                      <Th>Category</Th>
                      <Th>Platforms</Th>
                      <Th>Services</Th>
                      <Th>Tier</Th>
                      <Th>Active</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center text-white/55"
                        >
                          No games match these filters.
                        </td>
                      </tr>
                    ) : (
                      filteredGames.map((g) => (
                        <tr
                          key={g.id}
                          className="border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-panel-elevated)]/40 transition-colors"
                        >
                          <Td>
                            <div className="leading-tight">
                              <div className="font-semibold text-white">
                                {pickGameName(g.name)}
                              </div>
                              <div className="text-[11px] font-mono text-white/45">
                                {g.slug}
                              </div>
                            </div>
                          </Td>
                          <Td className="text-white/80">
                            {g.publisher ?? "—"}
                          </Td>
                          <Td className="text-white/80">{g.category}</Td>
                          <Td className="text-white/70 text-[11px]">
                            {g.platforms.join(", ")}
                          </Td>
                          <Td>
                            <div className="flex items-center gap-1.5">
                              <ServiceBadge
                                label="Boost"
                                on={g.services.boosting.enabled}
                              />
                              <ServiceBadge
                                label="Account"
                                on={g.services.account_trading.enabled}
                              />
                              <ServiceBadge
                                label="Top-up"
                                on={g.services.top_up.enabled}
                              />
                            </div>
                          </Td>
                          <Td className="text-white">{g.priority_tier}</Td>
                          <Td>
                            <button
                              type="button"
                              onClick={() => void handleToggle(g)}
                              aria-label={
                                g.is_active ? "Deactivate" : "Activate"
                              }
                              className={cn(
                                "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] border cursor-pointer transition-colors",
                                g.is_active
                                  ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/15"
                                  : "border-white/15 bg-white/5 text-white/55 hover:bg-white/10",
                              )}
                            >
                              {g.is_active ? (
                                <>
                                  <Check className="size-3" /> Live
                                </>
                              ) : (
                                <>
                                  <XIcon className="size-3" /> Off
                                </>
                              )}
                            </button>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(g)}
                                title="Edit"
                                aria-label="Edit"
                                className="grid place-items-center size-8 rounded-md text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer"
                              >
                                <PencilLine className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(g)}
                                title="Delete"
                                aria-label="Delete"
                                className="grid place-items-center size-8 rounded-md text-white/65 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <GameFormModal
        open={modalOpen}
        game={editingGame}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// ── Tiny building blocks ──────────────────────────────────────

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-mono">{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}

function ServiceBadge({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 h-5 rounded text-[9px] font-mono uppercase tracking-[0.18em] border",
        on
          ? "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]"
          : "border-white/10 bg-white/[0.03] text-white/35 line-through",
      )}
    >
      {label}
    </span>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 px-3 rounded-md text-sm text-white",
        "bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]",
        "focus:border-[var(--color-neon-cyan)] outline-none cursor-pointer",
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 rounded-md bg-[var(--color-bg-panel)]/40 animate-pulse" />
      <div className="h-[320px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse" />
    </div>
  );
}

function Gate({
  title,
  sub,
  onAction,
  actionLabel,
  tone = "default",
  icon: Icon = Lock,
}: {
  title: string;
  sub: string;
  onAction?: () => void;
  actionLabel?: string;
  tone?: "default" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const accent = tone === "danger" ? "var(--color-danger)" : "var(--color-neon-cyan)";
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div
        className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5"
        style={{ color: accent }}
      >
        <Icon className="size-6" />
      </div>
      <h2 className="font-display text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto text-sm">{sub}</p>
      {onAction && actionLabel && (
        <div className="mt-7">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)] text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-[filter,transform] cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
