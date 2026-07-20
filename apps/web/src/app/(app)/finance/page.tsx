import type { Metadata } from "next";
import { format, subMonths } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { FinanceView } from "@/components/finance/finance-view";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const supabase = await createClient();
  const since = format(subMonths(new Date(), 7), "yyyy-MM-01");

  const [{ data: settings }, { data: sources }, { data: entries }] =
    await Promise.all([
      supabase.from("finance_settings").select("*").maybeSingle(),
      supabase
        .from("income_sources")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("income_entries")
        .select("*")
        .gte("received_on", since)
        .order("received_on", { ascending: false }),
    ]);

  return (
    <FinanceView
      settings={settings ?? null}
      sources={sources ?? []}
      entries={entries ?? []}
    />
  );
}
