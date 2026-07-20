import type { Metadata } from "next";
import { CircleCheckBig } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <ModulePlaceholder
      icon={CircleCheckBig}
      title="Tasks"
      description="A keyboard-first kanban with filters, priorities, labels, and a task drawer — everything on your plate, organized."
      actionLabel="Create your first task"
    />
  );
}
