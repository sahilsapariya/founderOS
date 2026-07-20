import { z } from "zod";

/** Shared form/action validation schemas (client + server). */

export const accentColors = [
  "indigo",
  "violet",
  "sky",
  "emerald",
  "amber",
  "rose",
  "slate",
] as const;

export const projectStatuses = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "archived",
] as const;

export const taskStatuses = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

export const taskPriorities = ["critical", "high", "medium", "low"] as const;

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Give the project a name").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  color: z.enum(accentColors).default("indigo"),
  status: z.enum(projectStatuses).default("planning"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  target_date: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Give the task a title").max(140),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  project_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(taskStatuses).default("todo"),
  priority: z.enum(taskPriorities).default("medium"),
  due_at: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskInputSchema>;

export const goalCategories = [
  "personal",
  "business",
  "health",
  "financial",
  "learning",
] as const;

export const goalInputSchema = z.object({
  title: z.string().trim().min(1, "Give the goal a title").max(120),
  category: z.enum(goalCategories).default("personal"),
  color: z.enum(accentColors).default("indigo"),
  target_value: z.coerce.number().positive("Target must be positive"),
  current_value: z.coerce.number().min(0).default(0),
  unit: z.string().trim().max(20).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

export type GoalInput = z.infer<typeof goalInputSchema>;

export const habitIcons = [
  "flame",
  "dumbbell",
  "book-open",
  "brain",
  "shield-check",
  "heart-pulse",
  "droplets",
  "moon",
] as const;

export const habitInputSchema = z.object({
  name: z.string().trim().min(1, "Give the habit a name").max(60),
  icon: z.enum(habitIcons).default("flame"),
  color: z.enum(accentColors).default("indigo"),
  target_per_week: z.coerce.number().int().min(1).max(7).default(7),
});

export type HabitInput = z.infer<typeof habitInputSchema>;

export const sourceKinds = [
  "salary",
  "freelance",
  "saas",
  "investment",
  "other",
] as const;

export const incomeSourceInputSchema = z.object({
  name: z.string().trim().min(1, "Name the income source").max(60),
  kind: z.enum(sourceKinds).default("other"),
  color: z.enum(accentColors).default("indigo"),
});

export type IncomeSourceInput = z.infer<typeof incomeSourceInputSchema>;

export const incomeEntryInputSchema = z.object({
  source_id: z.string().uuid("Pick an income source"),
  amount: z.coerce.number().positive("Amount must be positive"),
  received_on: z.string().min(1, "Pick a date"),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export type IncomeEntryInput = z.infer<typeof incomeEntryInputSchema>;

export const financeSettingsInputSchema = z.object({
  current_balance: z.coerce.number().min(0).optional().or(z.literal("")),
  monthly_income_goal: z.coerce.number().min(0).optional().or(z.literal("")),
  savings_goal: z.coerce.number().min(0).optional().or(z.literal("")),
});

export type FinanceSettingsInput = z.infer<typeof financeSettingsInputSchema>;

export const noteKinds = [
  "quick",
  "meeting",
  "technical",
  "idea",
  "decision",
] as const;

export const noteInputSchema = z.object({
  title: z.string().trim().min(1, "Give the note a title").max(120),
  content: z.string().trim().max(20000).optional().or(z.literal("")),
  kind: z.enum(noteKinds).default("quick"),
  project_id: z.string().uuid().optional().or(z.literal("")),
});

export type NoteInput = z.infer<typeof noteInputSchema>;

export const eventKinds = ["meeting", "focus", "deadline", "personal"] as const;

export const eventDurations = [15, 30, 45, 60, 90, 120, 180, 240] as const;

export const eventInputSchema = z.object({
  title: z.string().trim().min(1, "Give the event a title").max(120),
  kind: z.enum(eventKinds).default("meeting"),
  color: z.enum(accentColors).default("indigo"),
  starts_at: z.string().min(1, "Pick a start time"),
  duration_minutes: z.coerce.number().int().min(5).max(720).default(60),
  location: z.string().trim().max(160).optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventInputSchema>;
