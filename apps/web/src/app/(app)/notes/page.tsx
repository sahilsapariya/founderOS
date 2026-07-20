import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return (
    <ModulePlaceholder
      icon={FileText}
      title="Notes"
      description="Markdown notes with tags, project links, and search — quick notes, meeting notes, ideas, and decision logs."
      actionLabel="Write your first note"
    />
  );
}
