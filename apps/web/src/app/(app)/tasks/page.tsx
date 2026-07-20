import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/tasks/kanban-board";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, color")
      .order("created_at", { ascending: false }),
  ]);

  return <KanbanBoard tasks={tasks ?? []} projects={projects ?? []} />;
}
