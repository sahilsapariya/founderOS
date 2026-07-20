import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { GoalsView } from "@/components/goals/goals-view";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  return <GoalsView goals={goals ?? []} />;
}
