import type { ServiceType } from "@/lib/data/boostListings";
import type { QueueType, Region } from "@/lib/data/ranks";

/**
 * Mutable form state for the seller listing wizard. A subset of BoostListing
 * — fields that come from the booster (system-derived fields like rating,
 * orders count, rarity, hot are filled by the platform).
 */
export interface ListingDraft {
  game: string;
  serviceType: ServiceType | null;
  title: string;
  description: string;
  coverImage: string | null; // data URL while local; replace with CDN URL on submit
  fromIdx: number;
  toIdx: number;
  region: Region;
  queueType: QueueType;
  priceUsd: number;
  etaHours: number;
  responseMinutes: number;
  offlineMode: boolean;
  streamSession: boolean;
  priorityQueue: boolean;
}

export const DRAFT_STORAGE_KEY = "g3mx_listing_draft";

export function emptyDraft(): ListingDraft {
  return {
    game: "valorant",
    serviceType: null,
    title: "",
    description: "",
    coverImage: null,
    fromIdx: 0,
    toIdx: 4,
    region: "GLOBAL",
    queueType: "Solo/Duo",
    priceUsd: 0,
    etaHours: 24,
    responseMinutes: 5,
    offlineMode: false,
    streamSession: false,
    priorityQueue: false,
  };
}

export function loadDraft(): ListingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...emptyDraft(), ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(draft: ListingDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // localStorage may be full (cover image data URLs are heavy) — fail silent
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** True when this service type involves climbing a rank ladder. */
export function usesRankRange(serviceType: ServiceType | null): boolean {
  if (!serviceType) return false;
  return (
    serviceType === "Rank Boost" ||
    serviceType === "Placement Matches" ||
    serviceType === "Win Boost"
  );
}

// ── Validation ────────────────────────────────────────────────

export type StepId = "service" | "content" | "pricing" | "options" | "review";

export interface StepError {
  field: string;
  message: string;
}

export function validateStep(step: StepId, draft: ListingDraft): StepError[] {
  const errors: StepError[] = [];
  switch (step) {
    case "service":
      if (!draft.serviceType) errors.push({ field: "serviceType", message: "Pick a service type" });
      if (draft.title.trim().length < 6)
        errors.push({ field: "title", message: "Title must be at least 6 characters" });
      if (draft.title.length > 80) errors.push({ field: "title", message: "Keep title under 80 characters" });
      break;
    case "content":
      if (draft.description.trim().length < 30)
        errors.push({ field: "description", message: "Description must be at least 30 characters" });
      if (!draft.coverImage) errors.push({ field: "coverImage", message: "Add a cover image" });
      break;
    case "pricing":
      if (draft.priceUsd <= 0) errors.push({ field: "priceUsd", message: "Price must be more than $0" });
      if (draft.priceUsd > 100_000)
        errors.push({ field: "priceUsd", message: "Price cap is $100,000" });
      if (draft.etaHours <= 0) errors.push({ field: "etaHours", message: "ETA must be more than 0 hours" });
      if (draft.responseMinutes <= 0)
        errors.push({ field: "responseMinutes", message: "Reply time must be more than 0 minutes" });
      if (usesRankRange(draft.serviceType) && draft.toIdx <= draft.fromIdx)
        errors.push({ field: "rankRange", message: "Desired rank must be higher than current" });
      break;
    case "options":
      // All options have safe defaults — no required fields
      break;
    case "review":
      // Re-run all earlier validation
      return [
        ...validateStep("service", draft),
        ...validateStep("content", draft),
        ...validateStep("pricing", draft),
      ];
  }
  return errors;
}
