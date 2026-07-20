import type { Metadata } from "next";
import { Github } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "GitHub" };

export default function GitHubPage() {
  return (
    <ModulePlaceholder
      icon={Github}
      title="GitHub"
      description="Connected repositories, recent commits, pull requests, and activity — your code, visible from the command center."
      actionLabel="Connect GitHub"
    />
  );
}
