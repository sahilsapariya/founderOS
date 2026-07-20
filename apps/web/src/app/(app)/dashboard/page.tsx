import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: projects }, { data: tasks }] = await Promise.all([
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
  ]);

  const projectRows = projects ?? [];

  return (
    <DashboardGrid
      projects={projectRows}
      tasks={tasks ?? []}
      projectRefs={projectRows.map(({ id, name, color }) => ({ id, name, color }))}
    />
  );
}
