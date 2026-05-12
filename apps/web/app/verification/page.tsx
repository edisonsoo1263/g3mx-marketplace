"use client";

import { BadgeCheck } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function VerificationPage() {
  return (
    <ComingSoonPage
      badgeLabel="Booster verification"
      badgeIcon={BadgeCheck}
      title="Verification"
      description="How sellers get verified on G3MX — KYC tier, ID proof, and what verified status unlocks for buyers."
    />
  );
}
