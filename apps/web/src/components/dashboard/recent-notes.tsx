import { FileCode2, Lightbulb, ListChecks, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { recentNotes } from "@/lib/mock-data";
import type { Note } from "@/lib/types";
import { WidgetCard } from "./widget-card";

const noteIcon: Record<
  Note["kind"],
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  idea: { icon: Lightbulb, className: "bg-[#fbbf24]/12 text-[#fcd34d]" },
  meeting: { icon: Users, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  technical: { icon: FileCode2, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
  list: { icon: ListChecks, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
};

export function RecentNotes() {
  return (
    <WidgetCard title="Recent Notes" action="View all" actionHref="/notes">
      <div className="flex flex-col gap-1">
        {recentNotes.map((note) => {
          const { icon: Icon, className } = noteIcon[note.kind];
          return (
            <div
              key={note.id}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-lg",
                  className,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <p className="min-w-0 flex-1 truncate text-[13px] font-medium">
                {note.title}
              </p>
              <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                {note.when}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
