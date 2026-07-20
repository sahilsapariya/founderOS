import {
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Moon,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const habitIconMap: Record<string, LucideIcon> = {
  flame: Flame,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  brain: Brain,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  droplets: Droplets,
  moon: Moon,
};

export const accentHex: Record<string, string> = {
  indigo: "#7c6af8",
  violet: "#a78bfa",
  sky: "#38bdf8",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  slate: "#94a3b8",
};

export function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local-timezone streak: consecutive days ending today (or yesterday). */
export function localStreak(loggedDays: Set<string>, today = new Date()): number {
  const cursor = new Date(today);
  if (!loggedDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (loggedDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The last 7 days (oldest → today) as {key, label} pairs. */
export function lastSevenDays(today = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { key: dayKey(d), label: "SMTWTFS"[d.getDay()] };
  });
}
