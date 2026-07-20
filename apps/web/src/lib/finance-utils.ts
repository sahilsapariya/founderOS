import { format, subMonths } from "date-fns";

import type { Database } from "./database.types";

export type IncomeEntryRow =
  Database["public"]["Tables"]["income_entries"]["Row"];
export type IncomeSourceRow =
  Database["public"]["Tables"]["income_sources"]["Row"];
export type FinanceSettingsRow =
  Database["public"]["Tables"]["finance_settings"]["Row"];

const monthKey = (d: Date) => format(d, "yyyy-MM");

/** Sums per month for the last `n` months (oldest → newest). */
export function buildMonthlySeries(entries: IncomeEntryRow[], n = 7) {
  const now = new Date();
  const months = Array.from({ length: n }, (_, i) => subMonths(now, n - 1 - i));
  const sums = new Map(months.map((m) => [monthKey(m), 0]));

  for (const entry of entries) {
    const key = entry.received_on.slice(0, 7);
    if (sums.has(key)) {
      sums.set(key, (sums.get(key) ?? 0) + Number(entry.amount));
    }
  }

  return months.map((m) => ({
    month: format(m, "MMM"),
    income: sums.get(monthKey(m)) ?? 0,
  }));
}

export function monthTotals(entries: IncomeEntryRow[]) {
  const thisKey = monthKey(new Date());
  const prevKey = monthKey(subMonths(new Date(), 1));

  let current = 0;
  let previous = 0;
  for (const entry of entries) {
    const key = entry.received_on.slice(0, 7);
    if (key === thisKey) current += Number(entry.amount);
    else if (key === prevKey) previous += Number(entry.amount);
  }

  const delta =
    previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null;

  return { current, previous, delta };
}

export interface SourceSlice {
  id: string;
  name: string;
  amount: number;
  share: number;
  color: string;
}

const accentHex: Record<string, string> = {
  indigo: "#7c6af8",
  violet: "#a78bfa",
  sky: "#38bdf8",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  slate: "#94a3b8",
};

/** Current-month income grouped by source, with share percentages. */
export function currentMonthBySource(
  entries: IncomeEntryRow[],
  sources: IncomeSourceRow[],
): SourceSlice[] {
  const thisKey = monthKey(new Date());
  const byId = new Map<string, number>();

  for (const entry of entries) {
    if (entry.received_on.slice(0, 7) === thisKey) {
      byId.set(entry.source_id, (byId.get(entry.source_id) ?? 0) + Number(entry.amount));
    }
  }

  const total = [...byId.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return sources
    .filter((s) => byId.has(s.id))
    .map((s) => {
      const amount = byId.get(s.id) ?? 0;
      return {
        id: s.id,
        name: s.name,
        amount,
        share: Math.round((amount / total) * 100),
        color: accentHex[s.color] ?? accentHex.indigo,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
