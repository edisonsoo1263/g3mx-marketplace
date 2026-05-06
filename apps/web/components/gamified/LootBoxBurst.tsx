"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { Rarity } from "@/components/ui/GlowingBorder";
import { cn } from "@/lib/utils/cn";

interface LootBoxBurstProps {
  open: boolean;
  rarity?: Rarity;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  /** Auto-dismiss after this many ms. Set 0 to disable. */
  autoDismissMs?: number;
}

const rarityColor: Record<Rarity, string> = {
  common: "var(--color-rarity-common)",
  uncommon: "var(--color-rarity-uncommon)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
  mythic: "var(--color-rarity-mythic)",
};

/**
 * LootBoxBurst — celebratory overlay shown after a successful transaction or
 * top-up. Radiating light rays + scaled-in card + rarity-tinted glow.
 */
export function LootBoxBurst({
  open,
  rarity = "epic",
  title,
  subtitle,
  onClose,
  autoDismissMs = 3500,
}: LootBoxBurstProps) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!open || !autoDismissMs || !onClose) return;
    const t = setTimeout(onClose, autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs, onClose]);

  const color = rarityColor[rarity];
  const rays = Array.from({ length: 12 });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-bg-overlay)] backdrop-blur-sm"
          role="dialog"
          aria-live="polite"
        >
          {/* radiating rays */}
          {!prefersReduced &&
            rays.map((_, i) => (
              <motion.div
                key={i}
                className="absolute origin-center"
                initial={{ rotate: i * 30, scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 0.7, 0] }}
                transition={{ duration: 1.4, ease: "easeOut", delay: i * 0.02 }}
                style={{
                  width: 2,
                  height: "70vh",
                  background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
                }}
              />
            ))}

          <motion.div
            initial={{ scale: 0.6, opacity: 0, filter: "blur(12px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative px-10 py-8 rounded-[var(--radius-card)] text-center",
              "border-2 glass-panel",
            )}
            style={{
              borderColor: color,
              boxShadow: `0 0 80px ${color}66`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="text-xs font-mono uppercase tracking-[0.3em] mb-2"
              style={{ color }}
            >
              {rarity}
            </div>
            <div className="text-3xl md:text-4xl font-display font-bold text-[var(--color-text-primary)]">
              {title}
            </div>
            {subtitle && (
              <div className="mt-2 text-sm text-[var(--color-text-secondary)]">{subtitle}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
