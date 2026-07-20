/**
 * Domain types for FounderOS modules.
 * These mirror the data models in docs/02-product-requirements.md and will
 * eventually move to packages/types once the Supabase schema lands.
 */

export type ProjectStatus = "planning" | "active" | "on-hold" | "completed" | "archived";
export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type GoalCategory = "personal" | "business" | "health" | "financial" | "learning";
export type AccentColor = "indigo" | "violet" | "sky" | "emerald" | "amber" | "rose" | "slate";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  color: AccentColor;
  initial: string;
  glyph?: "crown" | "mail";
}

export interface FocusTask {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  time: string;
  bucket: "high-priority" | "due-today" | "overdue";
  done?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  durationLabel: string;
  color: AccentColor;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  due: string;
  icon: "trophy" | "activity" | "piggy-bank";
  color: AccentColor;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completion: number; // 0–100 ring fill
  color: string; // raw color for the ring stroke
  icon: "flame" | "dumbbell" | "book-open" | "brain" | "shield-check";
}

export interface IncomeSource {
  name: string;
  amount: number;
  share: number;
  color: string;
}

export interface MonthlyIncomePoint {
  month: string;
  income: number;
}

export interface GitHubEvent {
  id: string;
  action: string;
  repo: string;
  when: string;
  type: "push" | "pr-open" | "pr-merge";
}

export interface Note {
  id: string;
  title: string;
  when: string;
  kind: "idea" | "meeting" | "technical" | "list";
}

export interface AISuggestion {
  id: string;
  text: string;
  icon: "clock" | "trending-up" | "lock";
}

export interface ActivityItem {
  id: string;
  title: string;
  meta: string;
  when: string;
  icon: "banknote" | "check-circle" | "git-commit" | "target";
  color: AccentColor;
}
