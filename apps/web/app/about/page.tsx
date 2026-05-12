"use client";

import { Building2 } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function AboutPage() {
  return (
    <ComingSoonPage
      badgeLabel="About G3MX"
      badgeIcon={Building2}
      title="About"
      description="Who we are, the team behind G3MX, and how a crypto-native gaming marketplace started shipping. Full story landing here soon."
    />
  );
}
