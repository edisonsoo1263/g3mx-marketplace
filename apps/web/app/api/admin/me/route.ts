import { NextRequest, NextResponse } from "next/server";
import { isAdmin, verifyPrivyAuth } from "@/lib/auth/privy-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/me — UI gating helper.
 *
 * Returns { is_admin: boolean, user_id?: string }.
 *   - 200 with is_admin=false when caller is authenticated but not on the
 *     whitelist
 *   - 200 with is_admin=true when authenticated and whitelisted
 *   - 401 when unauthenticated (no token / bad token)
 *
 * Used by the admin page client to decide whether to render the table or
 * a "you need admin access" screen. Don't rely on this for security —
 * the actual admin routes re-verify on every call.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const auth = await verifyPrivyAuth(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized", is_admin: false },
      { status: 401 },
    );
  }
  return NextResponse.json({
    is_admin: isAdmin(auth.userId),
    user_id: auth.userId,
  });
}
