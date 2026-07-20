import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { NotesView } from "@/components/notes/notes-view";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const supabase = await createClient();

  const [{ data: notes }, { data: projects }] = await Promise.all([
    supabase.from("notes").select("*").order("updated_at", { ascending: false }),
    supabase
      .from("projects")
      .select("id, name, color")
      .order("created_at", { ascending: false }),
  ]);

  return <NotesView notes={notes ?? []} projects={projects ?? []} />;
}
