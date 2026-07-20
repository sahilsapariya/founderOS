import type { Metadata } from "next";
import { Repeat2 } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Habits" };

export default function HabitsPage() {
  return (
    <ModulePlaceholder
      icon={Repeat2}
      title="Habits"
      description="Simple streak tracking with weekly and monthly completion — build habits that compound."
      actionLabel="Track your first habit"
    />
  );
}
