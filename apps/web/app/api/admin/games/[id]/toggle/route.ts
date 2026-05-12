import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/privy-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/games/[id]/toggle — flip is_active.
 *
 * Body is optional. If `{ is_active: boolean }` is sent we set to that value;
 * otherwise we flip whatever's there. This lets clients do either:
 *   - Optimistic: send { is_active: !current } from a checkbox
 *   - Idempotent: leave body empty and rely on the server flip
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let target: boolean | undefined;
  try {
    const body = await req.json();
    if (typeof body?.is_active === "boolean") target = body.is_active;
  } catch {
    // empty body is fine — we'll flip the current value
  }

  const sb = getAdminSupabase();

  if (target === undefined) {
    const { data: current, error: readErr } = await sb
      .from("games")
      .select("is_active, deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (readErr) {
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.deleted_at) {
      return NextResponse.json(
        { error: "Cannot toggle a deleted game — restore it first" },
        { status: 409 },
      );
    }
    target = !current.is_active;
  }

  const { data, error } = await sb
    .from("games")
    .update({ is_active: target })
    .eq("id", id)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ game: data });
}
