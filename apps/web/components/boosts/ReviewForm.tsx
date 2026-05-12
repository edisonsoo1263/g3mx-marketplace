"use client";

import { useState, type FormEvent } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { submitListingReview } from "@/lib/api/reviews-client";
import type { ReviewRating, SellerReview } from "@/lib/types/reviews";

interface Props {
  listingId: string;
  sellerUserId: string;
  /** Called with the freshly-created review on success — parent can prepend it to its list. */
  onSubmitted: (review: SellerReview) => void;
}

type Status = "idle" | "submitting" | "success" | "error";

/**
 * ReviewForm — star picker + optional title + body textarea + submit.
 *
 * Auth: pulls the Privy access token via getAccessToken() and forwards as
 * Bearer. The server verifies the JWT and uses the verified user id as
 * buyer_user_id, so the client can't claim to be someone else.
 *
 * One review per listing per buyer is enforced by a UNIQUE index in the DB;
 * the 409 response from the API is surfaced as a friendly error here.
 */
export function ReviewForm({ listingId, sellerUserId, onSubmitted }: Props) {
  const { getAccessToken } = usePrivy();
  const [rating, setRating] = useState<ReviewRating | 0>(0);
  const [hoverRating, setHoverRating] = useState<ReviewRating | 0>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;

    if (rating === 0) {
      setErrorMsg("Pick a rating first — 1 to 5 stars.");
      return;
    }
    if (body.trim().length < 10) {
      setErrorMsg("Add a few sentences (at least 10 characters).");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sign in to leave a review");

      const review = await submitListingReview(token, listingId, {
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        seller_user_id: sellerUserId,
      });
      onSubmitted(review);
      setStatus("success");
      // Reset form after a moment so the user sees the success state
      setTimeout(() => {
        setRating(0);
        setTitle("");
        setBody("");
        setStatus("idle");
      }, 2200);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't submit review");
    }
  }

  const effectiveRating = hoverRating || rating;
  const submitting = status === "submitting";
  const success = status === "success";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/70 p-5 space-y-4",
        success && "border-[var(--color-success)]/40 bg-[var(--color-success)]/5",
      )}
    >
      <header>
        <h3 className="font-display text-base font-bold text-white">
          Leave a review
        </h3>
        <p className="mt-1 text-xs text-white/65">
          Share how the boost went — verified buyers only.
        </p>
      </header>

      {/* Star picker */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          Rating
        </span>
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label="Star rating"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= effectiveRating;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                onClick={() => setRating(n as ReviewRating)}
                onMouseEnter={() => setHoverRating(n as ReviewRating)}
                disabled={submitting || success}
                className={cn(
                  "grid place-items-center size-10 rounded-md cursor-pointer transition-colors",
                  "hover:bg-[var(--color-bg-panel-elevated)] disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    filled
                      ? "fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]"
                      : "text-white/35",
                  )}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm font-mono text-white/85 tabular-nums">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Title (optional) */}
      <label className="block">
        <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-1.5">
          Title <span className="text-white/35">(optional)</span>
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          disabled={submitting || success}
          placeholder="One-line summary"
          className={cn(
            "w-full h-10 px-3 rounded-md text-sm text-white",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            "outline-none focus:border-[var(--color-neon-cyan)] transition-colors",
            "placeholder:text-white/40 disabled:opacity-60",
          )}
        />
      </label>

      {/* Body */}
      <label className="block">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
            What happened
          </span>
          <span className="text-[10px] font-mono text-white/35">
            {body.length}/4000
          </span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          rows={4}
          disabled={submitting || success}
          placeholder="Pace of the boost, communication, did they hit the SLA — anything future buyers should know."
          className={cn(
            "w-full px-3 py-2 rounded-md text-sm text-white resize-y min-h-[120px]",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            "outline-none focus:border-[var(--color-neon-cyan)] transition-colors",
            "placeholder:text-white/40 disabled:opacity-60",
          )}
        />
      </label>

      {errorMsg && (
        <div className="flex items-start gap-2 text-xs text-[var(--color-danger)]">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {success && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-success)]">
            <CheckCircle2 className="size-4" /> Review posted
          </span>
        )}
        <button
          type="submit"
          disabled={submitting || success}
          className={cn(
            "inline-flex items-center gap-2 h-10 px-4 rounded-full",
            "text-sm font-semibold cursor-pointer select-none",
            "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]",
            "hover:brightness-110 active:scale-[0.98]",
            "transition-[filter,transform] duration-150",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Posting…
            </>
          ) : (
            "Post review"
          )}
        </button>
      </div>
    </form>
  );
}
