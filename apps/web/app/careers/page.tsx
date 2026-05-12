"use client";

import { Briefcase } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function CareersPage() {
  return (
    <ComingSoonPage
      badgeLabel="We're hiring"
      badgeIcon={Briefcase}
      title="Careers"
      description="Open engineering, design, and operations roles. Posting board goes live with the next batch."
    />
  );
}
