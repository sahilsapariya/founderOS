import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ProjectsView } from "@/components/projects/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return <ProjectsView projects={projects ?? []} />;
}
