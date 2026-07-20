import { format } from "date-fns";

import { createClient } from "@/lib/supabase/server";

// `||` (not ??) so empty-string env values fall through cleanly.
export function aiEnabled(): boolean {
  return Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY);
}

export const AI_MODEL =
  process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Compact, token-frugal snapshot of the signed-in user's workspace used as
 * context for brief/assistant generations. Reads are RLS-scoped.
 */
export async function buildWorkspaceContext(): Promise<string> {
  const supabase = await createClient();
  const today = new Date();

  const [
    { data: profile },
    { data: projects },
    { data: tasks },
    { data: goals },
    { data: events },
    { data: habits },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").maybeSingle(),
    supabase
      .from("projects")
      .select("name, status, progress, target_date")
      .neq("status", "archived")
      .limit(10),
    supabase
      .from("tasks")
      .select("title, status, priority, due_at, project_id")
      .neq("status", "done")
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(25),
    supabase
      .from("goals")
      .select("title, category, current_value, target_value, unit, due_date")
      .is("completed_at", null)
      .limit(6),
    supabase
      .from("calendar_events")
      .select("title, kind, starts_at, ends_at")
      .gte("starts_at", new Date(today.setHours(0, 0, 0, 0)).toISOString())
      .lte("starts_at", new Date(today.setHours(23, 59, 59, 999)).toISOString())
      .order("starts_at", { ascending: true })
      .limit(12),
    supabase
      .from("habits")
      .select("name, target_per_week")
      .is("archived_at", null)
      .limit(6),
  ]);

  const lines: string[] = [
    `User: ${profile?.full_name ?? "Founder"}`,
    `Date: ${format(new Date(), "EEEE, MMMM d, yyyy")}`,
    "",
    "PROJECTS:",
    ...(projects?.map(
      (p) => `- ${p.name} [${p.status}, ${p.progress}%${p.target_date ? `, target ${p.target_date}` : ""}]`,
    ) ?? []),
    "",
    "OPEN TASKS (status | priority | due):",
    ...(tasks?.map(
      (t) =>
        `- ${t.title} [${t.status} | ${t.priority}${t.due_at ? ` | due ${format(new Date(t.due_at), "MMM d h:mm a")}` : ""}]`,
    ) ?? []),
    "",
    "TODAY'S CALENDAR:",
    ...(events?.length
      ? events.map(
          (e) => `- ${format(new Date(e.starts_at), "h:mm a")} ${e.title} (${e.kind})`,
        )
      : ["- (empty)"]),
    "",
    "ACTIVE GOALS:",
    ...(goals?.map(
      (g) =>
        `- ${g.title} [${g.category}, ${g.current_value}/${g.target_value}${g.unit ?? ""}${g.due_date ? `, due ${g.due_date}` : ""}]`,
    ) ?? []),
    "",
    "HABITS:",
    ...(habits?.map((h) => `- ${h.name} (${h.target_per_week}×/week)`) ?? []),
  ];

  return lines.join("\n");
}
