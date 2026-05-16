import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { base, baseSepolia, arbitrum, bsc } from "viem/chains";

/**
 * Set `NEXT_PUBLIC_USE_TESTNET=1` in `.env.local` (or in your Vercel preview
 * environment) to swap the primary Base chain for Base Sepolia. Production
 * deployments leave this unset and stay on Base mainnet.
 *
 * The flag is evaluated at build time because Next.js inlines `NEXT_PUBLIC_*`
 * vars into the client bundle — that's intentional: previews and prod can run
 * different bundles pointing at different chains without runtime branching.
 */
export const useTestnet = process.env.NEXT_PUBLIC_USE_TESTNET === "1";

/**
 * The primary chain G3MX runs on. Wallets default here for top-ups and
 * payouts. Swapped to Base Sepolia when `useTestnet` is on.
 */
export const primaryChain = useTestnet ? baseSepolia : base;

// Both Base + Base Sepolia stay listed so a tester whose wallet is on the
// other variant of Base still appears connected (Privy just shows the
// switch-network prompt). Arbitrum and BSC stay supported for cross-chain
// account balances.
export const supportedChains = useTestnet
  ? ([baseSepolia, base, arbitrum, bsc] as const)
  : ([base, baseSepolia, arbitrum, bsc] as const);

export const wagmiConfig = createConfig({
  chains: [primaryChain, base, baseSepolia, arbitrum, bsc],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
});

/**
 * Block-explorer URL for the given EVM address on whichever Base variant is
 * currently primary. Falls back to mainnet basescan when called with no
 * address (rare) so the link never points at a 404.
 */
export function getAddressExplorerUrl(address: string): string {
  const explorer = useTestnet
    ? "https://sepolia.basescan.org"
    : "https://basescan.org";
  return `${explorer}/address/${address}`;
}
