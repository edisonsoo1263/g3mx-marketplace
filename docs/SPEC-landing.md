# SPEC — Landing Page (`/`)

**Status:** implemented (v0.1) · cyberpunk/neon direction
**Route:** `apps/web/app/page.tsx`

## Goal

Convert curious gamers into first-time buyers across three product lines (boosting, account trading, top-ups) while building trust signals and showcasing the gamified rewards loop.

## Above the fold

- **Hero** — animated word-by-word reveal of the three-line value prop (`Level up. / Trade accounts. / Top up cheaper.`), live-status badge ("14,328 boosters online"), two CTAs ("Browse Boosts" primary, "Sell My Account" secondary), supported-titles ticker.

## Below the fold (Z-pattern reading order)

1. **TrustBar** — escrow / verified / 24-7 / loot rewards.
2. **Trending Boosts** — 4-up `SpotlightCard` grid. Hot badge + rarity badge + tier upgrade chips + booster rep stars.
3. **Flash Deals** — `BentoGrid` with 1 hero deal (2×2, `GlowingBorder` rarity-tinted, live countdown) + 2 side deals.
4. **Top-up Rail** — 4-up grid of `SpotlightCard` recharge packs with bonus chips.
5. **Level Showcase** — split layout: `LevelBar` × 2 + interactive "Try a Loot Crate" button that fires `LootBoxBurst`.
6. **Footer** — three-column linkmap.

## Conversion mechanics

- CTAs use neon-cyan `Button` with glow shadow (max contrast on dark).
- Auth is deferred — Connect is in nav but not blocking discovery. Privy/Firebase login fires only on Buy intent.
- Countdown timers on flash deals create urgency (real `setInterval` clock).
- Stock-left text on hero deal ("Only 1 left in stock") triggers loss aversion.

## State / data

- Seed data lives in `apps/web/lib/data/catalog.ts` (games, trending boosts, flash account deals, top-up packs). Swap for Supabase / API in v0.2.

## Performance

- First Load JS ~947kB (Privy + Wagmi heavy). Top priority for v0.2: lazy-load PrivyProvider behind `<Suspense>` so cold landing visit doesn't pay the wallet-stack cost.
- Fonts subset to latin via `next/font/google`.
- Hero ticker uses CSS `animation: ticker` on transform — compositor-friendly.
