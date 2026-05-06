# G3MX Design System — Cyberpunk / Esports Gamified

> Replaces the prior "pixel cave" direction. Visual language is now **dark, neon-accented, layered**: high contrast, animated borders, glowing CTAs, monospace stats, and editorial bento layouts.

## Core principles

1. **Hierarchy first** — large fluid type for headlines (`var(--text-hero)` = 44 → 96px), monospace for stats, sans for body. Body never drops below 16px.
2. **Layered atmosphere** — radial gradient blooms behind hero, faint scanline overlay on `body::before`, glowing borders on premium tiles. No flat dashboard look.
3. **Color is semantic, not decorative** — neon cyan = primary action, magenta = accent / urgency, rarity colors strictly indicate item tier.
4. **Motion clarifies, never distracts** — use `transform / opacity / filter` only, respect `prefers-reduced-motion`, and never animate layout properties.

## Tokens (defined in `apps/web/app/globals.css` via Tailwind v4 `@theme`)

### Surfaces

| Token | Value (oklch) | Usage |
|------|---------------|-------|
| `--color-bg-deep` | `13% 0.02 270` | Page background |
| `--color-bg-panel` | `18% 0.025 268` | Card surface |
| `--color-bg-panel-elevated` | `22% 0.03 268` | Modals, popovers, chips |

### Neon accents (the "gamified palette")

| Token | Hex (approx) | Role |
|------|--------------|------|
| `--color-neon-cyan` | `#00f0ff` | Primary CTA, brand |
| `--color-neon-magenta` | `#ff2bd6` | Accent, urgency, countdowns |
| `--color-neon-violet` | `#8b5cf6` | Secondary accent |
| `--color-neon-lime` | `#aaff00` | Bonus / positive deltas |
| `--color-neon-amber` | `#ffb020` | Stars, highlights |

### Rarity tiers

`common · uncommon · rare · epic · legendary · mythic` — used by `<RarityBadge>`, `<GlowingBorder>`, and `<LootBoxBurst>`.

### Typography

- **Display** — Space Grotesk (`var(--font-display)`)
- **Body** — Inter (`var(--font-sans)`)
- **Mono / stats** — JetBrains Mono (`var(--font-mono)`)
- Fluid scale: `--text-hero`, `--text-display`, `--text-h1`, `--text-h2`, `--text-body` — all `clamp()` based.

### Motion

- `--duration-fast` 150ms · `--duration-normal` 280ms · `--duration-slow` 600ms
- `--ease-out-expo` for emphasis, `--ease-spring` for playful loot interactions

### Glow shadows

- `--shadow-glow-cyan`, `--shadow-glow-magenta` — used on primary buttons and active boosters

## Utilities

- `.neon-text-cyan`, `.neon-text-magenta` — colored text with matching glow
- `.glass-panel` — translucent panel with backdrop-blur + saturate
- `.scanlines` — subtle scanline overlay for hero deal cards

## Component vocabulary

| Component | File | Role |
|----------|------|------|
| `Button` | `components/ui/Button.tsx` | Primary / secondary / ghost / danger CTAs |
| `SpotlightCard` | `components/ui/SpotlightCard.tsx` | Mouse-tracking premium card (React Bits style) |
| `GlowingBorder` | `components/ui/GlowingBorder.tsx` | Rarity-tinted animated conic-gradient frame |
| `BentoGrid` / `BentoCell` | `components/ui/BentoGrid.tsx` | Asymmetric 4-col editorial grid |
| `AnimatedText` | `components/ui/AnimatedText.tsx` | Word/char staggered reveal |
| `PixelBadge` | `components/ui/PixelBadge.tsx` | Clip-path beveled badge (pixel-art accent) |
| `LevelBar` | `components/gamified/LevelBar.tsx` | XP progress with shimmer |
| `LootBoxBurst` | `components/gamified/LootBoxBurst.tsx` | Celebratory radial-rays overlay |
| `RarityBadge` | `components/gamified/RarityBadge.tsx` | Inline rarity chip |

## Three "React Bits"-style picks for this niche

1. **`SpotlightCard`** — perfect for premium account listings and featured boosters. Cursor reveals a radial highlight, communicating "interactive, valuable, hand-picked."
2. **`GlowingBorder`** (rarity-tier conic gradient) — wraps flash deals and loot drops. Visually conveys scarcity/rarity at a glance.
3. **`AnimatedText`** (word-staggered reveal) — used in the hero (`Level up. / Trade accounts. / Top up cheaper.`) to make the value-prop feel cinematic.
