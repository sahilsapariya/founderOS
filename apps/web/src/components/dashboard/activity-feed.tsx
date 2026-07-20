import { Banknote, CheckCircle2, GitCommitHorizontal, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import { activityFeed } from "@/lib/mock-data";
import type { ActivityItem } from "@/lib/types";
import { WidgetCard } from "./widget-card";

const activityIcon: Record<ActivityItem["icon"], React.ComponentType<{ className?: string }>> = {
  banknote: Banknote,
  "check-circle": CheckCircle2,
  "git-commit": GitCommitHorizontal,
  target: Target,
};

export function ActivityFeed() {
  return (
    <WidgetCard title="Activity Feed" action="View all">
      <div className="flex flex-col gap-1">
        {activityFeed.map((item) => {
          const Icon = activityIcon[item.icon];
          const style = accentStyles[item.color];
          return (
            <div
              key={item.id}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full",
                  style.softBg,
                )}
              >
                <Icon className={cn("size-3.5", style.text)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{item.title}</p>
                {item.meta && (
                  <p className="truncate text-[11.5px] text-subtle-foreground">
                    {item.meta}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                {item.when}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
