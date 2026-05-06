"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Target,
  GraduationCap,
  Calendar,
  Zap,
  Users,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageCircle,
  Eye,
  EyeOff,
  Crown,
  ShieldOff,
  Tv,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Stepper, type StepDef } from "@/components/sell/Stepper";
import { ImageDrop } from "@/components/sell/ImageDrop";
import { BoostCard } from "@/components/boosts/BoostCard";
import {
  emptyDraft,
  loadDraft,
  saveDraft,
  clearDraft,
  validateStep,
  usesRankRange,
  type ListingDraft,
  type StepError,
  type StepId,
} from "@/lib/sell/draft";
import { games } from "@/lib/data/catalog";
import {
  serviceTypes,
  type BoostListing,
  type ServiceType,
} from "@/lib/data/boostListings";
import { addPublishedListing, generateListingId } from "@/lib/data/userListings";
import {
  getLadder,
  queueTypes,
  regions,
  type QueueType,
  type Region,
  type RankTier,
} from "@/lib/data/ranks";
import type { UnifiedUser } from "@/hooks/useAuth";

const STEPS: Array<StepDef & { id: StepId }> = [
  { id: "service", label: "Service" },
  { id: "content", label: "Cover & description" },
  { id: "pricing", label: "Pricing & SLA" },
  { id: "options", label: "Options" },
  { id: "review", label: "Review" },
];

interface SellerWizardProps {
  user: UnifiedUser;
}

export function SellerWizard({ user }: SellerWizardProps) {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(() => emptyDraft());
  const [errors, setErrors] = useState<StepError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  // Rehydrate draft from localStorage on mount
  useEffect(() => {
    const saved = loadDraft();
    if (saved) setDraft(saved);
  }, []);

  // Persist on every change
  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const currentStep = STEPS[stepIdx];

  function patch(p: Partial<ListingDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function next() {
    const stepErrors = validateStep(currentStep.id, draft);
    setErrors(stepErrors);
    if (stepErrors.length > 0) return;
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }

  function back() {
    setErrors([]);
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function jump(i: number) {
    if (i >= stepIdx) return;
    setErrors([]);
    setStepIdx(i);
  }

  async function publish() {
    const allErrors = validateStep("review", draft);
    setErrors(allErrors);
    if (allErrors.length > 0) {
      // Jump back to first failing step
      for (let i = 0; i < STEPS.length - 1; i++) {
        const stepErrs = validateStep(STEPS[i].id, draft);
        if (stepErrs.length > 0) {
          setStepIdx(i);
          return;
        }
      }
      return;
    }
    setSubmitting(true);
    // Brief simulated network so the loading state is visible
    await new Promise((r) => setTimeout(r, 600));

    // Persist to the local listings store so /boosts picks it up immediately.
    // Replace the preview's placeholder id with a real unique id.
    const listing: BoostListing = {
      ...buildPreview(draft, user),
      id: generateListingId(),
    };
    addPublishedListing(listing);

    clearDraft();
    setSubmitting(false);
    setPublished(true);
  }

  if (published) {
    return <PublishedConfirmation onView={() => router.push("/boosts")} />;
  }

  return (
    <div className="space-y-8">
      <Stepper steps={STEPS} currentIdx={stepIdx} onJump={jump} />

      {errors.length > 0 && <ErrorBanner errors={errors} />}

      <div className="min-h-[400px]">
        {currentStep.id === "service" && (
          <StepService draft={draft} patch={patch} errors={errors} />
        )}
        {currentStep.id === "content" && (
          <StepContent draft={draft} patch={patch} errors={errors} />
        )}
        {currentStep.id === "pricing" && (
          <StepPricing draft={draft} patch={patch} errors={errors} />
        )}
        {currentStep.id === "options" && (
          <StepOptions draft={draft} patch={patch} />
        )}
        {currentStep.id === "review" && <StepReview draft={draft} user={user} />}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-[var(--color-border-subtle)]">
        <Button
          variant="ghost"
          size="md"
          onClick={back}
          disabled={stepIdx === 0}
          className="text-white/80"
        >
          <ArrowLeft className="size-4" /> Back
        </Button>

        <div className="text-xs font-mono text-white/50">
          Step {stepIdx + 1} of {STEPS.length}
        </div>

        {currentStep.id === "review" ? (
          <Button size="md" onClick={publish} loading={submitting}>
            <Sparkles className="size-4" /> {submitting ? "Publishing…" : "Publish listing"}
          </Button>
        ) : (
          <Button size="md" onClick={next}>
            Next <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Errors banner ──────────────────────────────────────────────

function ErrorBanner({ errors }: { errors: StepError[] }) {
  return (
    <div className="rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="size-4 text-[var(--color-danger)]" />
        <span className="text-sm font-semibold text-white">Fix the following before continuing</span>
      </div>
      <ul className="text-xs text-white/80 list-disc pl-5 space-y-1">
        {errors.map((e, i) => (
          <li key={`${e.field}-${i}`}>{e.message}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Step 1: Service & Game ─────────────────────────────────────

interface StepProps {
  draft: ListingDraft;
  patch: (p: Partial<ListingDraft>) => void;
  errors?: StepError[];
}

function StepService({ draft, patch, errors }: StepProps) {
  const titleErr = errors?.find((e) => e.field === "title");
  return (
    <div className="space-y-8">
      <SectionHeader
        title="What are you offering?"
        subtitle="Pick the game you main and the kind of service buyers will get."
      />

      <Field label="Game">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {games.map((g) => {
            const active = g.slug === draft.game;
            return (
              <button
                key={g.slug}
                type="button"
                onClick={() => {
                  // Reset rank indices when game changes since ladders differ
                  const ladder = getLadder(g.slug);
                  patch({
                    game: g.slug,
                    fromIdx: 0,
                    toIdx: Math.min(ladder.tiers.length - 1, 4),
                  });
                }}
                className={cn(
                  "relative px-4 py-4 rounded-xl border cursor-pointer select-none text-left",
                  "transition-[border-color,transform,background-color,box-shadow] duration-[var(--duration-normal)]",
                  "hover:-translate-y-0.5",
                  active
                    ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/5 shadow-[0_0_24px_oklch(78%_0.18_200/25%)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 hover:border-[var(--color-border-strong)]",
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: g.accent, boxShadow: `0 0 10px ${g.accent}` }}
                  />
                  <span className="text-base font-semibold text-white">{g.name}</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                  {g.publisher} · {g.region}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Service type">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {serviceTypes.map((s) => {
            const Icon = serviceIcon(s);
            const active = s === draft.serviceType;
            return (
              <button
                key={s}
                type="button"
                onClick={() => patch({ serviceType: s })}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 h-12 rounded-lg border cursor-pointer select-none",
                  "transition-[border-color,background-color,transform] duration-[var(--duration-normal)]",
                  "hover:-translate-y-0.5",
                  active
                    ? "border-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/10 text-white shadow-[0_0_24px_oklch(70%_0.28_340/25%)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 text-white/80 hover:border-[var(--color-border-strong)] hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-[var(--color-neon-magenta)]" : "text-white/60",
                  )}
                />
                <span className="text-sm font-medium">{s}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Listing title"
        hint={`${draft.title.length}/80`}
        error={titleErr?.message}
      >
        <input
          type="text"
          value={draft.title}
          maxLength={80}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder='e.g. "Iron → Diamond Rank Boost · Solo/Duo"'
          className={cn(
            "w-full h-12 px-4 rounded-lg outline-none text-base text-white placeholder:text-white/40",
            "border bg-[var(--color-bg-panel)]/60 transition-[border-color,box-shadow]",
            titleErr
              ? "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_oklch(65%_0.24_25/15%)]"
              : "border-[var(--color-border-subtle)] focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
          )}
        />
      </Field>
    </div>
  );
}

function serviceIcon(s: ServiceType): React.ComponentType<{ className?: string }> {
  switch (s) {
    case "Rank Boost":
      return Trophy;
    case "Placement Matches":
      return Target;
    case "Coaching":
      return GraduationCap;
    case "Daily Wins":
      return Calendar;
    case "Achievement":
      return Zap;
    case "Win Boost":
      return Users;
  }
}

// ── Step 2: Cover & Description ────────────────────────────────

function StepContent({ draft, patch, errors }: StepProps) {
  const descErr = errors?.find((e) => e.field === "description");
  const coverErr = errors?.find((e) => e.field === "coverImage");
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Show, don't tell"
        subtitle="A strong cover image and clear description double your conversion."
      />

      <Field label="Cover image" error={coverErr?.message}>
        <ImageDrop value={draft.coverImage} onChange={(v) => patch({ coverImage: v })} />
      </Field>

      <Field
        label="Description"
        hint={`${draft.description.length} chars · min 30`}
        error={descErr?.message}
      >
        <textarea
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={8}
          maxLength={2000}
          placeholder="What makes your boost different? Average win-rate? Coaching style? Team setup?"
          className={cn(
            "w-full px-4 py-3 rounded-lg outline-none text-base text-white placeholder:text-white/40",
            "border bg-[var(--color-bg-panel)]/60 resize-y min-h-[160px]",
            "transition-[border-color,box-shadow]",
            descErr
              ? "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_oklch(65%_0.24_25/15%)]"
              : "border-[var(--color-border-subtle)] focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
          )}
        />
      </Field>
    </div>
  );
}

// ── Step 3: Pricing & SLA ──────────────────────────────────────

function StepPricing({ draft, patch, errors }: StepProps) {
  const showRanks = usesRankRange(draft.serviceType);
  const ladder = getLadder(draft.game);
  const fromTier = ladder.tiers[draft.fromIdx];
  const toTier = ladder.tiers[draft.toIdx];

  function setFrom(i: number) {
    patch({ fromIdx: i, toIdx: Math.max(i, draft.toIdx) });
  }
  function setTo(i: number) {
    patch({ fromIdx: Math.min(i, draft.fromIdx), toIdx: i });
  }

  const priceErr = errors?.find((e) => e.field === "priceUsd");
  const etaErr = errors?.find((e) => e.field === "etaHours");
  const replyErr = errors?.find((e) => e.field === "responseMinutes");
  const rankErr = errors?.find((e) => e.field === "rankRange");

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Pricing & service-level"
        subtitle="What buyers will see. Be realistic with ETA — late deliveries hurt your rating."
      />

      {showRanks && (
        <Field label="Rank range" error={rankErr?.message}>
          <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <RankPreview label="From" tier={fromTier} />
              <RankPreview label="To" tier={toTier} highlighted />
            </div>
            <RankRow
              label="Current rank"
              tiers={ladder.tiers}
              selectedIdx={draft.fromIdx}
              otherIdx={draft.toIdx}
              mode="from"
              onPick={setFrom}
            />
            <RankRow
              label="Target rank"
              tiers={ladder.tiers}
              selectedIdx={draft.toIdx}
              otherIdx={draft.fromIdx}
              mode="to"
              onPick={setTo}
            />
          </div>
        </Field>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Field label="Price (USD)" hint="Buyers pay in USD or crypto" error={priceErr?.message}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-base font-mono">
              $
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.priceUsd || ""}
              onChange={(e) => patch({ priceUsd: Number(e.target.value) || 0 })}
              placeholder="0"
              className={cn(
                "w-full h-12 pl-8 pr-4 rounded-lg outline-none text-base text-white tabular-nums",
                "border bg-[var(--color-bg-panel)]/60 transition-[border-color,box-shadow]",
                priceErr
                  ? "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_oklch(65%_0.24_25/15%)]"
                  : "border-[var(--color-border-subtle)] focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
              )}
            />
          </div>
        </Field>

        <Field
          label="ETA (hours)"
          hint={`≈ ${formatEta(draft.etaHours)}`}
          error={etaErr?.message}
          icon={<Clock className="size-3.5" />}
        >
          <input
            type="number"
            min={1}
            max={720}
            step={1}
            value={draft.etaHours || ""}
            onChange={(e) => patch({ etaHours: Number(e.target.value) || 0 })}
            placeholder="24"
            className={cn(
              "w-full h-12 px-4 rounded-lg outline-none text-base text-white tabular-nums",
              "border bg-[var(--color-bg-panel)]/60 transition-[border-color,box-shadow]",
              etaErr
                ? "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_oklch(65%_0.24_25/15%)]"
                : "border-[var(--color-border-subtle)] focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
            )}
          />
        </Field>

        <Field
          label="Reply time (minutes)"
          hint="Average response in chat"
          error={replyErr?.message}
          icon={<MessageCircle className="size-3.5" />}
        >
          <input
            type="number"
            min={1}
            max={1440}
            step={1}
            value={draft.responseMinutes || ""}
            onChange={(e) => patch({ responseMinutes: Number(e.target.value) || 0 })}
            placeholder="5"
            className={cn(
              "w-full h-12 px-4 rounded-lg outline-none text-base text-white tabular-nums",
              "border bg-[var(--color-bg-panel)]/60 transition-[border-color,box-shadow]",
              replyErr
                ? "border-[var(--color-danger)] focus:shadow-[0_0_0_3px_oklch(65%_0.24_25/15%)]"
                : "border-[var(--color-border-subtle)] focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
            )}
          />
        </Field>
      </div>
    </div>
  );
}

function RankPreview({
  label,
  tier,
  highlighted,
}: {
  label: string;
  tier: RankTier;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 border bg-[var(--color-bg-panel-elevated)]/50",
      )}
      style={{
        borderColor: highlighted ? tier.accent : "var(--color-border-subtle)",
        boxShadow: highlighted ? `0 0 24px ${tier.accent}30` : undefined,
      }}
    >
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-2.5">
        <span
          className="size-3 rounded-full"
          style={{ background: tier.accent, boxShadow: `0 0 10px ${tier.accent}` }}
        />
        <span
          className="text-base font-display font-bold"
          style={{ color: tier.accent }}
        >
          {tier.label}
        </span>
      </div>
    </div>
  );
}

interface RankRowProps {
  label: string;
  tiers: RankTier[];
  selectedIdx: number;
  otherIdx: number;
  mode: "from" | "to";
  onPick: (idx: number) => void;
}

function RankRow({ label, tiers, selectedIdx, otherIdx, mode, onPick }: RankRowProps) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60 mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map((t, i) => {
          const active = i === selectedIdx;
          const inRange = mode === "from" ? i <= otherIdx : i >= otherIdx;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(i)}
              className={cn(
                "px-2.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider cursor-pointer select-none",
                "border transition-all duration-150",
                active
                  ? "text-white"
                  : inRange
                  ? "text-white/80 hover:text-white"
                  : "text-white/40 hover:text-white/70",
              )}
              style={
                active
                  ? {
                      borderColor: t.accent,
                      background: `${t.accent}1f`,
                      boxShadow: `0 0 12px ${t.accent}55`,
                    }
                  : {
                      borderColor: "var(--color-border-subtle)",
                      background: inRange
                        ? "var(--color-bg-panel-elevated)"
                        : "var(--color-bg-panel)",
                    }
              }
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full" style={{ background: t.accent }} />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 4: Options ────────────────────────────────────────────

function StepOptions({ draft, patch }: StepProps) {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Where & how do you play?"
        subtitle="Help buyers find you faster. These show up as filters on the Boosts page."
      />

      <Field label="Region">
        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <PillToggle
              key={r}
              active={draft.region === r}
              onClick={() => patch({ region: r as Region })}
            >
              {r}
            </PillToggle>
          ))}
        </div>
      </Field>

      <Field label="Queue type">
        <div className="flex flex-wrap gap-2">
          {queueTypes.map((q) => (
            <PillToggle
              key={q}
              active={draft.queueType === q}
              onClick={() => patch({ queueType: q as QueueType })}
            >
              {q}
            </PillToggle>
          ))}
        </div>
      </Field>

      <Field label="Mode" hint="Service modes you support">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ModeToggle
            icon={ShieldOff}
            label="Offline mode"
            sub="Booster appears offline to the buyer's friends"
            active={draft.offlineMode}
            onChange={(v) => patch({ offlineMode: v })}
          />
          <ModeToggle
            icon={Tv}
            label="Stream session"
            sub="Buyer can watch you play live"
            active={draft.streamSession}
            onChange={(v) => patch({ streamSession: v })}
          />
          <ModeToggle
            icon={Crown}
            label="Priority queue"
            sub="Start within 1h of order"
            active={draft.priorityQueue}
            onChange={(v) => patch({ priorityQueue: v })}
          />
        </div>
      </Field>
    </div>
  );
}

function PillToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 h-10 rounded-full border cursor-pointer select-none",
        "text-sm font-medium transition-[border-color,background-color,color,transform]",
        "hover:-translate-y-0.5",
        active
          ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 text-white/80 hover:border-[var(--color-border-strong)] hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function ModeToggle({
  icon: Icon,
  label,
  sub,
  active,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border text-left cursor-pointer select-none",
        "transition-[border-color,background-color,box-shadow,transform] duration-[var(--duration-normal)]",
        "hover:-translate-y-0.5",
        active
          ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/5 shadow-[0_0_24px_oklch(78%_0.18_200/20%)]"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 hover:border-[var(--color-border-strong)]",
      )}
    >
      <span
        className={cn(
          "grid place-items-center size-9 rounded-lg shrink-0",
          active
            ? "bg-[var(--color-neon-cyan)]/15 text-[var(--color-neon-cyan)]"
            : "bg-[var(--color-bg-panel-elevated)] text-white/60",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-white/60 mt-0.5">{sub}</div>
      </div>
      <span
        className={cn(
          "absolute top-2.5 right-2.5 size-2.5 rounded-full",
          active
            ? "bg-[var(--color-neon-cyan)]"
            : "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
        )}
        style={active ? { boxShadow: "0 0 8px var(--color-neon-cyan)" } : undefined}
        aria-hidden
      />
    </button>
  );
}

// ── Step 5: Review ─────────────────────────────────────────────

function StepReview({ draft, user }: { draft: ListingDraft; user: UnifiedUser }) {
  const previewListing = useMemo<BoostListing>(() => buildPreview(draft, user), [draft, user]);
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Review & publish"
        subtitle="This is what buyers will see in the listing grid. Double-check before going live."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <ReviewRow label="Game">
            {games.find((g) => g.slug === draft.game)?.name ?? draft.game}
          </ReviewRow>
          <ReviewRow label="Service type">{draft.serviceType ?? "—"}</ReviewRow>
          <ReviewRow label="Title">{draft.title || "—"}</ReviewRow>
          <ReviewRow label="Region · Queue">
            {draft.region} · {draft.queueType}
          </ReviewRow>
          <ReviewRow label="Pricing">
            ${draft.priceUsd.toFixed(2)} · ETA {formatEta(draft.etaHours)} · reply {draft.responseMinutes}m
          </ReviewRow>
          <ReviewRow label="Modes">
            <div className="flex flex-wrap gap-1.5">
              {draft.offlineMode && <Tag icon={EyeOff}>Offline</Tag>}
              {draft.streamSession && <Tag icon={Eye}>Stream</Tag>}
              {draft.priorityQueue && <Tag icon={Crown}>Priority</Tag>}
              {!draft.offlineMode && !draft.streamSession && !draft.priorityQueue && (
                <span className="text-white/50 text-sm">No special modes</span>
              )}
            </div>
          </ReviewRow>
          <ReviewRow label="Description">
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {draft.description || "—"}
            </p>
          </ReviewRow>
        </div>

        <div className="lg:sticky lg:top-24 self-start">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60 mb-2">
            Live preview
          </div>
          <div className="max-w-sm">
            <BoostCard listing={previewListing} />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildPreview(draft: ListingDraft, user: UnifiedUser): BoostListing {
  const ladder = getLadder(draft.game);
  const fromTier = ladder.tiers[draft.fromIdx];
  const toTier = ladder.tiers[draft.toIdx];
  const handle =
    user.displayName?.replace(/\s+/g, "_").toUpperCase() ??
    (user.walletAddress
      ? `OP_${user.walletAddress.slice(2, 8).toUpperCase()}`
      : "NEW_BOOSTER");
  return {
    id: "preview",
    game: draft.game,
    serviceType: draft.serviceType ?? "Rank Boost",
    title: draft.title || "Your boost listing",
    fromRankId: fromTier.id,
    toRankId: toTier.id,
    fromIdx: draft.fromIdx,
    toIdx: draft.toIdx,
    region: draft.region,
    queueType: draft.queueType,
    priceUsd: draft.priceUsd,
    etaHours: draft.etaHours,
    responseMinutes: draft.responseMinutes,
    boosterTag: handle,
    boosterAvatarSeed: user.id,
    boosterRating: 5.0,
    ordersCompleted: 0,
    rarity: "rare",
    hot: false,
    options: {
      offlineMode: draft.offlineMode,
      streamSession: draft.streamSession,
      priorityQueue: draft.priorityQueue,
    },
  };
}

function ReviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 items-start py-3 border-b border-[var(--color-border-subtle)] last:border-b-0">
      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60 pt-0.5">
        {label}
      </div>
      <div className="text-sm text-white">{children}</div>
    </div>
  );
}

function Tag({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 text-xs text-[var(--color-neon-cyan)]">
      <Icon className="size-3" />
      {children}
    </span>
  );
}

// ── Published confirmation ─────────────────────────────────────

function PublishedConfirmation({ onView }: { onView: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-success)]/40 bg-[var(--color-success)]/5 p-10 text-center">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-success)]/15 mb-4">
        <CheckCircle2 className="size-7 text-[var(--color-success)]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">Listing published</h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto">
        Buyers can now find your boost on the marketplace. We'll notify you the moment your first
        order comes in.
      </p>
      <div className="mt-6">
        <Button size="md" onClick={onView}>
          View on marketplace <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Shared atoms ───────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2
        className="font-display font-bold text-white"
        style={{ fontSize: "var(--text-h1)", lineHeight: 1.05 }}
      >
        {title}
      </h2>
      <p className="mt-2 text-white/70 max-w-2xl">{subtitle}</p>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, hint, error, icon, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-white">
          {icon}
          {label}
        </label>
        {hint && <span className="text-[11px] font-mono text-white/50">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-danger)]">
          <AlertCircle className="size-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function formatEta(hours: number): string {
  if (hours <= 0) return "—";
  if (hours < 24) return `${hours}h`;
  const d = Math.round(hours / 24);
  return `${d}d`;
}
