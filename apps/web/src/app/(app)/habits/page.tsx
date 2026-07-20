import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { HabitsView } from "@/components/habits/habits-view";

export const metadata: Metadata = { title: "Habits" };

export default async function HabitsPage() {
  const supabase = await createClient();

  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("habit_logs")
      .select("*")
      .order("logged_on", { ascending: false })
      .limit(1000),
  ]);

  return <HabitsView habits={habits ?? []} logs={logs ?? []} />;
}
