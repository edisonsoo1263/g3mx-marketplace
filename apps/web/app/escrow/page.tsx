"use client";

import { ShieldCheck } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function EscrowPage() {
  return (
    <ComingSoonPage
      badgeLabel="Escrow & disputes"
      badgeIcon={ShieldCheck}
      title="Escrow"
      description="How G3MX holds funds in 72-hour escrow, auto-refund triggers, and the dispute path. Full walkthrough coming soon."
    />
  );
}
