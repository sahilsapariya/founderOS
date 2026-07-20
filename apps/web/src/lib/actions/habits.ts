"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { habitInputSchema } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidate() {
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function createHabit(input: unknown): Promise<ActionResult> {
  const parsed = habitInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid habit");

  const supabase = await createClient();
  const { error } = await supabase.from("habits").insert(parsed.data);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function updateHabit(id: string, input: unknown): Promise<ActionResult> {
  const parsed = habitInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid habit");

  const supabase = await createClient();
  const { error } = await supabase.from("habits").update(parsed.data).eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function deleteHabit(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

/** Toggles the habit log for a given local day (defaults to today). */
export async function toggleHabitLog(
  habitId: string,
  day?: string,
): Promise<ActionResult> {
  const loggedOn = day ?? new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(loggedOn)) return fail("Invalid day");

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("logged_on", loggedOn)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
    if (error) return fail(error.message);
  } else {
    const { error } = await supabase
      .from("habit_logs")
      .insert({ habit_id: habitId, logged_on: loggedOn });
    if (error) return fail(error.message);
  }

  revalidate();
  return { ok: true };
}
