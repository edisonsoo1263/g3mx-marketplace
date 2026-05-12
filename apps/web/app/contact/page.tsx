"use client";

import { Mail } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function ContactPage() {
  return (
    <ComingSoonPage
      badgeLabel="Contact"
      badgeIcon={Mail}
      title="Get in touch"
      description="For anything urgent, email support@g3mx.xyz — full contact form, partnership inbox, and press contacts coming with the next update."
    />
  );
}
