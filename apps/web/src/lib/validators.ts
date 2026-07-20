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
