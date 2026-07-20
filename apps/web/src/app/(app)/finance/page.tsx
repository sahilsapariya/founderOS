import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  return (
    <ModulePlaceholder
      icon={Wallet}
      title="Finance"
      description="High-level financial visibility — income sources, monthly trends, annual growth, and savings goals. Not accounting software."
      actionLabel="Log your first income"
    />
  );
}
