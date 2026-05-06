"use client";

import { useState } from "react";
import { Gift, Trophy, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LootBoxBurst } from "@/components/gamified/LootBoxBurst";
import { SectionHeader } from "@/components/sections/TrendingBoosts";
import type { Rarity } from "@/components/ui/GlowingBorder";

/**
 * Reward archetypes — these describe *kinds of rewards* the system can drop,
 * not specific user data. Used to demo the loot crate burst animation.
 */
const rewardArchetypes: Array<{ rarity: Rarity; title: string; sub: string }> = [
  { rarity: "common", title: "XP", sub: "Earned with every order" },
  { rarity: "rare", title: "Discount Coupon", sub: "Unlocked at milestone levels" },
  { rarity: "epic", title: "Limited Skin Drop", sub: "Seasonal event reward" },
  { rarity: "legendary", title: "Store Credit", sub: "Convert XP into balance" },
  { rarity: "mythic", title: "Black Card", sub: "Lifetime discount + perks" },
];

export function LevelShowcase() {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState(rewardArchetypes[2]);

  function openLootBox() {
    const next = rewardArchetypes[Math.floor(Math.random() * rewardArchetypes.length)];
    setPick(next);
    setOpen(true);
  }

  return (
    <section className="relative py-[var(--spacing-section)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <SectionHeader
            eyebrow="The G3MX Loop"
            title="Every order levels you up"
            subtitle="Buy boosts, trade accounts, top up — earn XP across all of it. Hit milestone levels to unlock loot crates with discounts, free top-ups, and limited skins."
          />
          <div className="mt-8">
            <Button size="lg" onClick={openLootBox}>
              <Gift className="size-5" /> Try a Loot Crate
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FeatureCard icon={Trophy} title="Earn XP" sub="Every completed order pays out" />
          <FeatureCard icon={Coins} title="Spend on perks" sub="Coupons, store credit, top-ups" />
          <FeatureCard icon={Sparkles} title="Seasonal drops" sub="Limited rarities each season" />
          <FeatureCard icon={Gift} title="Mythic milestones" sub="Lifetime perks at the top tier" />
        </ul>
      </div>

      <LootBoxBurst
        open={open}
        rarity={pick.rarity}
        title={pick.title}
        subtitle={pick.sub}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-3 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60">
      <span className="grid place-items-center size-9 rounded-md bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 shrink-0">
        <Icon className="size-4 text-[var(--color-neon-cyan)]" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/60 mt-0.5">{sub}</div>
      </div>
    </li>
  );
}
