import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { mainnet, bsc, polygon, arbitrum } from "viem/chains";

export const wagmiConfig = createConfig({
  chains: [bsc, mainnet, polygon, arbitrum],
  transports: {
    [bsc.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});
