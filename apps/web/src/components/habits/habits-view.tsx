"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, MoreHorizontal, Pencil, Plus, Repeat2, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Database } from "@/lib/database.types";
import { deleteHabit, toggleHabitLog } from "@/lib/actions/habits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitFormDialog } from "./habit-form-dialog";
import { accentHex, dayKey, habitIconMap, lastSevenDays, localStreak } from "./habit-icons";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type HabitLogRow = Database["public"]["Tables"]["habit_logs"]["Row"];

function HabitCard({
  habit,
  logs,
  onEdit,
  onDelete,
}: {
  habit: HabitRow;
  logs: HabitLogRow[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useState<Set<string> | null>(null);

  const logged = React.useMemo(
    () => optimistic ?? new Set(logs.map((l) => l.logged_on)),
    [logs, optimistic],
  );

  const Icon = habitIconMap[habit.icon ?? "flame"] ?? habitIconMap.flame;
  const color = accentHex[habit.color] ?? accentHex.indigo;
  const week = lastSevenDays();
  const todayKey = dayKey(new Date());
  const doneToday = logged.has(todayKey);
  const streak = localStreak(logged);
  const weekCount = week.filter((d) => logged.has(d.key)).length;

  const toggle = (key: string) => {
    const next = new Set(logged);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleHabitLog(habit.id, key);
      if (!result.ok) setOptimistic(null);
    });
  };

  return (
    <Card className="group flex flex-col gap-4 p-5 transition-all hover:border-border-strong hover:bg-card-elevated">
      <div className="flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: `${color}26` }}
        >
          <Icon className="size-4.5" style={{ color }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold tracking-tight">
            {habit.name}
          </p>
          <p className="mt-0.5 text-[11.5px] text-subtle-foreground">
            {streak} day streak · {weekCount}/{habit.target_per_week} this week
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Habit actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Last 7 days */}
      <div className="flex items-center justify-between gap-1">
        {week.map((d) => {
          const isLogged = logged.has(d.key);
          const isToday = d.key === todayKey;
          return (
            <button
              key={d.key}
              onClick={() => toggle(d.key)}
              aria-label={`Toggle ${d.key}`}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border text-[10px] transition-all",
                  isLogged
                    ? "border-transparent text-white"
                    : "border-border text-subtle-foreground hover:border-border-strong",
                  isToday && !isLogged && "border-dashed border-border-strong",
                )}
                style={isLogged ? { backgroundColor: color } : undefined}
              >
                {isLogged ? <Check className="size-3.5" /> : d.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        variant={doneToday ? "secondary" : "default"}
        size="sm"
        className="w-full"
        onClick={() => toggle(todayKey)}
      >
        {doneToday ? (
          <>
            <Check className="size-4" /> Done today
          </>
        ) : (
          "Mark today"
        )}
      </Button>
    </Card>
  );
}

export function HabitsView({
  habits,
  logs,
}: {
  habits: HabitRow[];
  logs: HabitLogRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HabitRow | null>(null);
  const [deleting, setDeleting] = React.useState<HabitRow | null>(null);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      router.replace("/habits");
    }
  }, [searchParams, router]);

  const logsByHabit = React.useMemo(() => {
    const map = new Map<string, HabitLogRow[]>();
    for (const log of logs) {
      const list = map.get(log.habit_id) ?? [];
      list.push(log);
      map.set(log.habit_id, list);
    }
    return map;
  }, [logs]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {habits.length === 0
            ? "No habits yet"
            : `${habits.length} habit${habits.length === 1 ? "" : "s"}`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10">
            <Repeat2 className="size-6 text-[#a5b4fc]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Track your first habit
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Build streaks that compound — running, reading, meditation, anything
            worth doing daily.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            New Habit
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logsByHabit.get(habit.id) ?? []}
              onEdit={() => {
                setEditing(habit);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(habit)}
            />
          ))}
        </div>
      )}

      <HabitFormDialog open={formOpen} onOpenChange={setFormOpen} habit={editing} />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="This permanently removes the habit and its log history."
        onConfirm={async () => {
          if (deleting) await deleteHabit(deleting.id);
        }}
      />
    </div>
  );
}
