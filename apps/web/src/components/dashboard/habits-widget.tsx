"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Repeat2 } from "lucide-react";

import type { Database } from "@/lib/database.types";
import { toggleHabitLog } from "@/lib/actions/habits";
import {
  accentHex,
  dayKey,
  habitIconMap,
  lastSevenDays,
  localStreak,
} from "@/components/habits/habit-icons";
import { WidgetCard } from "./widget-card";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];
type HabitLogRow = Database["public"]["Tables"]["habit_logs"]["Row"];

function StreakRing({ habit, logs }: { habit: HabitRow; logs: HabitLogRow[] }) {
  const [, startTransition] = React.useTransition();
  const [optimistic, setOptimistic] = React.useState<Set<string> | null>(null);

  const logged = optimistic ?? new Set(logs.map((l) => l.logged_on));
  const todayKey = dayKey(new Date());
  const doneToday = logged.has(todayKey);
  const streak = localStreak(logged);
  const week = lastSevenDays();
  const weekCount = week.filter((d) => logged.has(d.key)).length;
  const completion = Math.min(1, weekCount / habit.target_per_week);

  const Icon = habitIconMap[habit.icon ?? "flame"] ?? habitIconMap.flame;
  const color = accentHex[habit.color] ?? accentHex.indigo;

  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const toggle = () => {
    const next = new Set(logged);
    if (next.has(todayKey)) next.delete(todayKey);
    else next.add(todayKey);
    setOptimistic(next);
    startTransition(async () => {
      const result = await toggleHabitLog(habit.id, todayKey);
      if (!result.ok) setOptimistic(null);
    });
  };

  return (
    <button
      onClick={toggle}
      title={doneToday ? "Logged today — click to undo" : "Click to log today"}
      className="group/ring flex min-w-0 flex-col items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
    >
      <span className="relative block" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - completion)}
            className="transition-[stroke-dashoffset] duration-500 ease-out"
            opacity={doneToday ? 1 : 0.75}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center transition-transform group-hover/ring:scale-110">
          <Icon className="size-[18px]" style={{ color }} />
        </span>
      </span>
      <span className="text-center">
        <span className="block text-xs font-medium">{habit.name}</span>
        <span className="block text-[10.5px] text-subtle-foreground">
          {streak} day streak
        </span>
      </span>
    </button>
  );
}

export function HabitsWidget({
  habits,
  logs,
}: {
  habits: HabitRow[];
  logs: HabitLogRow[];
}) {
  const logsByHabit = React.useMemo(() => {
    const map = new Map<string, HabitLogRow[]>();
    for (const log of logs) {
      const list = map.get(log.habit_id) ?? [];
      list.push(log);
      map.set(log.habit_id, list);
    }
    return map;
  }, [logs]);

  return (
    <WidgetCard title="Habits" action="View all habits" actionHref="/habits">
      {habits.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Repeat2 className="size-5 text-subtle-foreground" />
          <p className="mt-2 text-[13px] text-muted-foreground">No habits yet</p>
          <Link
            href="/habits?new=1"
            className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            <Plus className="size-3.5" />
            Track a habit
          </Link>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-1">
          {habits.slice(0, 5).map((habit) => (
            <StreakRing
              key={habit.id}
              habit={habit}
              logs={logsByHabit.get(habit.id) ?? []}
            />
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
