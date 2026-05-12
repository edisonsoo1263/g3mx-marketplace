"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Loader2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  emptyServices,
  GAME_CATEGORIES,
  GAME_PLATFORMS,
  GAME_REGIONS,
  type Game,
  type GameCategory,
  type GameInput,
  type GameName,
  type GamePlatform,
  type GameRegion,
  type GameServices,
} from "@/lib/types/games";

/**
 * Create/edit modal for the admin games table.
 *
 * - Pass `game={existingGame}` to edit; omit to create.
 * - Multilingual names live in three side-by-side inputs (en / zh_tw / id).
 * - Services are three nested sub-forms with toggles + examples + currency.
 * - All validation happens server-side via zod; this UI prevents the most
 *   common shape errors (slug regex, required fields).
 */

type Locale = "en" | "zh_tw" | "id";
const LOCALES: Array<{ code: Locale; label: string }> = [
  { code: "en", label: "English" },
  { code: "zh_tw", label: "繁體中文" },
  { code: "id", label: "Bahasa Indonesia" },
];

interface Props {
  open: boolean;
  game?: Game | null;
  onClose: () => void;
  onSubmit: (input: GameInput) => Promise<void>;
}

export function GameFormModal({ open, game, onClose, onSubmit }: Props) {
  const reduced = useReducedMotion();
  const isEdit = !!game;

  const [slug, setSlug] = useState("");
  const [name, setName] = useState<GameName>({ en: "" });
  const [publisher, setPublisher] = useState("");
  const [category, setCategory] = useState<GameCategory>("FPS");
  const [platforms, setPlatforms] = useState<GamePlatform[]>([]);
  const [regions, setRegions] = useState<GameRegion[]>([]);
  const [services, setServices] = useState<GameServices>(emptyServices());
  const [priorityTier, setPriorityTier] = useState<1 | 2 | 3>(3);
  const [isActive, setIsActive] = useState(false);
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from existing game when editing, or reset on close
  useEffect(() => {
    if (!open) return;
    if (game) {
      setSlug(game.slug);
      setName(game.name);
      setPublisher(game.publisher ?? "");
      setCategory(game.category);
      setPlatforms(game.platforms);
      setRegions(game.region_focus);
      setServices(game.services);
      setPriorityTier(game.priority_tier);
      setIsActive(game.is_active);
      setIconUrl(game.icon_url ?? "");
      setBannerUrl(game.banner_url ?? "");
    } else {
      setSlug("");
      setName({ en: "" });
      setPublisher("");
      setCategory("FPS");
      setPlatforms([]);
      setRegions([]);
      setServices(emptyServices());
      setPriorityTier(3);
      setIsActive(false);
      setIconUrl("");
      setBannerUrl("");
    }
    setError(null);
  }, [open, game]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug must be lowercase letters, digits, and hyphens only.");
      return;
    }
    if (!name.en.trim()) {
      setError("English name is required.");
      return;
    }
    if (platforms.length === 0) {
      setError("Pick at least one platform.");
      return;
    }

    const input: GameInput = {
      slug: slug.trim(),
      name: {
        en: name.en.trim(),
        ...(name.zh_tw ? { zh_tw: name.zh_tw.trim() } : {}),
        ...(name.id ? { id: name.id.trim() } : {}),
      },
      publisher: publisher.trim() || null,
      category,
      platforms,
      region_focus: regions,
      services,
      priority_tier: priorityTier,
      is_active: isActive,
      icon_url: iconUrl.trim() || null,
      banner_url: bannerUrl.trim() || null,
    };

    try {
      setSubmitting(true);
      await onSubmit(input);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal
            aria-label={isEdit ? "Edit game" : "Create game"}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[81] inset-0 sm:inset-auto sm:top-[5vh] sm:left-1/2 sm:-translate-x-1/2",
              "sm:w-[min(720px,92vw)] sm:max-h-[90vh] flex flex-col",
              "bg-[var(--color-bg-panel)] border border-[var(--color-border-strong)] sm:rounded-2xl",
              "shadow-[0_24px_64px_rgb(0_0_0_/_65%)] overflow-hidden",
            )}
          >
            <header className="px-5 h-14 flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0">
              <h2 className="font-display text-base font-bold text-white">
                {isEdit ? "Edit game" : "New game"}
              </h2>
              <button
                type="button"
                onClick={() => !submitting && onClose()}
                aria-label="Close"
                className="grid place-items-center size-9 rounded-md text-white/70 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer disabled:opacity-50"
                disabled={submitting}
              >
                <X className="size-5" />
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
            >
              {/* Slug + tier + active */}
              <Row>
                <Field label="Slug" hint="lowercase, digits, hyphens">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="valorant"
                    required
                    disabled={isEdit /* slug is the stable key */}
                    className={inputClass}
                  />
                </Field>
                <Field label="Priority tier">
                  <select
                    value={priorityTier}
                    onChange={(e) =>
                      setPriorityTier(
                        Number(e.target.value) as 1 | 2 | 3,
                      )
                    }
                    className={inputClass}
                  >
                    <option value={1}>1 — MVP launch</option>
                    <option value={2}>2 — Expansion</option>
                    <option value={3}>3 — Long-tail</option>
                  </select>
                </Field>
                <Field label="Active">
                  <label className="inline-flex items-center gap-2 h-10 px-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="size-4 accent-[var(--color-neon-cyan)]"
                    />
                    <span className="text-xs text-white/85">
                      Visible to public
                    </span>
                  </label>
                </Field>
              </Row>

              {/* Names per locale */}
              <Field label="Name" hint="English required, others optional">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LOCALES.map((loc) => (
                    <div key={loc.code}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/45 mb-1">
                        {loc.label}
                      </div>
                      <input
                        type="text"
                        value={name[loc.code] ?? ""}
                        onChange={(e) =>
                          setName((prev) => ({
                            ...prev,
                            [loc.code]: e.target.value,
                          }))
                        }
                        placeholder={loc.code === "en" ? "Valorant" : "Optional"}
                        required={loc.code === "en"}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </Field>

              {/* Publisher + category */}
              <Row>
                <Field label="Publisher">
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Riot Games"
                    className={inputClass}
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as GameCategory)
                    }
                    className={inputClass}
                  >
                    {GAME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </Row>

              {/* Platforms + regions */}
              <Field label="Platforms" hint="at least one">
                <PillSelect
                  options={GAME_PLATFORMS}
                  values={platforms}
                  onChange={(next) => setPlatforms(next as GamePlatform[])}
                />
              </Field>
              <Field label="Region focus">
                <PillSelect
                  options={GAME_REGIONS}
                  values={regions}
                  onChange={(next) => setRegions(next as GameRegion[])}
                />
              </Field>

              {/* Services */}
              <Field label="Services">
                <div className="space-y-2">
                  <ServiceBlock
                    title="Boosting"
                    value={services.boosting}
                    onChange={(next) =>
                      setServices((prev) => ({ ...prev, boosting: next }))
                    }
                  />
                  <ServiceBlock
                    title="Account trading"
                    value={services.account_trading}
                    onChange={(next) =>
                      setServices((prev) => ({
                        ...prev,
                        account_trading: next,
                      }))
                    }
                  />
                  <TopUpBlock
                    value={services.top_up}
                    onChange={(next) =>
                      setServices((prev) => ({ ...prev, top_up: next }))
                    }
                  />
                </div>
              </Field>

              {/* Icons */}
              <Row>
                <Field label="Icon URL">
                  <input
                    type="url"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Banner URL">
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </Field>
              </Row>

              {error && (
                <div className="text-xs text-[var(--color-danger)]">
                  {error}
                </div>
              )}
            </form>

            <footer className="px-5 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => !submitting && onClose()}
                className="h-10 px-4 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-sm font-medium text-white/85 hover:border-[var(--color-border-strong)] hover:text-white cursor-pointer transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "inline-flex items-center gap-2 h-10 px-5 rounded-full",
                  "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
                  "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
                  "transition-[filter,transform] duration-150",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4" /> {isEdit ? "Save changes" : "Create game"}
                  </>
                )}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Helpers ───────────────────────────────────────────────────

const inputClass = cn(
  "w-full h-10 px-3 rounded-md text-sm text-white",
  "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
  "outline-none transition-[border-color]",
  "focus:border-[var(--color-neon-cyan)]",
  "placeholder:text-white/40 disabled:opacity-60",
);

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] font-mono text-white/35">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}

function PillSelect({
  options,
  values,
  onChange,
}: {
  options: readonly string[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(active ? values.filter((v) => v !== opt) : [...values, opt])
            }
            className={cn(
              "px-3 h-8 rounded-full text-xs font-medium border cursor-pointer transition-colors",
              active
                ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white"
                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-white/70 hover:text-white hover:border-[var(--color-border-strong)]",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ServiceBlock({
  title,
  value,
  onChange,
}: {
  title: string;
  value: { enabled: boolean; examples: string[] };
  onChange: (next: { enabled: boolean; examples: string[] }) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{title}</span>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) =>
              onChange({ ...value, enabled: e.target.checked })
            }
            className="size-4 accent-[var(--color-neon-cyan)]"
          />
          <span className="text-xs text-white/75">Enabled</span>
        </label>
      </div>
      {value.enabled && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {value.examples.map((ex, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-[var(--color-bg-deep)]/70 border border-[var(--color-border-subtle)] text-[11px] text-white"
              >
                {ex}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      examples: value.examples.filter((_, idx) => idx !== i),
                    })
                  }
                  className="text-white/55 hover:text-white"
                  aria-label={`Remove ${ex}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (draft.trim()) {
                    onChange({
                      ...value,
                      examples: [...value.examples, draft.trim()],
                    });
                    setDraft("");
                  }
                }
              }}
              placeholder="Add example (press Enter)"
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TopUpBlock({
  value,
  onChange,
}: {
  value: { enabled: boolean; currency_name: string | null };
  onChange: (next: { enabled: boolean; currency_name: string | null }) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">Top-up</span>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) =>
              onChange({ ...value, enabled: e.target.checked })
            }
            className="size-4 accent-[var(--color-neon-cyan)]"
          />
          <span className="text-xs text-white/75">Enabled</span>
        </label>
      </div>
      {value.enabled && (
        <input
          type="text"
          value={value.currency_name ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              currency_name: e.target.value || null,
            })
          }
          placeholder="Currency name (e.g. Valorant Points)"
          className={inputClass}
        />
      )}
    </div>
  );
}
