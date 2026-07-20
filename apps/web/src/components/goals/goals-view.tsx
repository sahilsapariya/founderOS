"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Plus, Target, Trash2, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { Database } from "@/lib/database.types";
import { deleteGoal } from "@/lib/actions/goals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { GoalFormDialog } from "./goal-form-dialog";
import { goalCategoryMeta, goalProgress } from "./goal-meta";

type GoalRow = Database["public"]["Tables"]["goals"]["Row"];

function accentOf(goal: GoalRow): AccentColor {
  return (goal.color as AccentColor) in accentStyles
    ? (goal.color as AccentColor)
    : "indigo";
}

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: GoalRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = accentOf(goal);
  const meta = goalCategoryMeta[goal.category] ?? goalCategoryMeta.personal;
  const pct = goalProgress(Number(goal.current_value), Number(goal.target_value));
  const completed = Boolean(goal.completed_at);
  const isPercent = (goal.unit ?? "%") === "%";

  return (
    <Card className="group flex flex-col gap-3.5 p-5 transition-all hover:border-border-strong hover:bg-card-elevated">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            accentStyles[accent].softBg,
          )}
        >
          <meta.icon className={cn("size-4.5", accentStyles[accent].text)} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold tracking-tight">
            {goal.title}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="muted">{meta.label}</Badge>
            {completed && <Badge variant="success">Completed</Badge>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Goal actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Update progress
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          <span>
            {isPercent
              ? `${pct}% complete`
              : `${Number(goal.current_value).toLocaleString("en-IN")} / ${Number(goal.target_value).toLocaleString("en-IN")} ${goal.unit ?? ""}`}
          </span>
          <span className="font-medium tabular-nums">{pct}%</span>
        </div>
        <Progress
          value={pct}
          className="h-1.5"
          indicatorClassName={accentStyles[accent].bar}
        />
        {goal.due_date && (
          <p className="mt-1 text-[11.5px] text-subtle-foreground">
            Due {format(new Date(goal.due_date), "MMM d, yyyy")}
          </p>
        )}
      </div>
    </Card>
  );
}

export function GoalsView({ goals }: { goals: GoalRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<GoalRow | null>(null);
  const [deleting, setDeleting] = React.useState<GoalRow | null>(null);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      router.replace("/goals");
    }
  }, [searchParams, router]);

  const active = goals.filter((g) => !g.completed_at);
  const completed = goals.filter((g) => g.completed_at);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {goals.length === 0
            ? "No goals yet"
            : `${active.length} active · ${completed.length} completed`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10">
            <Target className="size-6 text-[#a5b4fc]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Set your first goal
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Personal, business, health, financial, or learning — track progress
            toward what matters.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            New Goal
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => {
                  setEditing(goal);
                  setFormOpen(true);
                }}
                onDelete={() => setDeleting(goal)}
              />
            ))}
          </div>

          {completed.length > 0 && (
            <>
              <div className="mt-2 flex items-center gap-2">
                <Trophy className="size-4 text-subtle-foreground" />
                <span className="text-[12.5px] font-semibold text-muted-foreground">
                  Completed
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-1 gap-4 opacity-70 sm:grid-cols-2 xl:grid-cols-3">
                {completed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {
                      setEditing(goal);
                      setFormOpen(true);
                    }}
                    onDelete={() => setDeleting(goal)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <GoalFormDialog open={formOpen} onOpenChange={setFormOpen} goal={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="This permanently removes the goal and its progress."
        onConfirm={async () => {
          if (deleting) await deleteGoal(deleting.id);
        }}
      />
    </div>
  );
}
