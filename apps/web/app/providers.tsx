"use client";

import { useState, type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, primaryChain, supportedChains } from "@/lib/auth/wagmi";
import { AuthProvider } from "@/hooks/useAuth";
import { SidebarProvider } from "@/hooks/useSidebar";
import { LanguageProvider } from "@/hooks/useLanguage";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * G3MX provider stack:
 *   Privy (Web3 + social-to-wallet)
 *     └─ Wagmi (chain reads/writes)
 *         └─ ReactQuery (data fetching)
 *             └─ AuthProvider (unified Privy + Firebase session)
 */
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, refetchOnWindowFocus: false },
    },
  }));

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Allow rendering without Privy in early dev — auth layer falls back to Firebase only
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider withPrivy={false}>
          <LanguageProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </LanguageProvider>
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
        // Primary chain is Base (or Base Sepolia when
        // NEXT_PUBLIC_USE_TESTNET=1). Embedded wallets default here.
        defaultChain: primaryChain,
        supportedChains: [...supportedChains],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <AuthProvider withPrivy={true}>
            <LanguageProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </LanguageProvider>
          </AuthProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
