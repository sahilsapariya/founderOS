import { Activity, PiggyBank, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import { goals } from "@/lib/mock-data";
import type { Goal } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "./widget-card";

const goalIcons: Record<Goal["icon"], React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  activity: Activity,
  "piggy-bank": PiggyBank,
};

export function GoalsWidget() {
  return (
    <WidgetCard title="Goals" action="View all goals" actionHref="/goals">
      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.icon];
          const style = accentStyles[goal.color];

          return (
            <div key={goal.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  style.softBg,
                )}
              >
                <Icon className={cn("size-4", style.text)} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[13.5px] font-medium">{goal.title}</p>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-subtle-foreground">Due {goal.due}</p>
                <Progress
                  value={goal.progress}
                  className="mt-2 h-1"
                  indicatorClassName={style.bar}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
