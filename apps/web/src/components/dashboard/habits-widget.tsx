import { BookOpen, Brain, Dumbbell, Flame, ShieldCheck } from "lucide-react";

import { habits } from "@/lib/mock-data";
import type { Habit } from "@/lib/types";
import { WidgetCard } from "./widget-card";

const habitIcons: Record<Habit["icon"], React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  flame: Flame,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  brain: Brain,
  "shield-check": ShieldCheck,
};

function StreakRing({ habit }: { habit: Habit }) {
  const Icon = habitIcons[habit.icon];
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - habit.completion / 100);

  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
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
            stroke={habit.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <Icon className="size-[18px]" style={{ color: habit.color }} />
        </span>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium">{habit.name}</p>
        <p className="text-[10.5px] text-subtle-foreground">{habit.streak} day streak</p>
      </div>
    </div>
  );
}

export function HabitsWidget() {
  return (
    <WidgetCard title="Habits" action="View all habits" actionHref="/habits">
      <div className="flex items-start justify-between gap-2">
        {habits.map((habit) => (
          <StreakRing key={habit.id} habit={habit} />
        ))}
      </div>
    </WidgetCard>
  );
}
