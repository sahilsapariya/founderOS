import { isPast, isToday } from "date-fns";

import type { ProjectRow, TaskRow } from "./db-types";
import type { Database } from "./database.types";

type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

/**
 * Rule-based insights for the dashboard. Deliberately not AI — the OpenAI
 * integration lands in a later phase; these are honest heuristics computed
 * from the user's real data.
 */

export interface BriefStats {
  priorities: number;
  meetings: number;
  overdue: number;
  summary: string;
  recommendation: string | null;
}

export function computeBrief(
  tasks: TaskRow[],
  todaysEvents: EventRow[],
  projects: ProjectRow[],
): BriefStats {
  const open = tasks.filter((t) => t.status !== "done");
  const highPriority = open.filter(
    (t) => t.priority === "critical" || t.priority === "high",
  );
  const overdue = open.filter(
    (t) => t.due_at && isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at)),
  );
  const meetings = todaysEvents.filter((e) => e.kind === "meeting").length;

  const parts: string[] = [];
  parts.push(
    `${highPriority.length} high priority task${highPriority.length === 1 ? "" : "s"}`,
  );
  parts.push(`${meetings} meeting${meetings === 1 ? "" : "s"}`);
  if (overdue.length > 0) {
    parts.push(`${overdue.length} overdue item${overdue.length === 1 ? "" : "s"}`);
  }
  const summary =
    open.length === 0 && todaysEvents.length === 0
      ? "A clean slate today. Create tasks or block focus time to get moving."
      : `You have ${parts.slice(0, -1).join(", ")}${parts.length > 1 ? " and " : ""}${parts.at(-1)} today.`;

  const focusTask =
    overdue[0] ??
    highPriority.toSorted((a, b) =>
      (a.due_at ?? "9999").localeCompare(b.due_at ?? "9999"),
    )[0];

  let recommendation: string | null = null;
  if (focusTask) {
    const project = projects.find((p) => p.id === focusTask.project_id);
    recommendation = `Focus on “${focusTask.title}”${project ? ` for the ${project.name} project` : ""}${overdue.includes(focusTask) ? " — it's overdue" : ""}.`;
  }

  return {
    priorities: highPriority.length,
    meetings,
    overdue: overdue.length,
    summary,
    recommendation,
  };
}

export interface Suggestion {
  id: string;
  icon: "clock" | "trending-up" | "lock";
  text: string;
}

export function computeSuggestions(
  projects: ProjectRow[],
  tasks: TaskRow[],
  todaysEvents: EventRow[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const open = tasks.filter((t) => t.status !== "done");

  const overdue = open.filter(
    (t) => t.due_at && isPast(new Date(t.due_at)) && !isToday(new Date(t.due_at)),
  );
  if (overdue.length > 0) {
    suggestions.push({
      id: "overdue",
      icon: "clock",
      text: `${overdue.length} task${overdue.length === 1 ? " is" : "s are"} overdue. Reschedule or knock ${overdue.length === 1 ? "it" : "them"} out first thing.`,
    });
  }

  const idleProject = projects.find(
    (p) =>
      (p.status === "active" || p.status === "planning") &&
      !tasks.some((t) => t.project_id === p.id),
  );
  if (idleProject) {
    suggestions.push({
      id: "idle-project",
      icon: "trending-up",
      text: `“${idleProject.name}” has no tasks yet. Break it into steps to make progress visible.`,
    });
  }

  const hasFocusBlock = todaysEvents.some((e) => e.kind === "focus");
  if (!hasFocusBlock && open.length > 0) {
    suggestions.push({
      id: "focus-block",
      icon: "lock",
      text: "No focus time blocked today. Protect a deep-work window on your calendar.",
    });
  }

  return suggestions.slice(0, 3);
}

/** Consecutive-day streak ending today (or yesterday if today isn't logged). */
export function computeStreak(loggedDays: Set<string>, today = new Date()): number {
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);

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
