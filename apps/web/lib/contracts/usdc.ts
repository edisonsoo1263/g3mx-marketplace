// USDC (ERC20) wagmi bindings — the token the vault escrows. We only need
// approve / allowance / balanceOf / decimals on the frontend; transfer
// always flows through the vault, never the user calling USDC directly.

import { useReadContract, useWriteContract } from "wagmi";
import { erc20Abi, type Address } from "viem";

/** Circle USDC, per chain. Source of truth: https://developers.circle.com/stablecoins/usdc-on-test-networks */
export const USDC_ADDRESSES = {
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
} as const satisfies Record<string, Address>;

/**
 * Active USDC address for this environment. We honour an explicit override
 * via NEXT_PUBLIC_USDC_ADDRESS so a future BSC USDT swap is a one-line env
 * change, but default to Base Sepolia USDC (matches `useTestnet` defaults
 * elsewhere in the app).
 */
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  USDC_ADDRESSES.baseSepolia) as Address;

/**
 * USDC has **6 decimals**, not 18. Hardcoding here as the constant — the
 * `useUsdcDecimals` hook reads from chain for safety, but UI defaults to 6
 * before the read resolves so amounts render correctly on first paint.
 */
export const USDC_DEFAULT_DECIMALS = 6;

export { erc20Abi };

// ─── READ HOOKS ──────────────────────────────────────────────────────────

/** USDC balance for an address. Undefined while pending or unconnected. */
export function useUsdcBalance(address: Address | undefined) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
}

/** Allowance an owner has granted to a spender (typically the vault). */
export function useUsdcAllowance(
  owner: Address | undefined,
  spender: Address,
) {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    query: { enabled: Boolean(owner) },
  });
}

/** On-chain decimals. Always 6 for real USDC; mock tokens may differ. */
export function useUsdcDecimals() {
  return useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals",
  });
}

// ─── WRITE HOOKS ─────────────────────────────────────────────────────────

/** Generic ERC20 write — call `writeContract({ ...approveArgs })`. */
export function useUsdcWrite() {
  return useWriteContract();
}
