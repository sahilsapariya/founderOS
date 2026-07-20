import type { Database } from "./database.types";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProjectStatusDb = Database["public"]["Enums"]["project_status"];
export type TaskStatusDb = Database["public"]["Enums"]["task_status"];
export type TaskPriorityDb = Database["public"]["Enums"]["task_priority"];

/** Minimal project shape needed by pickers and task chips. */
export type ProjectRef = Pick<ProjectRow, "id" | "name" | "color">;

/** Signed-in user shape passed through the app shell. */
export interface SessionUser {
  name: string;
  firstName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  plan: string;
}
