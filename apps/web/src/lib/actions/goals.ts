"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { goalInputSchema } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidate() {
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

function payload(parsed: ReturnType<typeof goalInputSchema.parse>) {
  return {
    title: parsed.title,
    category: parsed.category,
    color: parsed.color,
    target_value: parsed.target_value,
    current_value: Math.min(parsed.current_value, parsed.target_value),
    unit: parsed.unit || null,
    due_date: parsed.due_date || null,
    completed_at:
      parsed.current_value >= parsed.target_value ? new Date().toISOString() : null,
  };
}

export async function createGoal(input: unknown): Promise<ActionResult> {
  const parsed = goalInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid goal");

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert(payload(parsed.data));
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function updateGoal(id: string, input: unknown): Promise<ActionResult> {
  const parsed = goalInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid goal");

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update(payload(parsed.data))
    .eq("id", id);
  if (error) return fail(error.message);

  await supabase.from("activity_log").insert({
    kind: "goal_updated",
    title: "Goal progress updated",
    meta: { detail: parsed.data.title },
  });

  revalidate();
  return { ok: true };
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}
