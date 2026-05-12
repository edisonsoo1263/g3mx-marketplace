import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { defineChain } from "viem";
import { mainnet, bsc, polygon, arbitrum } from "viem/chains";

/**
 * HyperEVM (Hyperliquid) — native EVM chain on Hyperliquid L1.
 *
 * Mainnet: chainId 999, native gas token HYPE.
 * Testnet (chainId 998) is available too — flip the URLs and id when needed.
 *
 * Defining inline keeps us independent of viem version bumps; once viem ships
 * an official `hyperliquid` chain entry we can swap to that import.
 */
export const hyperEvm = defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: { name: "Hyperliquid", symbol: "HYPE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.hyperliquid.xyz/evm"] },
  },
  blockExplorers: {
    default: { name: "HyperEVM Scan", url: "https://hyperevmscan.io" },
  },
  testnet: false,
});

export const supportedChains = [bsc, hyperEvm, mainnet, polygon, arbitrum] as const;

export const wagmiConfig = createConfig({
  chains: [bsc, hyperEvm, mainnet, polygon, arbitrum],
  transports: {
    [bsc.id]: http(),
    [hyperEvm.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});
