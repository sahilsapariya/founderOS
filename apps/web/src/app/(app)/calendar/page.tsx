import type { Metadata } from "next";
import { addDays, subDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("calendar_events")
    .select("*")
    .gte("starts_at", subDays(new Date(), 45).toISOString())
    .lte("starts_at", addDays(new Date(), 60).toISOString())
    .order("starts_at", { ascending: true });

  return <CalendarView events={events ?? []} />;
}
