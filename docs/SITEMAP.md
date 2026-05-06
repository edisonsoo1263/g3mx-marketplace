# VaultKeep Information Architecture

> Three top-level pillars: **Marketplace** · **Player Dashboard** · **Web3 Inventory**.
> Public surface is browseable without a wallet. Wallet only required at checkout, listing, or claim.

---

## 1. Top-level navigation

```
Logo                                                        EN  [Connect Wallet]
─────────────────────────────────────────────────────────────────────────────
Games   Boost   Market   Top-Up   Quests
```

Mobile: hamburger reveals the same five links plus Connect Wallet.

---

## 2. Sitemap (full route tree)

```
/
├── /                              Landing (character-select hero, fog-of-war reveals)
├── /games                         All games grid · filterable by region/service
│   └── /games/[slug]              Per-game hub (Boost · Accounts · Top-Up tabs)
│
├── /boost                         Boosting catalog (filter by game/rank/service type)
│   ├── /boost/[boosterId]         Booster profile — XP, badges, reviews, calendar
│   └── /boost/order/[orderId]     Active order tracker — quest log + chat
│
├── /marketplace                   Account listing grid · rarity-tier framed
│   ├── /marketplace/[listingId]   Listing detail — screenshots, escrow flow
│   └── /marketplace/list          Seller flow (gated by reputation NFT)
│
├── /topup                         Game picker for top-ups
│   └── /topup/[gameSlug]          Top-up flow (3 clicks: amount → ID → pay)
│
├── /quests                        Player Quest Log (active + completed + locked)
│   └── /quests/daily              Daily login + chest claim
│
├── /leaderboard                   Top boosters · top sellers · top spenders (W/AT)
│
├── /profile                       Player Dashboard (auth-gated)
│   ├── /profile/overview          XP, level, recent activity, fee tier
│   ├── /profile/orders            All orders (buy + sell) with status
│   ├── /profile/inventory         Web3 Inventory: NFTs, badges, accounts owned
│   ├── /profile/wallet            Connected wallets, payment history, fiat on-ramp
│   ├── /profile/settings          Notifications, language, security
│   └── /profile/disputes          Dispute timeline + evidence upload
│
├── /dashboard/booster             Booster control panel (role-gated)
│   ├── /dashboard/booster/orders     Queue + active climb tracker
│   ├── /dashboard/booster/availability  Calendar + game/region prefs
│   └── /dashboard/booster/payouts    Earnings, withdrawal, reputation rolls
│
├── /dashboard/seller              Seller control panel (role-gated)
│   ├── /dashboard/seller/listings
│   ├── /dashboard/seller/sales
│   └── /dashboard/seller/payouts
│
├── /docs                          Public docs hub
│   ├── /docs/escrow               How escrow works
│   ├── /docs/reputation           Soulbound reputation NFT
│   ├── /docs/safety               Safety guide for buyers/sellers
│   ├── /docs/contracts            On-chain contract addresses + audits
│   ├── /docs/terms
│   └── /docs/privacy
│
└── /api                           Server route handlers (BFF)
    ├── /api/stats                 Live counters (boosters online, volume, etc.)
    ├── /api/games                 Game registry endpoint
    ├── /api/listings              Marketplace search + filter
    ├── /api/quests                Player quest state
    └── /api/siwe                  Sign-In With Ethereum nonce + verify
```

---

## 3. Landing page section order (Fog of War reveal)

The landing page progressively reveals as the player scrolls. Each band brightens
from `opacity: 0.3` and `blur(3px)` to fully visible the moment it crosses the viewport.

| # | Section | Component | Purpose |
|---|---------|-----------|---------|
| 1 | Hero | `CharacterSelectHero` | "Pick your path" — three vault portals (Champion / Trader / Spark) |
| 2 | Stat ticker | `StatTicker` | Live counters + recent activity marquee |
| 3 | Player preview | `PlayerPreview` | Demo of XP bar, Quest Log, Loot Box, Membership tiers |
| 4 | Service detail | `ServiceTrio` | Three deeper service cards with bullet promises |
| 5 | Game showcase | `GameShowcase` | Tier-1 game grid with per-game accent borders |
| 6 | How it works | `HowItWorks` | 4-step on-chain flow |
| 7 | Keepers (NPCs) | `NPCChat` | Live-chat trust signal — three personified guides |
| 8 | Trust pillars | `TrustSignals` | Audit + soulbound rep + dispute resolution |
| 9 | Testimonials | `Testimonials` | Six real-feeling player quotes |
| 10 | FAQ | `FAQ` | Native `<details>` accordion + JSON-LD `FAQPage` |
| — | Footer | `Footer` | 4-col links + contract addresses + locale |

---

## 4. Player Dashboard sub-IA

```
/profile (auth-gated)
│
├─ Overview
│  ├─ Avatar + handle + level + XP bar (XPBar component)
│  ├─ Active fee tier (MembershipBadge)
│  ├─ Streak chest (LootBox component)
│  └─ Quick stats: trades, ★ rating, dispute rate
│
├─ Orders
│  ├─ Active (QuestLog component, filtered status="active")
│  ├─ Completed
│  └─ Disputed
│
├─ Inventory (Web3)
│  ├─ Reputation NFT (soulbound, non-transferable)
│  ├─ Achievement NFTs (ERC-1155)
│  ├─ Membership badge (current tier)
│  ├─ Game accounts owned (linked listings)
│  └─ Loot history (cosmetic frames, fee credits)
│
├─ Wallet
│  ├─ Connected addresses
│  ├─ Payment history (on-chain + fiat)
│  ├─ Fiat on-ramp link (MoonPay / Transak)
│  └─ Withdrawal queue
│
├─ Settings
│  ├─ Language (EN · zh-Hant · id)
│  ├─ Notifications (email + push + on-chain alerts)
│  ├─ Security (2FA, session list)
│  └─ Linked games (region preferences)
│
└─ Disputes
   ├─ Open
   ├─ Evidence locker (screenshots, chat exports)
   └─ Resolution log
```

---

## 5. Web3 Inventory taxonomy

| Asset | Standard | Transferable | Earned via |
|-------|----------|--------------|------------|
| Reputation NFT | ERC-721 (soulbound) | ❌ | First completed trade |
| Membership Badge | ERC-721 (soulbound) | ❌ | Volume thresholds (Bronze → Mythic) |
| Achievement NFT | ERC-1155 | ✅ | Quest completions, milestones |
| Cosmetic Frame | ERC-1155 | ✅ | Loot box rolls |
| Fee Credit | ERC-20 (utility) | ✅ | Loot box rolls, referrals |
| Account NFT (listing) | ERC-721 | ✅ | Marketplace listings (escrow custody) |

---

## 6. UX principles applied

| Principle | Where it shows up |
|-----------|-------------------|
| **Fitts's Law** | Primary CTAs are 56px tall, full-width on mobile. Connect Wallet pinned in top-bar + center-stage in hero. |
| **Progressive Disclosure** | Per-game boosting forms hidden until a game is selected. Wallet connect deferred until checkout. |
| **Trust Signals** | NPCChat live-keepers, recessed audit chip row, transaction history visible at every checkout decision point. |
| **Recognition over recall** | Pixel icons (sword/shield/bolt) repeat the same visual vocabulary across navigation, service tiles, and quest log. |
| **Feedback loops** | Press-down button animation, crystal-pulse on online indicators, gold-pulse on unlocked badges. |
| **Accessibility** | Reduced-motion strips every loop. Focus rings are 3px crystal. All ARIA roles set on interactive frames. |
