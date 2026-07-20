"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { projectInputSchema } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(message: string): ActionResult {
  return { ok: false, error: message };
}

function revalidateProjectSurfaces() {
  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function createProject(input: unknown): Promise<ActionResult> {
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid project");
  }

  const supabase = await createClient();
  const { name, description, color, status, progress, target_date } = parsed.data;

  const { error } = await supabase.from("projects").insert({
    name,
    description: description || null,
    color,
    status,
    progress,
    target_date: target_date || null,
  });

  if (error) return fail(error.message);

  await supabase.from("activity_log").insert({
    kind: "project_created",
    title: "Project created",
    meta: { detail: name },
  });

  revalidateProjectSurfaces();
  return { ok: true };
}

export async function updateProject(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid project");
  }

  const supabase = await createClient();
  const { name, description, color, status, progress, target_date } = parsed.data;

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      description: description || null,
      color,
      status,
      progress,
      target_date: target_date || null,
    })
    .eq("id", id);

  if (error) return fail(error.message);
  revalidateProjectSurfaces();
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) return fail(error.message);
  revalidateProjectSurfaces();
  return { ok: true };
}
