"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { eventInputSchema } from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidate() {
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function createEvent(input: unknown): Promise<ActionResult> {
  const parsed = eventInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid event");

  const { title, kind, color, starts_at, duration_minutes, location } = parsed.data;
  const starts = new Date(starts_at);
  if (Number.isNaN(starts.getTime())) return fail("Invalid start time");
  const ends = new Date(starts.getTime() + duration_minutes * 60_000);

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").insert({
    title,
    kind,
    color,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    location: location || null,
  });
  if (error) return fail(error.message);

  await supabase.from("activity_log").insert({
    kind: "event_created",
    title: "Event scheduled",
    meta: { detail: title },
  });

  revalidate();
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}
