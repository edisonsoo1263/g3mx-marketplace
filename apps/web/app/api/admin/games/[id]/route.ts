import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/privy-server";
import {
  GAME_CATEGORIES,
  GAME_PLATFORMS,
  GAME_REGIONS,
} from "@/lib/types/games";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const nameSchema = z
  .object({
    en: z.string().min(1).max(120),
    zh_tw: z.string().min(1).max(120).optional(),
    id: z.string().min(1).max(120).optional(),
  })
  .strict();

const servicesSchema = z
  .object({
    boosting: z.object({
      enabled: z.boolean(),
      examples: z.array(z.string().max(80)).max(20).default([]),
    }),
    account_trading: z.object({
      enabled: z.boolean(),
      examples: z.array(z.string().max(80)).max(20).default([]),
    }),
    top_up: z.object({
      enabled: z.boolean(),
      currency_name: z.string().max(80).nullable(),
    }),
  })
  .strict();

const gameUpdateSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, hyphens")
      .optional(),
    name: nameSchema.optional(),
    publisher: z.string().max(120).nullable().optional(),
    category: z.enum(GAME_CATEGORIES as [string, ...string[]]).optional(),
    platforms: z
      .array(z.enum(GAME_PLATFORMS as [string, ...string[]]))
      .min(1)
      .optional(),
    region_focus: z
      .array(z.enum(GAME_REGIONS as [string, ...string[]]))
      .optional(),
    services: servicesSchema.optional(),
    priority_tier: z
      .union([z.literal(1), z.literal(2), z.literal(3)])
      .optional(),
    is_active: z.boolean().optional(),
    icon_url: z.string().url().max(500).nullable().optional(),
    banner_url: z.string().url().max(500).nullable().optional(),
  })
  .strict();

/**
 * PUT /api/admin/games/[id] — update a game. Partial body allowed.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = gameUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 },
    );
  }

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("games")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A game with that slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ game: data });
}

/**
 * DELETE /api/admin/games/[id] — soft delete by default (sets deleted_at).
 *
 * Add ?hard=1 to permanently delete the row. Reserve hard deletes for
 * cleaning up test/seed data; production deletions should stay soft.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const hard = new URL(req.url).searchParams.get("hard") === "1";
  const sb = getAdminSupabase();

  if (hard) {
    const { error } = await sb.from("games").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Soft delete: mark deleted_at + flip is_active off so public reads drop it.
  const { data, error } = await sb
    .from("games")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
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
