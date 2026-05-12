"use client";

import { HelpCircle } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function HelpPage() {
  return (
    <ComingSoonPage
      badgeLabel="Help center"
      badgeIcon={HelpCircle}
      title="Help"
      description="Searchable FAQ, account setup guides, payment troubleshooting, and contact-support flows. Catalog opens with the next wave."
    />
  );
}
