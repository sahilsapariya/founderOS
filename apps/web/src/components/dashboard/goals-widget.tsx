import Link from "next/link";
import { Plus, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { Database } from "@/lib/database.types";
import { goalCategoryMeta, goalProgress } from "@/components/goals/goal-meta";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "./widget-card";

type GoalRow = Database["public"]["Tables"]["goals"]["Row"];

export function GoalsWidget({ goals }: { goals: GoalRow[] }) {
  return (
    <WidgetCard title="Goals" action="View all goals" actionHref="/goals">
      {goals.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Target className="size-5 text-subtle-foreground" />
          <p className="mt-2 text-[13px] text-muted-foreground">No goals yet</p>
          <Link
            href="/goals?new=1"
            className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            <Plus className="size-3.5" />
            Set a goal
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((goal) => {
            const accent =
              (goal.color as AccentColor) in accentStyles
                ? (goal.color as AccentColor)
                : "indigo";
            const meta = goalCategoryMeta[goal.category] ?? goalCategoryMeta.personal;
            const pct = goalProgress(Number(goal.current_value), Number(goal.target_value));

            return (
              <Link key={goal.id} href="/goals" className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    accentStyles[accent].softBg,
                  )}
                >
                  <meta.icon className={cn("size-4", accentStyles[accent].text)} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[13.5px] font-medium">{goal.title}</p>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                  {goal.due_date && (
                    <p className="mt-0.5 text-[11px] text-subtle-foreground">
                      Due{" "}
                      {new Date(goal.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  <Progress
                    value={pct}
                    className="mt-2 h-1"
                    indicatorClassName={accentStyles[accent].bar}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
