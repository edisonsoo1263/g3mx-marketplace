// G3MXVault wagmi bindings. The address is read from env (per-environment),
// the ABI ships with the bundle so we don't need a network roundtrip to type
// the calls.

import { useReadContract, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { G3MX_VAULT_ABI } from "./G3MXVault.abi";

/**
 * Deployed G3MXVault address for the active environment. Set after
 * `pnpm --filter @g3mx/contracts deploy:sepolia`.
 *
 * Reads as `0x` (a deliberately invalid address) when unset so calls fail
 * loudly in the dev UI rather than silently going to address(0).
 */
export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ??
  "0x") as Address;

export { G3MX_VAULT_ABI };

/** OrderStatus enum mirrors the Solidity enum in G3MXVault.sol. */
export const ORDER_STATUS = {
  None: 0,
  Funded: 1,
  Released: 2,
  Refunded: 3,
} as const;

export type OrderStatusValue = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export function orderStatusLabel(status: OrderStatusValue | number): string {
  switch (status) {
    case ORDER_STATUS.None:
      return "None";
    case ORDER_STATUS.Funded:
      return "Funded (escrow held)";
    case ORDER_STATUS.Released:
      return "Released (seller credited)";
    case ORDER_STATUS.Refunded:
      return "Refunded (buyer made whole)";
    default:
      return `Unknown (${status})`;
  }
}

// ─── READ HOOKS ──────────────────────────────────────────────────────────

/** Internal vault credit (post-confirm, pre-withdraw) for an address. */
export function useVaultBalance(address: Address | undefined) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: G3MX_VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
}

/** Owner-only sweepable fee accumulator. */
export function useVaultFeeBalance() {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: G3MX_VAULT_ABI,
    functionName: "feeBalance",
  });
}

/** Next order id the vault will assign on the next createOrder. */
export function useNextOrderId() {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: G3MX_VAULT_ABI,
    functionName: "nextOrderId",
  });
}

/** Full order record by id. Returns undefined while the read is pending. */
export function useVaultOrder(orderId: bigint | undefined) {
  return useReadContract({
    address: VAULT_ADDRESS,
    abi: G3MX_VAULT_ABI,
    functionName: "orders",
    args: orderId !== undefined ? [orderId] : undefined,
    query: { enabled: orderId !== undefined },
  });
}

// ─── WRITE HOOKS ─────────────────────────────────────────────────────────

/**
 * Shared wagmi write hook. Returned object exposes `writeContract` plus tx
 * status fields (`isPending`, `data`, `error`). Callers wire it into their
 * own button handlers — see apps/web/app/vault-test/page.tsx.
 */
export function useVaultWrite() {
  return useWriteContract();
}
