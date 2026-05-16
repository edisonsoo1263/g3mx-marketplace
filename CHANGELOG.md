# Changelog

All notable changes to G3MX Marketplace are tracked here. Each entry is committed to git so changes survive across sessions and worktrees.

Format: each session is a section dated by `YYYY-MM-DD`. Within a session, each change has a one-line summary and a brief WHY.

---

## 2026-05-17

### Added
- `baseSepolia` (chainId 84532) to wagmi `supportedChains` + transports — `apps/web/lib/auth/wagmi.ts`
- `baseSepolia` to Privy `supportedChains` — `apps/web/app/providers.tsx`
- Root `vercel.json` for Turborepo monorepo deploy config (`framework: nextjs`, build via pnpm filter, output `apps/web/.next`)
- `next` in root `devDependencies` so Vercel's framework detection passes when Root Directory is unset
- `CHANGELOG.md` to track every change going forward (this file). Previous session's uncommitted UI/i18n work was lost when the C:\Edison worktree path was removed — going forward, every fix is logged here and committed.

### Changed
- `.env.example` chain options comment now lists `baseSepolia` as a valid value

### Verified
- Base Sepolia integration tested on Vercel preview — MetaMask connects, `eth_chainId` returns `0x14a34`, no "Chain 84532 not configured" errors
- Production deploy to g3mx.xyz via main fast-forward

### Re-applying lost work from 2026-05-16 session
The previous session modified ~26 files for UI/i18n fixes but the worktree files were lost. Re-implementing now:

- Added `"discord"` to Privy `loginMethods` in `apps/web/app/providers.tsx` — was missing, breaking Discord OAuth login.
