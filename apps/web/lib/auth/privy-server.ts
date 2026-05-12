import "server-only";

import { PrivyClient } from "@privy-io/server-auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Privy server auth + admin guard.
 *
 * Two responsibilities:
 *   1. verifyPrivyAuth(): verify a Bearer JWT from the Authorization header
 *      using Privy's server SDK. Returns the Privy user id ("did:privy:...").
 *   2. requireAdmin(): same as verifyPrivyAuth, then checks the user id
 *      against ADMIN_PRIVY_USER_IDS (env var, comma-separated).
 *
 * Admin identification is currently env-whitelist-based. See the
 * `Admin identification approaches` section in deliverables for the
 * roadmap to a DB-driven role system.
 */

let cachedClient: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (cachedClient) return cachedClient;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error(
      "[privy server] Missing NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET. " +
        "Add them to your Vercel env or .env.local.",
    );
  }
  cachedClient = new PrivyClient(appId, appSecret);
  return cachedClient;
}

export interface PrivyAuthResult {
  userId: string;
}

export async function verifyPrivyAuth(
  req: NextRequest,
): Promise<PrivyAuthResult | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  try {
    const claims = await getPrivyClient().verifyAuthToken(token);
    return { userId: claims.userId };
  } catch {
    return null;
  }
}

// TODO: migrate to database role management (see deliverables doc).
function getAdminWhitelist(): string[] {
  return (process.env.ADMIN_PRIVY_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdmin(userId: string): boolean {
  return getAdminWhitelist().includes(userId);
}

/**
 * Returns the verified PrivyAuthResult if the caller is an admin.
 * Returns a NextResponse 401/403 otherwise — callers should early-return
 * the response directly:
 *
 *   const auth = await requireAdmin(req);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.userId is the admin's privy id
 */
export async function requireAdmin(
  req: NextRequest,
): Promise<PrivyAuthResult | NextResponse> {
  const auth = await verifyPrivyAuth(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized — missing or invalid token" },
      { status: 401 },
    );
  }
  if (!isAdmin(auth.userId)) {
    return NextResponse.json(
      { error: "Forbidden — admin access required" },
      { status: 403 },
    );
  }
  return auth;
}
