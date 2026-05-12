"use client";

import { Gavel } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function DisputesPage() {
  return (
    <ComingSoonPage
      badgeLabel="Dispute resolution"
      badgeIcon={Gavel}
      title="Disputes"
      description="How to open a dispute, what evidence to provide, SLA windows, and escalation steps. Full handbook coming soon."
    />
  );
}
