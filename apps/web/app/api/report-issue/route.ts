import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDiscordPayload,
  type IssueReport,
} from "@/lib/support/issue-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const issueSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(140),
  description: z.string().trim().min(5, "Description is too short").max(4000),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z
    .enum(["payment", "auth", "listing", "boost", "ui", "other"])
    .optional(),
  steps_to_reproduce: z.string().max(2000).optional(),
  url: z.string().url().max(500).optional(),
  user_id: z.string().max(120).optional(),
  wallet_address: z.string().max(120).optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Issue reporting is offline. Please email support@g3mx.xyz directly.",
      },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof issueSchema>;
  try {
    parsed = issueSchema.parse(await req.json());
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : "Invalid payload";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const report: IssueReport = {
    ...parsed,
    user_agent: userAgent,
    reported_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildDiscordPayload(report)),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Discord rejected the report (${res.status})` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Network error sending the report. Try again." },
      { status: 502 },
    );
  }
}
