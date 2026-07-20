import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AIPage() {
  return (
    <ModulePlaceholder
      icon={Bot}
      title="AI Assistant"
      description="Your chief of staff — prepare your day, summarize work, run weekly reviews, spot blockers, and generate sprints."
      actionLabel="Ask anything"
    />
  );
}
