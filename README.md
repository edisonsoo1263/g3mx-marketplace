# G3MX Marketplace

> **Level up. Trade accounts. Top up cheaper.**
> Crypto-native marketplace for game boosting — verified boosters, escrow protection, and a gamified leveling system that rewards every order.

A Next.js 15 + React 19 monorepo with a cyberpunk visual identity (neon cyan + magenta on neutral grey), animated borders, WebGL aurora hero, and game-themed backgrounds for each listing.

![Status](https://img.shields.io/badge/status-open%20beta-magenta) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-19-cyan) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

---

## Highlights

- **Web3 + Web2 auth bridge** — Privy (wallet + social-to-wallet) and Firebase (Google / GitHub / X) unified behind one `useAuth()` hook
- **Animated everything** — `border-beam` rainbow borders on buttons & inputs, `SoftAurora` WebGL hero backdrop, framer-motion list staggers, game-themed CSS-only backdrops on every boost card
- **Seller listing flow** — 5-step wizard with autosaved drafts, image drop, live `BoostCard` preview, and localStorage-backed publish that the buyer's `/boosts` page picks up immediately
- **Buyer discovery** — type-ahead search, game tabs, service-type pills, visual rank picker with live price/ETA/XP calculation, sortable grid
- **Persistent sidebar** with collapse-to-rail mode (preference persisted), mobile drawer fallback
- **Strict TypeScript**, zero `any` in app code, accessibility-aware (reduced-motion, ARIA, focus-visible rings)

---

## Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 15 (App Router, React 19, Turbopack) |
| Styling | Tailwind v4 (CSS-first `@theme` config) |
| Motion | framer-motion (with `prefers-reduced-motion` guard) |
| WebGL | `ogl` (SoftAurora hero shader) |
| Animated borders | [`border-beam`](https://github.com/Jakubantalik/border-beam) |
| Web3 auth | `@privy-io/react-auth` + `@privy-io/wagmi` |
| Chain RPC | wagmi + viem (BSC default, Ethereum / Polygon / Arbitrum) |
| Web2 auth | `firebase/auth` (Google, GitHub, X providers) |
| Server state | `@tanstack/react-query` |
| Validation | zod |
| Icons | lucide-react |

---

## Folder layout

```
apps/web/
├── app/
│   ├── globals.css                  Tailwind v4 @theme tokens + global keyframes
│   ├── layout.tsx                   Root layout + Providers + Sidebar mount
│   ├── providers.tsx                Privy → Wagmi → ReactQuery → Auth → Sidebar
│   ├── page.tsx                     Landing (Hero / TrustBar / Trending / LevelShowcase)
│   ├── boosts/page.tsx              Marketplace grid + filters + configurator
│   └── sell/onboarding/page.tsx     Seller wizard host (auth-gated)
├── components/
│   ├── ui/                          Button, SpotlightCard, GlowingBorder, BentoGrid,
│   │                                AnimatedText, PixelBadge, SoftAurora
│   ├── gamified/                    LootBoxBurst, RarityBadge
│   ├── layout/                      Navbar, Sidebar, UserMenu (WalletChip + ProfilePanel)
│   ├── sections/                    Hero, TrustBar, TrendingBoosts, LevelShowcase, Footer
│   ├── boosts/                      BoostsPageHeader, GameTabs, HeroSearch,
│   │                                QuickFilterPills, BoostConfigurator, BoostCard,
│   │                                GameBackdrop, BoostsResultsHeader, RecentlyCompletedTicker
│   └── sell/                        SellerWizard, ImageDrop, Stepper
├── hooks/
│   ├── useAuth.tsx                  Unified Privy + Firebase session model
│   ├── useSidebar.tsx               open / collapsed (persisted) state
│   └── useListings.ts               Reactive merge of seed + user-published listings
└── lib/
    ├── auth/                        firebase.ts (client init), wagmi.ts (chain config)
    ├── data/                        catalog.ts (games), boostListings.ts (seed types),
    │                                ranks.ts (rank ladders / regions / queue types),
    │                                userListings.ts (localStorage-backed publish store)
    ├── sell/draft.ts                Wizard state + per-step validation
    └── utils/cn.ts                  clsx + tailwind-merge
```

---

## Quick start

Requires **Node ≥ 20** and **pnpm ≥ 9**.

```bash
pnpm install

# Copy the env template and fill in your keys (see "Environment" below)
cp apps/web/.env.example apps/web/.env.local

pnpm --filter @g3mx/web dev
```

App runs on **http://localhost:3000** (or 3001 if busy).

Without env vars, the auth layer falls back to a logged-out state — the landing page still renders, the seller wizard's auth gate prompts to connect, and `/boosts` shows seed empty-state.

### Environment

[`apps/web/.env.example`](apps/web/.env.example) lists every required variable.

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | https://dashboard.privy.io |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | https://cloud.walletconnect.com (optional) |
| `NEXT_PUBLIC_DEFAULT_CHAIN` | `bsc \| mainnet \| polygon \| arbitrum` |

> Firebase client config is intentionally public — security is enforced via Firebase Authorized Domains + Security Rules. The Privy App ID is a public client identifier.

### Available scripts

```bash
pnpm --filter @g3mx/web dev         # dev server (Turbopack)
pnpm --filter @g3mx/web build       # production build
pnpm --filter @g3mx/web start       # serve production build
pnpm --filter @g3mx/web typecheck   # tsc --noEmit
pnpm --filter @g3mx/web lint        # next lint
```

---

## Auth — the unified user

[`hooks/useAuth.tsx`](apps/web/hooks/useAuth.tsx) returns a single `UnifiedUser` regardless of which path the user signed in through:

```ts
interface UnifiedUser {
  id: string;
  source: "privy" | "firebase" | "both";
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;   // null when user is Web2-only
}
```

Login surfaces:

- `loginWithWallet()` → opens the Privy modal (wallet, email, social-to-wallet)
- `loginWithSocial("google" | "github" | "twitter")` → Firebase popup
- Either logs the user in. Both can be active simultaneously (`source: "both"`).

The auth-gated **Seller Gateway** in the sidebar (`List Your Service`) calls `loginWithWallet()` first, then routes to `/sell/onboarding`.

---

## Visual system

- **Theme tokens** (`apps/web/app/globals.css`) — neutral grey base + neon cyan/magenta/violet/amber/lime accent palette + 6 rarity tiers
- **Typography** — Space Grotesk (display) · Inter (body) · JetBrains Mono (stats)
- **SoftAurora** WebGL backdrop on the landing hero (cyan ↔ magenta band shader, mouse-tracking off by default)
- **Game-themed backdrops** — every `BoostCard` has a CSS-only animated background tuned to its game:
  - Valorant — tactical crosshair grid + drifting spike triangles + scan beam
  - LoL — hextech hexagon-with-diamond grid + slow conic gold sweep
  - CS2 — dense crosshair grid + horizontal bullet-trace streaks
  - Genshin — twinkling 4-point sparkles + drifting primogem rhombuses
  - MLBB — concentric skill-ring grid + diagonal speed lines
  - WoW — runic glyph circles + drifting blue mist particles
- **Animated borders** — `border-beam` on the Login button, search bar, WalletChip, and all `<Button>` instances (excluded: sidebar `List Your Service`, ghost variants, raw icon buttons)

---

## Seller flow → marketplace

```
[Sidebar "List Your Service"]
        ↓ (auth-gated)
/sell/onboarding
   1 Service       game card + service-type pill + title
   2 Cover         image drop (data URL preview) + description
   3 Pricing       rank range picker + price + ETA + reply time
   4 Options       region · queue · offline / stream / priority modes
   5 Review        live BoostCard preview + Publish
        ↓ addPublishedListing()
localStorage["g3mx_published_listings"]
        ↓ useListings() (custom event + storage event)
/boosts grid (newest first)
```

Drafts autosave to `localStorage["g3mx_listing_draft"]` so you can close the tab and resume.

---

## Marketplace experience

`/boosts` features:

- **Hero search** with type-ahead suggestions (games, service types, listing titles)
- **Sticky game tabs** — Valorant / Genshin / MLBB / LoL / WoW / CS2 (each with its accent color dot)
- **Service-type quick pills** — Rank Boost · Placement · Coaching · Daily Wins · Achievement · Win Boost
- **Boost Configurator** — visual rank picker (current → desired) with live price + ETA + XP reward calculation as you adjust
- **Sortable grid** — popular / price asc/desc / rating / fastest delivery
- **Empty states** that route the visitor to the seller flow

---

## Roadmap

- [ ] Wire Supabase / Postgres for real catalog persistence (replaces `localStorage` shim)
- [ ] Add `coverImage` and `description` fields to `BoostListing` so wizard step-2 content surfaces on `BoostCard`
- [ ] Real `useBalance` (wagmi) wired to the WalletChip
- [ ] `/checkout` flow with deferred auth gate + on-chain escrow contract
- [ ] Listing detail page (`/boosts/[id]`)
- [ ] My Orders / My Listings dashboards (the sidebar links currently 404)
- [ ] Lazy-load Privy + Wagmi behind a `<Suspense>` to bring landing First Load JS below 200kB
- [ ] Lighthouse + axe sweep
- [ ] Re-enable Accounts and Top-ups after the boosts MVP ships

---

## License

MIT — see [LICENSE](LICENSE).
