"use client";

import Link from "next/link";
import { TrendingUp, Wallet } from "lucide-react";
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
import { WidgetCard } from "./widget-card";

interface TooltipEntry {
  value?: number | string;
  payload?: { month?: string };
}

function IncomeTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
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

function GoalRing({ progress }: { progress: number }) {
  const size = 30;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[8px] font-semibold tabular-nums text-[#a5b4fc]">
        {progress}%
      </span>
    </span>
  );
}

export function FinanceSummary({
  settings,
  sources,
  entries,
}: {
  settings: FinanceSettingsRow | null;
  sources: IncomeSourceRow[];
  entries: IncomeEntryRow[];
}) {
  const hasData = entries.length > 0 || settings !== null;

  if (!hasData) {
    return (
      <WidgetCard title="Finance Summary" action="View full report" actionHref="/finance">
        <div className="flex flex-col items-center py-10 text-center">
          <Wallet className="size-6 text-subtle-foreground" />
          <p className="mt-2.5 max-w-[240px] text-[13px] leading-relaxed text-muted-foreground">
            Track income, balance, and goals — high-level visibility, not
            accounting.
          </p>
          <Link
            href="/finance?log=1"
            className="mt-3.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-3 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            Log your first income
          </Link>
        </div>
      </WidgetCard>
    );
  }

  const series = buildMonthlySeries(entries, 7);
  const totals = monthTotals(entries);
  const slices = currentMonthBySource(entries, sources);
  const goal = settings?.monthly_income_goal ? Number(settings.monthly_income_goal) : null;
  const goalPct = goal ? Math.min(100, Math.round((totals.current / goal) * 100)) : null;

  const stats: { label: string; value: string; extra: React.ReactNode }[] = [
    {
      label: "Monthly Income",
      value: formatINR(totals.current),
      extra:
        totals.delta !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${totals.delta >= 0 ? "text-success" : "text-destructive"}`}
          >
            <TrendingUp className="size-3" />
            {totals.delta}%
          </span>
        ) : null,
    },
    {
      label: "Current Balance",
      value:
        settings?.current_balance != null
          ? formatINR(Number(settings.current_balance))
          : "—",
      extra: null,
    },
    {
      label: "Income Goal",
      value: goal ? formatINR(goal) : "—",
      extra: goalPct !== null ? <GoalRing progress={goalPct} /> : null,
    },
  ];

  return (
    <WidgetCard title="Finance Summary" action="View full report" actionHref="/finance">
      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
          >
            <p className="truncate text-[11px] text-muted-foreground">{stat.label}</p>
            <div className="mt-1 flex items-center justify-between gap-1.5">
              <p className="text-[16px] font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
              {stat.extra}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="mt-4">
        <p className="mb-1 text-[12.5px] font-medium text-secondary-foreground">
          Monthly Income
        </p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
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
                width={44}
                tick={{ fill: "var(--subtle-foreground)", fontSize: 10.5 }}
                tickFormatter={(v: number) => formatINRCompact(v)}
              />
              <RechartsTooltip
                content={<IncomeTooltip />}
                cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="income"
                isAnimationActive={false}
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#incomeFill)"
                dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
                activeDot={{
                  r: 4.5,
                  fill: "var(--chart-1)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income sources */}
      {slices.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[12.5px] font-medium text-secondary-foreground">
            Income Sources
          </p>
          <div className="flex items-center gap-5">
            <div className="relative size-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="amount"
                    nameKey="name"
                    isAnimationActive={false}
                    innerRadius={40}
                    outerRadius={55}
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
                  <p className="text-[11.5px] font-semibold tabular-nums leading-tight">
                    {formatINR(totals.current)}
                  </p>
                  <p className="text-[9px] text-subtle-foreground">This month</p>
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {slices.slice(0, 4).map((s) => (
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
        </div>
      )}
    </WidgetCard>
  );
}
