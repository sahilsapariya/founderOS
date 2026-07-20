import type { Metadata } from "next";
import { Target } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <ModulePlaceholder
      icon={Target}
      title="Goals"
      description="Personal, business, health, financial, and learning goals with targets, deadlines, and progress tracking."
      actionLabel="Set your first goal"
    />
  );
}
