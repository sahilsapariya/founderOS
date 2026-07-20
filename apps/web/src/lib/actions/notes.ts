"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { noteInputSchema } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidate() {
  revalidatePath("/notes");
  revalidatePath("/dashboard");
}

export async function createNote(input: unknown): Promise<ActionResult> {
  const parsed = noteInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid note");

  const supabase = await createClient();
  const { title, content, kind, project_id } = parsed.data;

  const { error } = await supabase.from("notes").insert({
    title,
    content: content || "",
    kind,
    project_id: project_id || null,
  });
  if (error) return fail(error.message);

  await supabase.from("activity_log").insert({
    kind: "note_created",
    title: "Note captured",
    meta: { detail: title },
  });

  revalidate();
  return { ok: true };
}

export async function updateNote(id: string, input: unknown): Promise<ActionResult> {
  const parsed = noteInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid note");

  const supabase = await createClient();
  const { title, content, kind, project_id } = parsed.data;

  const { error } = await supabase
    .from("notes")
    .update({
      title,
      content: content || "",
      kind,
      project_id: project_id || null,
    })
    .eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function toggleNotePin(id: string, pinned: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").update({ pinned }).eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function deleteNote(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}
