"use client";

import { useState, type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, hyperEvm } from "@/lib/auth/wagmi";
import { bsc, mainnet, polygon, arbitrum, baseSepolia } from "viem/chains";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/hooks/useSidebar";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * G3MX provider stack:
 *   Privy (wallet + email + Google / GitHub / X social-to-wallet)
 *     └─ Wagmi (chain reads/writes)
 *         └─ ReactQuery (data fetching)
 *             └─ AuthProvider (unified Privy session)
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false },
    },
  }));

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // No Privy app ID → stub auth (logged-out everywhere) so the tree still mounts.
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider withPrivy={false}>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#00f0ff",
          logo: "/brand/g3mx-logo.png",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "wallet", "google", "github", "twitter"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: bsc,
        supportedChains: [bsc, hyperEvm, mainnet, polygon, arbitrum, baseSepolia],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <AuthProvider withPrivy={true}>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
