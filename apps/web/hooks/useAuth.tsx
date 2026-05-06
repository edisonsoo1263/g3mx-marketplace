"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User as FbUser } from "firebase/auth";
import { usePrivy, type User as PrivyUser } from "@privy-io/react-auth";
import { getFirebaseAuth, getProvider, type SocialProvider } from "@/lib/auth/firebase";

/**
 * Unified session model.
 *
 * G3MX runs two parallel identity layers:
 *   1. Privy — wallet + social-to-wallet abstraction (primary for Web3 actions)
 *   2. Firebase — pure Web2 social login (Google / GitHub / Twitter) for users
 *      who never want to touch crypto.
 *
 * Either being present means the user is "logged in." UI surfaces decide which
 * affordances to show by reading `user.source` and `user.walletAddress`.
 */

export interface UnifiedUser {
  id: string;
  source: "privy" | "firebase" | "both";
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
  loginWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /**
   * When true, the surrounding tree includes <PrivyProvider>, so it's safe to
   * read Privy session state. When false, Privy is unconfigured and the auth
   * layer falls back to Firebase only.
   */
  withPrivy: boolean;
}

export function AuthProvider({ children, withPrivy }: AuthProviderProps) {
  return withPrivy ? (
    <AuthProviderWithPrivy>{children}</AuthProviderWithPrivy>
  ) : (
    <AuthProviderFirebaseOnly>{children}</AuthProviderFirebaseOnly>
  );
}

function AuthProviderWithPrivy({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, login, logout: privyLogout } = usePrivy();
  return (
    <AuthCore
      privyReady={ready}
      privyAuthenticated={authenticated}
      privyUser={privyUser}
      privyLogin={login}
      privyLogout={privyLogout}
    >
      {children}
    </AuthCore>
  );
}

function AuthProviderFirebaseOnly({ children }: { children: ReactNode }) {
  return (
    <AuthCore
      privyReady={true}
      privyAuthenticated={false}
      privyUser={null}
      privyLogin={null}
      privyLogout={null}
    >
      {children}
    </AuthCore>
  );
}

interface AuthCoreProps {
  children: ReactNode;
  privyReady: boolean;
  privyAuthenticated: boolean;
  privyUser: PrivyUser | null;
  privyLogin: (() => void) | null;
  privyLogout: (() => Promise<void>) | null;
}

function AuthCore({
  children,
  privyReady,
  privyAuthenticated,
  privyUser,
  privyLogin,
  privyLogout,
}: AuthCoreProps) {
  const [fbUser, setFbUser] = useState<FbUser | null>(null);
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setFbReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next) => {
      setFbUser(next);
      setFbReady(true);
    });
  }, []);

  const user = useMemo<UnifiedUser | null>(() => {
    const wallet = privyUser?.wallet?.address ?? null;
    const privyEmail = privyUser?.email?.address ?? null;
    const privyName =
      privyUser?.google?.name ??
      privyUser?.twitter?.username ??
      privyUser?.github?.username ??
      null;

    if (privyUser && fbUser) {
      return {
        id: privyUser.id,
        source: "both",
        email: fbUser.email ?? privyEmail,
        displayName: fbUser.displayName ?? privyName,
        avatarUrl: fbUser.photoURL,
        walletAddress: wallet,
      };
    }
    if (privyUser) {
      return {
        id: privyUser.id,
        source: "privy",
        email: privyEmail,
        displayName: privyName,
        avatarUrl: null,
        walletAddress: wallet,
      };
    }
    if (fbUser) {
      return {
        id: fbUser.uid,
        source: "firebase",
        email: fbUser.email,
        displayName: fbUser.displayName,
        avatarUrl: fbUser.photoURL,
        walletAddress: null,
      };
    }
    return null;
  }, [privyUser, fbUser]);

  const loginWithWallet = useCallback(async () => {
    if (!privyLogin) {
      throw new Error("Privy not configured. Set NEXT_PUBLIC_PRIVY_APP_ID.");
    }
    privyLogin();
  }, [privyLogin]);

  const loginWithSocial = useCallback(async (provider: SocialProvider) => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* vars.");
    }
    await signInWithPopup(auth, getProvider(provider));
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth && fbUser) await signOut(auth);
    if (privyLogout && privyAuthenticated) await privyLogout();
  }, [privyLogout, privyAuthenticated, fbUser]);

  const value: AuthContextValue = {
    user,
    isReady: fbReady && privyReady,
    isAuthenticated: user !== null,
    loginWithWallet,
    loginWithSocial,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
