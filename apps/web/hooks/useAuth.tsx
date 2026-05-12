"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePrivy } from "@privy-io/react-auth";

/**
 * Unified session model. G3MX uses Privy as the single identity layer —
 * wallet, email, Google, GitHub, and X (Twitter) all flow through the same
 * Privy login modal and produce the same UnifiedUser.
 */
export interface UnifiedUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  walletAddress: string | null;
}

interface AuthContextValue {
  user: UnifiedUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  loginWithWallet: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /**
   * False when Privy is unconfigured (no NEXT_PUBLIC_PRIVY_APP_ID). Mounts a
   * stub auth context so the rest of the tree can still call useAuth().
   */
  withPrivy: boolean;
}

export function AuthProvider({ children, withPrivy }: AuthProviderProps) {
  return withPrivy ? (
    <PrivyAuth>{children}</PrivyAuth>
  ) : (
    <StubAuth>{children}</StubAuth>
  );
}

function PrivyAuth({ children }: { children: ReactNode }) {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout: privyLogout,
  } = usePrivy();

  const user = useMemo<UnifiedUser | null>(() => {
    if (!privyUser) return null;
    const displayName =
      privyUser.google?.name ??
      privyUser.twitter?.username ??
      privyUser.github?.username ??
      null;
    const email =
      privyUser.email?.address ??
      privyUser.google?.email ??
      null;
    return {
      id: privyUser.id,
      email,
      displayName,
      avatarUrl: null,
      walletAddress: privyUser.wallet?.address ?? null,
    };
  }, [privyUser]);

  const loginWithWallet = useCallback(async () => {
    login();
  }, [login]);

  const logout = useCallback(async () => {
    if (authenticated) await privyLogout();
  }, [authenticated, privyLogout]);

  const value: AuthContextValue = {
    user,
    isReady: ready,
    isAuthenticated: authenticated && user !== null,
    loginWithWallet,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function StubAuth({ children }: { children: ReactNode }) {
  const value: AuthContextValue = {
    user: null,
    isReady: true,
    isAuthenticated: false,
    loginWithWallet: async () => {
      throw new Error("Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID.");
    },
    logout: async () => undefined,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
