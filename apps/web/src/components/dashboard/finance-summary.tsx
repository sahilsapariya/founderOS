"use client";

import * as React from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
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

import { cn } from "@/lib/utils";
import { finance, incomeSources, monthlyIncomeSeries } from "@/lib/mock-data";
import { formatINR, formatINRCompact } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WidgetCard } from "./widget-card";

/* ---------------------------------- Stats --------------------------------- */

function DeltaBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-success">
      <TrendingUp className="size-3" />
      {value}%
    </span>
  );
}

function GoalRing({ progress }: { progress: number }) {
  const size = 30;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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
    </div>
  );
}

/* --------------------------------- Charts --------------------------------- */

interface TooltipPayloadEntry {
  value?: number | string;
  payload?: { month?: string; name?: string; amount?: number };
}

function IncomeTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl shadow-black/40">
      <p className="text-[11px] text-muted-foreground">
        {point.payload?.month} 2026
      </p>
      <p className="text-[13px] font-semibold tabular-nums">
        {formatINR(Number(point.value))}
      </p>
    </div>
  );
}

function MonthlyIncomeChart() {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyIncomeSeries} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="0"
          />
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
  );
}

function IncomeSourcesDonut() {
  const total = incomeSources.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="flex items-center gap-5">
      <div className="relative size-[132px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={incomeSources}
              dataKey="amount"
              nameKey="name"
              isAnimationActive={false}
              innerRadius={44}
              outerRadius={60}
              paddingAngle={3}
              cornerRadius={4}
              strokeWidth={0}
            >
              {incomeSources.map((source) => (
                <Cell key={source.name} fill={source.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[12.5px] font-semibold tabular-nums leading-tight">
              {formatINR(total)}
            </p>
            <p className="text-[9.5px] text-subtle-foreground">Total Income</p>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {incomeSources.map((source) => (
          <div key={source.name} className="flex items-center gap-2.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: source.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-secondary-foreground">
              {source.name}
            </span>
            <span className="shrink-0 text-[12.5px] font-medium tabular-nums">
              {formatINR(source.amount)}
            </span>
            <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-subtle-foreground">
              {source.share}%
            </span>
            <span className="hidden h-1 w-10 shrink-0 overflow-hidden rounded-full bg-secondary sm:block">
              <span
                className="block h-full rounded-full"
                style={{ width: `${source.share}%`, backgroundColor: source.color }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Widget ---------------------------------- */

const stats = [
  {
    label: "Monthly Income",
    value: formatINR(finance.monthlyIncome),
    extra: <DeltaBadge value={finance.monthlyIncomeDelta} />,
  },
  {
    label: "Current Balance",
    value: formatINR(finance.currentBalance),
    extra: <DeltaBadge value={finance.currentBalanceDelta} />,
  },
  {
    label: "Income Goal",
    value: formatINR(finance.incomeGoal),
    extra: <GoalRing progress={finance.incomeGoalProgress} />,
  },
];

export function FinanceSummary({ className }: { className?: string }) {
  return (
    <WidgetCard
      title="Finance Summary"
      action="View full report"
      actionHref="/finance"
      className={className}
    >
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
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[12.5px] font-medium text-secondary-foreground">
            Monthly Income
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1 rounded-md border border-border bg-secondary/60 px-2 py-1 text-[11.5px] text-muted-foreground transition-colors",
                "hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              This Year
              <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>This Year</DropdownMenuItem>
              <DropdownMenuItem>Last 6 Months</DropdownMenuItem>
              <DropdownMenuItem>Last 12 Months</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <MonthlyIncomeChart />
      </div>

      {/* Income sources */}
      <div className="mt-3">
        <p className="mb-1 text-[12.5px] font-medium text-secondary-foreground">
          Income Sources
        </p>
        <IncomeSourcesDonut />
      </div>
    </WidgetCard>
  );
}
