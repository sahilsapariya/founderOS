"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { IndianRupee, Plus, Settings2, Trash2, TrendingUp, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatINR, formatINRCompact } from "@/lib/format";
import {
  buildMonthlySeries,
  currentMonthBySource,
  monthTotals,
  type FinanceSettingsRow,
  type IncomeEntryRow,
  type IncomeSourceRow,
} from "@/lib/finance-utils";
import { deleteIncomeEntry } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIncomeDialog, SettingsDialog, SourceDialog } from "./finance-dialogs";

interface TooltipEntry {
  value?: number | string;
  payload?: { month?: string };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl shadow-black/40">
      <p className="text-[11px] text-muted-foreground">{payload[0].payload?.month}</p>
      <p className="text-[13px] font-semibold tabular-nums">
        {formatINR(Number(payload[0].value))}
      </p>
    </div>
  );
}

export function FinanceView({
  settings,
  sources,
  entries,
}: {
  settings: FinanceSettingsRow | null;
  sources: IncomeSourceRow[];
  entries: IncomeEntryRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logOpen, setLogOpen] = React.useState(false);
  const [sourceOpen, setSourceOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get("log") === "1") {
      setLogOpen(true);
      router.replace("/finance");
    }
  }, [searchParams, router]);

  const series = buildMonthlySeries(entries, 7);
  const totals = monthTotals(entries);
  const slices = currentMonthBySource(entries, sources);
  const goal = settings?.monthly_income_goal ? Number(settings.monthly_income_goal) : null;
  const goalPct = goal ? Math.min(100, Math.round((totals.current / goal) * 100)) : null;
  const recent = entries.slice(0, 8);
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {entries.length === 0
            ? "No income logged yet"
            : `${entries.length} entr${entries.length === 1 ? "y" : "ies"} · ${sources.length} source${sources.length === 1 ? "" : "s"}`}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings2 className="size-4" />
            Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSourceOpen(true)}>
            <Plus className="size-4" />
            Source
          </Button>
          <Button size="sm" onClick={() => setLogOpen(true)}>
            <IndianRupee className="size-4" />
            Log Income
          </Button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">This Month</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatINR(totals.current)}
            </p>
            {totals.delta !== null && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium ${totals.delta >= 0 ? "text-success" : "text-destructive"}`}
              >
                <TrendingUp className="size-3" />
                {totals.delta}%
              </span>
            )}
          </div>
          <p className="mt-1 text-[11.5px] text-subtle-foreground">
            vs {formatINR(totals.previous)} last month
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Current Balance</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
            {settings?.current_balance != null
              ? formatINR(Number(settings.current_balance))
              : "—"}
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            className="mt-1 text-[11.5px] text-[#a5b4fc] hover:underline"
          >
            {settings?.current_balance != null ? "Update balance" : "Set balance"}
          </button>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Monthly Goal</p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {goal ? formatINR(goal) : "—"}
            </p>
            {goalPct !== null && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#a5b4fc]">
                {goalPct}%
              </span>
            )}
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="mt-1 text-[11.5px] text-[#a5b4fc] hover:underline"
          >
            {goal ? "Adjust goal" : "Set a goal"}
          </button>
        </Card>
      </div>

      {/* Chart + sources */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="financePageFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--subtle-foreground)", fontSize: 11 }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tick={{ fill: "var(--subtle-foreground)", fontSize: 10.5 }}
                    tickFormatter={(v: number) => formatINRCompact(v)}
                  />
                  <RechartsTooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    isAnimationActive={false}
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#financePageFill)"
                    dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>This Month by Source</CardTitle>
          </CardHeader>
          <CardContent>
            {slices.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Wallet className="size-6 text-subtle-foreground" />
                <p className="mt-2.5 text-[13px] text-muted-foreground">
                  Nothing logged this month yet
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-5">
                <div className="relative size-[132px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={slices}
                        dataKey="amount"
                        nameKey="name"
                        isAnimationActive={false}
                        innerRadius={44}
                        outerRadius={60}
                        paddingAngle={3}
                        cornerRadius={4}
                        strokeWidth={0}
                      >
                        {slices.map((s) => (
                          <Cell key={s.id} fill={s.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <p className="text-[12.5px] font-semibold tabular-nums leading-tight">
                        {formatINR(totals.current)}
                      </p>
                      <p className="text-[9.5px] text-subtle-foreground">Total</p>
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  {slices.map((s) => (
                    <div key={s.id} className="flex items-center gap-2.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-secondary-foreground">
                        {s.name}
                      </span>
                      <span className="shrink-0 text-[12.5px] font-medium tabular-nums">
                        {formatINR(s.amount)}
                      </span>
                      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-subtle-foreground">
                        {s.share}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-subtle-foreground">
              Log your first income to see it here.
            </p>
          ) : (
            <div className="flex flex-col">
              {recent.map((entry) => {
                const source = sourceById.get(entry.source_id);
                return (
                  <div
                    key={entry.id}
                    className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#34d399]/12 text-[#6ee7b7]">
                      <IndianRupee className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {formatINR(Number(entry.amount))}
                        <span className="ml-2 text-[11.5px] font-normal text-subtle-foreground">
                          {source?.name ?? "Unknown source"}
                        </span>
                      </p>
                      {entry.note && (
                        <p className="truncate text-[11.5px] text-subtle-foreground">
                          {entry.note}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                      {format(new Date(entry.received_on), "MMM d")}
                    </span>
                    <button
                      onClick={() => deleteIncomeEntry(entry.id)}
                      aria-label="Delete entry"
                      className="grid size-6 shrink-0 place-items-center rounded text-subtle-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <LogIncomeDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        sources={sources}
        onNeedSource={() => setSourceOpen(true)}
      />
      <SourceDialog open={sourceOpen} onOpenChange={setSourceOpen} />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
      />
    </div>
  );
}
