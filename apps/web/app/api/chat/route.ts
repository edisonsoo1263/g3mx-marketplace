import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { G3MX_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import {
  buildDiscordPayload,
  type IssueReport,
  type IssueSeverity,
  type IssueCategory,
} from "@/lib/support/issue-types";

// Run on the Node runtime (Anthropic SDK uses Node streams; safer than edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Single chat message in a conversation.
 * Server enforces tight bounds so a malicious client can't burn budget.
 */
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const metadataSchema = z
  .object({
    url: z.string().max(500).optional(),
    user_id: z.string().max(120).optional(),
    wallet_address: z.string().max(120).optional(),
  })
  .optional();

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
  metadata: metadataSchema,
});

const MODEL = "claude-haiku-4-5";
const MAX_TOOL_TURNS = 3;

const SEVERITIES: IssueSeverity[] = ["low", "medium", "high", "critical"];
const CATEGORIES: IssueCategory[] = [
  "payment",
  "auth",
  "listing",
  "boost",
  "ui",
  "other",
];

const TOOLS = [
  {
    name: "report_issue",
    description:
      "Submit a bug report or support ticket to the engineering team's Discord channel. Use this when the user describes a specific bug, broken behavior, payment problem, login issue, or anything that needs human follow-up. Pull a clear title and description from the conversation. Do NOT use for general questions you can answer yourself.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description:
            "Short title (5-12 words) summarizing the issue. Symptom-style, e.g. 'Listing draft lost on page refresh'.",
        },
        description: {
          type: "string",
          description:
            "Detailed description of what the user reported, including expected vs actual behavior. Quote the user where helpful.",
        },
        severity: {
          type: "string",
          enum: SEVERITIES,
          description:
            "low = cosmetic; medium = annoying but workable; high = blocks a flow; critical = data loss / financial / cannot use site.",
        },
        category: {
          type: "string",
          enum: CATEGORIES,
          description: "Best-fit area of the product the issue is in.",
        },
        steps_to_reproduce: {
          type: "string",
          description:
            "Step-by-step reproduction if the user described them. Omit if unknown.",
        },
      },
      required: ["title", "description", "severity"],
    },
  },
];

export async function POST(req: NextRequest): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI assistant is offline. Please email support@g3mx.xyz for help.",
      },
      { status: 503 },
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const userAgent = req.headers.get("user-agent") ?? undefined;

  const conversationExcerpt = body.messages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "GG"}: ${m.content}`)
    .join("\n\n");

  const toolCtx: ToolContext = {
    metadata: body.metadata,
    userAgent,
    conversationExcerpt,
  };

  // Mutable conversation — we may append assistant + tool_result turns to it.
  const messages: Anthropic.Messages.MessageParam[] = body.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
          const stream = await client.messages.create({
            model: MODEL,
            max_tokens: 1024,
            system: [
              {
                type: "text",
                text: G3MX_SYSTEM_PROMPT,
                cache_control: { type: "ephemeral" },
              },
            ],
            tools: TOOLS,
            messages,
            stream: true,
          });

          const textBlocks: { type: "text"; text: string }[] = [];
          const toolUseBlocks: ToolUseAccumulator[] = [];
          let stopReason: string | undefined;
          let currentBlock: BlockAccumulator | null = null;

          for await (const event of stream) {
            if (event.type === "content_block_start") {
              if (event.content_block.type === "text") {
                currentBlock = { kind: "text", text: "" };
                textBlocks.push({ type: "text", text: "" });
              } else if (event.content_block.type === "tool_use") {
                currentBlock = {
                  kind: "tool_use",
                  id: event.content_block.id,
                  name: event.content_block.name,
                  rawInput: "",
                };
                toolUseBlocks.push({
                  id: event.content_block.id,
                  name: event.content_block.name,
                  rawInput: "",
                });
              } else {
                currentBlock = null;
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta" && currentBlock?.kind === "text") {
                currentBlock.text += event.delta.text;
                textBlocks[textBlocks.length - 1].text += event.delta.text;
                controller.enqueue(encoder.encode(event.delta.text));
              } else if (
                event.delta.type === "input_json_delta" &&
                currentBlock?.kind === "tool_use"
              ) {
                currentBlock.rawInput += event.delta.partial_json;
                toolUseBlocks[toolUseBlocks.length - 1].rawInput +=
                  event.delta.partial_json;
              }
            } else if (event.type === "content_block_stop") {
              currentBlock = null;
            } else if (event.type === "message_delta") {
              if (event.delta.stop_reason)
                stopReason = event.delta.stop_reason;
            }
          }

          if (stopReason !== "tool_use" || toolUseBlocks.length === 0) {
            // Claude is done
            break;
          }

          // Execute tools, append results, loop
          const toolResultBlocks: Anthropic.Messages.ToolResultBlockParam[] = [];
          for (const tu of toolUseBlocks) {
            let parsedInput: Record<string, unknown> = {};
            try {
              parsedInput = JSON.parse(tu.rawInput || "{}");
            } catch {
              parsedInput = {};
            }
            const result = await executeTool(tu.name, parsedInput, toolCtx);
            toolResultBlocks.push({
              type: "tool_result",
              tool_use_id: tu.id,
              content: JSON.stringify(result),
              is_error: !result.ok,
            });
          }

          // Append the assistant's response (text + tool_use), then the tool results.
          messages.push({
            role: "assistant",
            content: [
              ...textBlocks.filter((b) => b.text.length > 0),
              ...toolUseBlocks.map((tu) => {
                let parsed: Record<string, unknown> = {};
                try {
                  parsed = JSON.parse(tu.rawInput || "{}");
                } catch {
                  parsed = {};
                }
                return {
                  type: "tool_use" as const,
                  id: tu.id,
                  name: tu.name,
                  input: parsed,
                };
              }),
            ],
          });
          messages.push({
            role: "user",
            content: toolResultBlocks,
          });
        }

        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown LLM error";
        try {
          controller.enqueue(encoder.encode(`\n\n[stream error: ${msg}]`));
        } catch {
          // controller may already be closed
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// ─── Tool execution ───────────────────────────────────────────────

interface ToolContext {
  metadata?: { url?: string; user_id?: string; wallet_address?: string };
  userAgent?: string;
  conversationExcerpt?: string;
}

interface ToolResult {
  ok: boolean;
  message: string;
}

type BlockAccumulator =
  | { kind: "text"; text: string }
  | { kind: "tool_use"; id: string; name: string; rawInput: string };

interface ToolUseAccumulator {
  id: string;
  name: string;
  rawInput: string;
}

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
): Promise<ToolResult> {
  if (name !== "report_issue") {
    return { ok: false, message: `Unknown tool: ${name}` };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      ok: false,
      message:
        "Issue reporting is offline (Discord webhook not configured). Tell the user to email support@g3mx.xyz with their description.",
    };
  }

  const severity = SEVERITIES.includes(input.severity as IssueSeverity)
    ? (input.severity as IssueSeverity)
    : "medium";
  const category = CATEGORIES.includes(input.category as IssueCategory)
    ? (input.category as IssueCategory)
    : undefined;

  const report: IssueReport = {
    title: String(input.title ?? "Untitled issue").slice(0, 140),
    description: String(input.description ?? "").slice(0, 4000),
    severity,
    category,
    steps_to_reproduce: input.steps_to_reproduce
      ? String(input.steps_to_reproduce).slice(0, 2000)
      : undefined,
    url: ctx.metadata?.url,
    user_agent: ctx.userAgent,
    user_id: ctx.metadata?.user_id,
    wallet_address: ctx.metadata?.wallet_address,
    conversation_excerpt: ctx.conversationExcerpt,
    reported_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildDiscordPayload(report)),
    });
    if (!res.ok) {
      return {
        ok: false,
        message: `Discord webhook returned ${res.status}. Tell the user the report didn't go through and to email support@g3mx.xyz.`,
      };
    }
    return {
      ok: true,
      message:
        "Issue submitted to engineering team. Briefly confirm to the user that you've flagged it.",
    };
  } catch {
    return {
      ok: false,
      message:
        "Network error sending to Discord. Tell the user to email support@g3mx.xyz with their description.",
    };
  }
}
