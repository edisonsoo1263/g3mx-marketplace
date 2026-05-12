export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueCategory =
  | "payment"
  | "auth"
  | "listing"
  | "boost"
  | "ui"
  | "other";

export interface IssueReport {
  title: string;
  description: string;
  severity: IssueSeverity;
  category?: IssueCategory;
  steps_to_reproduce?: string;
  // Auto-injected from request:
  url?: string;
  user_agent?: string;
  user_id?: string;
  wallet_address?: string;
  conversation_excerpt?: string;
  reported_at: string;
}

const SEVERITY_COLORS: Record<IssueSeverity, number> = {
  low: 0x9ca3af, // gray
  medium: 0xfbbf24, // amber
  high: 0xef4444, // red
  critical: 0x991b1b, // dark red
};

const SEVERITY_EMOJI: Record<IssueSeverity, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
  critical: "🚨",
};

/**
 * Build a Discord webhook payload for an issue report.
 * Discord webhook docs: https://discord.com/developers/docs/resources/webhook
 */
export function buildDiscordPayload(report: IssueReport): unknown {
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: "Severity", value: `${SEVERITY_EMOJI[report.severity]} ${report.severity}`, inline: true },
  ];

  if (report.category) {
    fields.push({ name: "Category", value: report.category, inline: true });
  }

  if (report.url) {
    fields.push({ name: "Page", value: truncate(report.url, 1024), inline: false });
  }

  if (report.user_id || report.wallet_address) {
    const parts: string[] = [];
    if (report.user_id) parts.push(`\`${truncate(report.user_id, 100)}\``);
    if (report.wallet_address)
      parts.push(`\`${shortAddr(report.wallet_address)}\``);
    fields.push({ name: "User", value: parts.join(" · "), inline: false });
  }

  if (report.steps_to_reproduce) {
    fields.push({
      name: "Steps to reproduce",
      value: truncate(report.steps_to_reproduce, 1024),
      inline: false,
    });
  }

  if (report.conversation_excerpt) {
    fields.push({
      name: "Conversation excerpt",
      value: truncate(report.conversation_excerpt, 1024),
      inline: false,
    });
  }

  if (report.user_agent) {
    fields.push({
      name: "Device",
      value: truncate(report.user_agent, 200),
      inline: false,
    });
  }

  return {
    username: "GG · G3MX Issue Bot",
    embeds: [
      {
        title: `🐛 ${truncate(report.title, 256)}`,
        description: truncate(report.description, 4000),
        color: SEVERITY_COLORS[report.severity],
        fields,
        timestamp: report.reported_at,
        footer: { text: "Filed via GG chatbot" },
      },
    ],
  };
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
