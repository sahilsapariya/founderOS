import type { Metadata } from "next";
import { FolderKanban } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <ModulePlaceholder
      icon={FolderKanban}
      title="Projects"
      description="Overview, milestones, tasks, timeline, and files for every project — with health indicators that flag what needs attention."
      actionLabel="Create your first project"
    />
  );
}
