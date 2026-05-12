# Notepad
<!-- Auto-managed by OMC. Manual edits preserved in MANUAL section. -->

## Priority Context
<!-- ALWAYS loaded. Keep under 500 chars. Critical discoveries only. -->

## Working Memory
<!-- Session notes. Auto-pruned after 7 days. -->

## MANUAL
<!-- User content. Never auto-pruned. -->
### 2026-05-07 16:59
# G3MX Marketplace — Session Continuity Memory (2026-05-05 → 2026-05-07)

Comprehensive record of everything built and decided so a future session can resume cleanly.

## Project status

- **Live on GitHub:** https://github.com/edisonsoo1263/g3mx-marketplace (private)
- **Stack:** Next.js 15 + React 19 + Tailwind v4 + TypeScript strict, pnpm monorepo at `apps/web/`
- **Theme:** Neutral-grey base + neon cyan/magenta/violet/amber/lime accent palette in oklch (CSS variables in `globals.css`)
- **Routes shipping:** `/` (landing), `/boosts` (marketplace), `/sell/onboarding` (seller wizard), `/api/chat` (AI support)
- **Routes pending:** `/account/orders`, `/account/listings`, `/account/wallet`, `/account/settings` (sidebar links 404)

## Major systems built

### 1. Auth bridge
`hooks/useAuth.tsx` — unified `UnifiedUser` from Privy (wallet + social-to-wallet) and Firebase (Google/GitHub/X). Single `loginWithWallet()` + `loginWithSocial()` API, single `logout()` clears both. Privy app id + Firebase config wired via env vars.

### 2. Persistent sidebar
`components/layout/Sidebar.tsx` + `hooks/useSidebar.tsx` — fixed overlay drawer on mobile, sticky in-flow rail on `lg+`. Collapse state persisted in localStorage. Logo (G3MX mark) at top; nav links Home/Boosts/Accounts(disabled)/Top-ups(disabled); Profile section + Support section; "List Your Service" gradient CTA at bottom (auth-gated → routes to `/sell/onboarding`).

### 3. Slim navbar
`components/layout/Navbar.tsx` — sidebar collapse toggle + search input (with BorderBeam) + Login button OR `<UserMenu>` when authenticated. Login button uses BorderBeam. WalletChip shows avatar + `$0.00` balance placeholder.

### 4. Profile dropdown
`components/layout/UserMenu.tsx` — clicking WalletChip opens `<ProfilePanel>` with: identity card, wallet address (with copy + bscscan link), BNB/USDT balance rows (placeholders), Top Up / Withdraw buttons (gradient + plain), referral link block, My Orders + My Listings quick links, Power button for logout. Esc closes.

### 5. Landing page
`app/page.tsx` composes: Hero (with SoftAurora WebGL backdrop) → TrustBar → TrendingBoosts (empty-state CTA) → LevelShowcase (interactive lootbox demo) → Footer. Removed FlashDeals + TopUpRail since those features were marked Coming Soon.

### 6. Boosts marketplace (`/boosts`)
Full redesign for user-friendliness + responsiveness. Page composition:
- `BoostsPageHeader` — compact hero with trust pill + Sell-your-service CTA
- `GameShowcase` — 6 visual game cards using real artwork at `public/games/{slug}.png` with `mix-blend-mode: color` accent tint, sharp accent border + outer glow
- `BoostsToolbar` (sticky `top-16`) — search input (BorderBeam) + service-type pills + sort dropdown + Customize button → opens `ConfiguratorDrawer`
- `ActiveGameBanner` — accent sweep showing live count for selected game
- Listing grid using `BoostCard` (3 cols xl / 2 cols sm / 1 col mobile)
- `RecentlyCompletedTicker` (hidden when empty)
- `ConfiguratorDrawer` slides in from right (600px desktop, full-screen mobile) hosting `BoostConfigurator` in a single-column layout (was breaking at narrow drawer widths in 2-col mode)

### 7. BoostCard
`components/boosts/BoostCard.tsx` — recently redesigned with cleaner hierarchy. Each card has:
- `GameBackdrop` (animated CSS-only per-game backdrop in `GameBackdrop.tsx`: hex crosshairs for Valorant/CS2, sparkles+primogems for Genshin, hextech for LoL, ring grid for MLBB, runes for WoW)
- Top row: hot/derived badges + region
- Title + service-type/queue eyebrow
- Rank pair (from→to) in a bordered subgrid
- Booster strip with avatar+rating+orders
- 3-up stat tiles (ETA / Reply / Mode)
- Price footer with USD + ETH approx + Buy now CTA

### 8. Seller wizard (`/sell/onboarding`)
`components/sell/SellerWizard.tsx` — 5 steps:
1. Service & game (cards + service-type pills + title)
2. Cover & description (`ImageDrop` drag-drop preview to data URL + description)
3. Pricing & SLA (rank-range picker + price + ETA + reply time)
4. Options (region + queue + offline/stream/priority toggles)
5. Review & publish (live BoostCard preview)

Drafts autosave to `localStorage["g3mx_listing_draft"]`. Publish writes to `localStorage["g3mx_published_listings"]` via `lib/data/userListings.ts` and dispatches `g3mx:listings-updated` custom event. The /boosts page reads via `hooks/useListings.ts` which listens to that event + native `storage` event for cross-tab sync. Newest listings sort first.

### 9. AI customer-support chatbot
- `app/api/chat/route.ts` — POST endpoint streaming Claude Haiku 4.5 responses. Uses `cache_control: ephemeral` on system prompt (90% cache discount). Zod-validated request body (max 20 msgs × 4000 chars). Graceful 503 fallback when `ANTHROPIC_API_KEY` missing. Node runtime + force-dynamic.
- `lib/ai/system-prompt.ts` — full G3MX context for the bot (services, escrow, payments, auth, sell flow, XP system, behavior rules, never-do list)
- `hooks/useChat.ts` — message state, streaming consumer, localStorage persistence (last 20 turns), abort handling
- `components/support/ChatWidget.tsx` — floating launcher button bottom-right + slide-up panel (380×580 desktop, full-screen mobile). Header with bot avatar + "GG · G3MX Guide" + Online 24/7 badge + clear/close buttons. Welcome state with 4 quick-question chips. Composer with send button.
- `components/support/ChatMessage.tsx` — user/assistant bubble variants with typing dots + streaming cursor + error styling
- Mounted globally in `app/layout.tsx` after `<Sidebar />`

### 10. Animated borders
`border-beam@1.0.1` wraps: shared `Button` component (via `wrapperMotion` + ghost variant opt-out), Login button in Navbar, WalletChip, search input in Navbar + BoostsToolbar. Sidebar "List Your Service" excluded — keeps its static magenta→violet→cyan gradient as the dominant CTA.

### 11. SoftAurora hero
`components/ui/SoftAurora.tsx` — TypeScript port of React Bits' SoftAurora using `ogl` WebGL library. Custom shader (Perlin 3D + cosine gradient + band glow). Mouse interaction off by default. Cyan + magenta defaults. ResizeObserver tracks container size changes (e.g., sidebar collapse) so canvas resizes correctly without leaving a gap.

## Key conventions / gotchas

- **localStorage keys:** `g3mx_listing_draft` (wizard), `g3mx_published_listings` (publish store), `g3mx_chat_history` (chatbot), `g3mx_sidebar_collapsed`
- **Custom event:** `g3mx:listings-updated` — dispatched on publish, listened by useListings
- **No `pnpm build` while `pnpm dev` is running** — corrupts `.next` cache (had to wipe + restart once)
- **Sidebar's List Your Service button uses raw `<button>` not the shared Button component** — that's why BorderBeam doesn't wrap it (intentional — user requested exclusion)
- **Game card art is at `public/games/{slug}.png`** in 5:3 aspect — drop new images there to swap
- **Cover image + description from wizard are dropped on publish** — `BoostListing` shape doesn't include them yet (v0.2 will add and surface on detail page)

## Known TODO (next session candidates)

1. Build the four `/account/*` dashboards (currently 404 from sidebar)
2. Wire wagmi `useBalance` to replace `$0.00` / `0.0 BNB` placeholders in WalletChip + ProfilePanel
3. Add rate limiting to `/api/chat` (per-IP, ~10 msg/min)
4. Lazy-load Privy/Wagmi behind Suspense to bring landing First Load JS below 200kB
5. Real backend (Supabase/Postgres) replacing localStorage shim — add `coverImage` + `description` to `BoostListing` schema
6. `/checkout` flow + on-chain escrow contract integration
7. Listing detail page `/boosts/[id]`
8. Re-enable Accounts + Top-ups after Boosts MVP ships
9. Lighthouse + axe accessibility pass
10. Tests (Playwright E2E for critical flows)

## Env recap (apps/web/.env.local)

```
NEXT_PUBLIC_APP_NAME=G3MX
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRIVY_APP_ID=cmngsxyxi011a0djpnn5qmje1   # configured
NEXT_PUBLIC_DEFAULT_CHAIN=bsc
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...                 # configured
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=g3mx-b6b1b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=g3mx-b6b1b
NEXT_PUBLIC_FIREBASE_APP_ID=1:942145798920:web:...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=942145798920
ANTHROPIC_API_KEY=                                      # NOT yet set — chatbot returns 503
```

## How to dev

```bash
pnpm install
pnpm --filter @g3mx/web dev   # http://localhost:3000 (or 3001 if busy)
pnpm --filter @g3mx/web typecheck
pnpm --filter @g3mx/web build
```

Always typecheck after edits. Don't run build while dev is active.



