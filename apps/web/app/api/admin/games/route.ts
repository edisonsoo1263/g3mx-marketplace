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

const gameInputSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, hyphens"),
    name: nameSchema,
    publisher: z.string().max(120).nullable().optional(),
    category: z.enum(GAME_CATEGORIES as [string, ...string[]]),
    platforms: z
      .array(z.enum(GAME_PLATFORMS as [string, ...string[]]))
      .min(1),
    region_focus: z
      .array(z.enum(GAME_REGIONS as [string, ...string[]]))
      .default([]),
    services: servicesSchema,
    priority_tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    is_active: z.boolean().optional().default(false),
    icon_url: z.string().url().max(500).nullable().optional(),
    banner_url: z.string().url().max(500).nullable().optional(),
  })
  .strict();

/**
 * GET /api/admin/games — admin list of ALL games (incl. inactive + deleted).
 *
 * Optional filters mirror the public route plus:
 *   ?tier=1|2|3
 *   ?include_deleted=1
 *   ?q=<search>  (matches slug and name.en)
 */
export async function GET(req: NextRequest): Promise<Response> {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const sb = getAdminSupabase();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const platform = searchParams.get("platform");
  const tier = searchParams.get("tier");
  const includeDeleted = searchParams.get("include_deleted") === "1";
  const q = searchParams.get("q")?.trim();

  let query = sb.from("games").select("*");
  if (!includeDeleted) query = query.is("deleted_at", null);
  if (category) query = query.eq("category", category);
  if (platform) query = query.contains("platforms", [platform]);
  if (tier) {
    const t = Number(tier);
    if (t === 1 || t === 2 || t === 3) query = query.eq("priority_tier", t);
  }
  if (q) {
    // Case-insensitive match on slug or name.en
    query = query.or(`slug.ilike.%${q}%,name->>en.ilike.%${q}%`);
  }

  query = query
    .order("priority_tier", { ascending: true })
    .order("slug", { ascending: true });

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ games: data ?? [] });
}

/**
 * POST /api/admin/games — create a new game.
 * Body: GameInput
 */
export async function POST(req: NextRequest): Promise<Response> {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = gameInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const sb = getAdminSupabase();
  const { data, error } = await sb
    .from("games")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A game with that slug already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ game: data }, { status: 201 });
}
