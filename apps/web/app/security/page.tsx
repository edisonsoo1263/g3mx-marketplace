"use client";

import { Shield } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function SecurityPage() {
  return (
    <ComingSoonPage
      badgeLabel="Security"
      badgeIcon={Shield}
      title="Security"
      description="Our security practices — wallet signing, escrow guarantees, KYC tiers, and bug bounty program. Full writeup landing soon."
    />
  );
}
