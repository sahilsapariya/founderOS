import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Profile, appearance, connected accounts, integrations, AI preferences, and keyboard shortcuts."
      actionLabel="Manage profile"
    />
  );
}
