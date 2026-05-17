# @g3mx/contracts

Solidity contracts for G3MX Marketplace. Built with Hardhat + viem.

## Layout

```
contracts/
  G3MXVault.sol     ← custodial escrow + 1% deposit/pay/withdraw fees
scripts/
  deploy.ts         ← deploys G3MXVault, prints address + verify command
hardhat.config.ts   ← networks: hardhat (local), baseSepolia, base
.env.example        ← template; copy to .env (NEVER commit)
```

## First-time setup

```bash
# From repo root:
pnpm install

# Copy env template and fill in:
cp packages/contracts/.env.example packages/contracts/.env
# Edit packages/contracts/.env and set DEPLOYER_PRIVATE_KEY (and optionally BASESCAN_API_KEY).
```

## Commands

All run from `packages/contracts/`, or via `pnpm --filter @g3mx/contracts <cmd>` from anywhere.

| Command | Purpose |
| --- | --- |
| `pnpm compile` | Compile contracts → `artifacts/` |
| `pnpm test` | Run Hardhat tests |
| `pnpm deploy:sepolia` | Deploy to Base Sepolia (chainId 84532) |
| `pnpm deploy:base` | Deploy to Base mainnet (chainId 8453) — Phase 2+ |
| `pnpm verify:sepolia <addr> <constructorArg>` | Publish source to sepolia.basescan.org |
| `pnpm clean` | Wipe `artifacts/` + `cache/` |

## Token addresses

| Chain | Token | Address |
| --- | --- | --- |
| Base Sepolia | USDC (Circle) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base mainnet | USDC (Circle) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| BSC mainnet | USDT (Tether) | `0x55d398326f99059fF775485246999027B3197955` |

Deploy **one vault instance per (chain, token) pair** — same bytecode.

## Security notes

- Never commit `.env` — it contains the deployer's private key.
- The deployer becomes the vault `owner` (can `refundOrder`, `sweepFees`, `setFees`).
- Hard fee cap `MAX_FEE_BPS = 500` (5%) prevents key-compromise rug.
- `sweepFees()` is *not* time-locked yet — for prod, gate it on a multisig or DAO.
- Only sweep fees AFTER open orders are past dispute window (refunds reverse fees from `feeBalance`).
