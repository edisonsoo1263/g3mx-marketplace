"use client";

import { Newspaper } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function BlogPage() {
  return (
    <ComingSoonPage
      badgeLabel="Blog"
      badgeIcon={Newspaper}
      title="The G3MX blog"
      description="Patch notes, game tier-list shifts, top booster spotlights, and crypto-meta deep dives. First post drops with the next release."
    />
  );
}
