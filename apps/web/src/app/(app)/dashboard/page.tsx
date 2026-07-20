import type { Metadata } from "next";
import { format, subDays, subMonths } from "date-fns";

import type { AiBriefContent } from "@/lib/actions/ai";
import { aiEnabled } from "@/lib/ai/context";
import { getGitHubEvents, type GitHubEventItem } from "@/lib/github";
import { computeBrief, computeSuggestions } from "@/lib/insights";
import { createClient } from "@/lib/supabase/server";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: projects },
    { data: tasks },
    { data: goals },
    { data: habits },
    { data: habitLogs },
    { data: notes },
    { data: events },
    { data: activity },
    { data: financeSettings },
    { data: incomeSources },
    { data: incomeEntries },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("tasks")
      .select("*")
      .neq("status", "done")
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(40),
    supabase
      .from("goals")
      .select("*")
      .is("completed_at", null)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("habits")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: true })
      .limit(5),
    supabase
      .from("habit_logs")
      .select("*")
      .gte("logged_on", format(subDays(new Date(), 90), "yyyy-MM-dd"))
      .order("logged_on", { ascending: false })
      .limit(600),
    supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(4),
    supabase
      .from("calendar_events")
      .select("*")
      .gte("starts_at", subDays(new Date(), 1).toISOString())
      .order("starts_at", { ascending: true })
      .limit(40),
    supabase
      .from("activity_log")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(6),
    supabase.from("finance_settings").select("*").maybeSingle(),
    supabase
      .from("income_sources")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("income_entries")
      .select("*")
      .gte("received_on", format(subMonths(new Date(), 7), "yyyy-MM-01"))
      .order("received_on", { ascending: false }),
  ]);

  const [{ data: aiBriefRow }, { data: githubIntegration }] = await Promise.all([
    supabase
      .from("ai_briefs")
      .select("content")
      .eq("brief_date", format(new Date(), "yyyy-MM-dd"))
      .maybeSingle(),
    supabase
      .from("integrations")
      .select("account_label, credentials")
      .eq("provider", "github")
      .maybeSingle(),
  ]);

  const githubToken = (
    githubIntegration?.credentials as { access_token?: string } | null
  )?.access_token;
  let githubEvents: GitHubEventItem[] | null = null;
  if (githubToken && githubIntegration?.account_label) {
    try {
      githubEvents = await getGitHubEvents(
        githubToken,
        githubIntegration.account_label,
        4,
      );
    } catch {
      githubEvents = null;
    }
  }

  const projectRows = projects ?? [];
  const taskRows = tasks ?? [];
  const eventRows = events ?? [];
  const todaysEvents = eventRows.filter(
    (e) => new Date(e.starts_at).toDateString() === new Date().toDateString(),
  );

  return (
    <DashboardGrid
      data={{
        projects: projectRows,
        projectRefs: projectRows.map(({ id, name, color }) => ({ id, name, color })),
        tasks: taskRows,
        goals: goals ?? [],
        habits: habits ?? [],
        habitLogs: habitLogs ?? [],
        notes: notes ?? [],
        events: eventRows,
        activity: activity ?? [],
        financeSettings: financeSettings ?? null,
        incomeSources: incomeSources ?? [],
        incomeEntries: incomeEntries ?? [],
        brief: computeBrief(taskRows, todaysEvents, projectRows),
        suggestions: computeSuggestions(projectRows, taskRows, todaysEvents),
        aiBrief: (aiBriefRow?.content as AiBriefContent | null) ?? null,
        aiEnabled: aiEnabled(),
        github: {
          connected: Boolean(githubToken),
          events: githubEvents,
        },
      }}
    />
  );
}
