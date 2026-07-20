import { formatDistanceToNowStrict } from "date-fns";
import {
  Banknote,
  CalendarPlus,
  CheckCircle2,
  FileText,
  FolderPlus,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";
import { WidgetCard } from "./widget-card";

type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];

const kindMeta: Record<string, { icon: LucideIcon; className: string }> = {
  income_logged: { icon: Banknote, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
  task_completed: { icon: CheckCircle2, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
  project_created: { icon: FolderPlus, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  goal_updated: { icon: Target, className: "bg-[#fbbf24]/12 text-[#fcd34d]" },
  note_created: { icon: FileText, className: "bg-[#94a3b8]/12 text-[#cbd5e1]" },
  event_created: { icon: CalendarPlus, className: "bg-[#7c6af8]/15 text-[#a5b4fc]" },
};

export function ActivityFeed({ items }: { items: ActivityRow[] }) {
  return (
    <WidgetCard title="Activity Feed">
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Sparkles className="size-5 text-subtle-foreground" />
          <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-muted-foreground">
            Your activity shows up here as you work.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const meta = kindMeta[item.kind] ?? kindMeta.note_created;
            const detail =
              typeof item.meta === "object" && item.meta !== null && "detail" in item.meta
                ? String((item.meta as { detail?: unknown }).detail ?? "")
                : "";
            return (
              <div
                key={item.id}
                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full",
                    meta.className,
                  )}
                >
                  <meta.icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{item.title}</p>
                  {detail && (
                    <p className="truncate text-[11.5px] text-subtle-foreground">
                      {detail}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                  {formatDistanceToNowStrict(new Date(item.occurred_at))} ago
                </span>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
