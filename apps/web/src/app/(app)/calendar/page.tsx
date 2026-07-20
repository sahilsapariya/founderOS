import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <ModulePlaceholder
      icon={Calendar}
      title="Calendar"
      description="Day, week, month, and agenda views with Google Calendar sync, focus blocks, and deadlines in one place."
      actionLabel="Connect Google Calendar"
    />
  );
}
