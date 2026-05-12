"use client";

import { Wallet } from "lucide-react";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";

export default function WalletPage() {
  return (
    <ComingSoonPage
      badgeLabel="Wallet"
      badgeIcon={Wallet}
      title="My Wallet"
      description="On-chain balance, top-up history, withdrawals, transaction log. Full wallet panel ships with the next release."
      primaryHref="/account/orders"
      primaryLabel="View my orders"
    />
  );
}
