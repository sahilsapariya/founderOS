"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { taskInputSchema, taskStatuses } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(message: string): ActionResult {
  return { ok: false, error: message };
}

function revalidateTaskSurfaces() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function createTask(input: unknown): Promise<ActionResult> {
  const parsed = taskInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  const supabase = await createClient();
  const { title, description, project_id, status, priority, due_at } = parsed.data;

  const { error } = await supabase.from("tasks").insert({
    title,
    description: description || null,
    project_id: project_id || null,
    status,
    priority,
    due_at: due_at ? new Date(due_at).toISOString() : null,
    completed_at: status === "done" ? new Date().toISOString() : null,
  });

  if (error) return fail(error.message);
  revalidateTaskSurfaces();
  return { ok: true };
}

export async function updateTask(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = taskInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid task");
  }

  const supabase = await createClient();
  const { title, description, project_id, status, priority, due_at } = parsed.data;

  const { error } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || null,
      project_id: project_id || null,
      status,
      priority,
      due_at: due_at ? new Date(due_at).toISOString() : null,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return fail(error.message);
  revalidateTaskSurfaces();
  return { ok: true };
}

export async function setTaskStatus(
  id: string,
  status: (typeof taskStatuses)[number],
): Promise<ActionResult> {
  if (!taskStatuses.includes(status)) return fail("Invalid status");

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("title")
    .single();

  if (error) return fail(error.message);

  if (status === "done" && updated) {
    await supabase.from("activity_log").insert({
      kind: "task_completed",
      title: `Task completed: ${updated.title}`,
      meta: {},
    });
  }

  revalidateTaskSurfaces();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return fail(error.message);
  revalidateTaskSurfaces();
  return { ok: true };
}
