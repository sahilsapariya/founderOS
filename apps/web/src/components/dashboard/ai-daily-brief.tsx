import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Lightbulb,
  ListTodo,
  Sparkles,
} from "lucide-react";

import type { AiBriefContent } from "@/lib/actions/ai";
import type { BriefStats } from "@/lib/insights";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GenerateBriefButton } from "./generate-brief-button";

function Planet() {
  return (
    <div className="pointer-events-none absolute -top-7 -right-7 h-44 w-48 select-none max-[420px]:hidden">
      {/* Ambient glow */}
      <div className="absolute top-8 right-10 size-32 rounded-full bg-[#8b5cf6]/25 blur-3xl" />
      <svg viewBox="0 0 220 220" className="absolute inset-0 animate-float" aria-hidden>
        <defs>
          <radialGradient id="planetBody" cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="45%" stopColor="#7c5cf6" />
            <stop offset="100%" stopColor="#3b2d8f" />
          </radialGradient>
          <linearGradient id="planetRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6e62f5" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <circle cx="30" cy="42" r="1.4" fill="#c4b5fd" opacity="0.8" />
        <circle cx="52" cy="140" r="1.1" fill="#e0e7ff" opacity="0.55" />
        <circle cx="188" cy="30" r="1.6" fill="#e0e7ff" opacity="0.7" />
        <circle cx="200" cy="150" r="1.2" fill="#c4b5fd" opacity="0.5" />
        <circle cx="150" cy="14" r="1" fill="#e0e7ff" opacity="0.6" />

        <ellipse
          cx="118"
          cy="104"
          rx="86"
          ry="26"
          transform="rotate(-18 118 104)"
          fill="none"
          stroke="url(#planetRing)"
          strokeWidth="7"
          strokeDasharray="150 120"
          strokeDashoffset="-80"
          opacity="0.9"
        />
        <circle cx="118" cy="104" r="46" fill="url(#planetBody)" />
        <ellipse cx="102" cy="88" rx="26" ry="18" fill="#ffffff" opacity="0.14" />
        <ellipse cx="132" cy="122" rx="30" ry="20" fill="#1e1b4b" opacity="0.35" />
        <ellipse
          cx="118"
          cy="104"
          rx="86"
          ry="26"
          transform="rotate(-18 118 104)"
          fill="none"
          stroke="url(#planetRing)"
          strokeWidth="7"
          strokeDasharray="140 160"
          strokeDashoffset="62"
        />
        <circle cx="36" cy="88" r="4" fill="#a5b4fc" opacity="0.9" />
        <circle cx="196" cy="128" r="3" fill="#c4b5fd" opacity="0.8" />
      </svg>
    </div>
  );
}

export function AIDailyBrief({
  brief,
  aiBrief,
  aiEnabled,
}: {
  brief: BriefStats;
  aiBrief: AiBriefContent | null;
  aiEnabled: boolean;
}) {
  const stats = [
    { icon: AlarmClock, value: brief.priorities, label: "Priorities" },
    { icon: CalendarClock, value: brief.meetings, label: "Meetings" },
    { icon: ListTodo, value: brief.overdue, label: "Overdue" },
  ];

  return (
    <Card className="relative h-full overflow-hidden border-primary/25 bg-[linear-gradient(132deg,rgba(110,98,245,0.22)_0%,rgba(139,92,246,0.10)_42%,rgba(13,15,21,0)_75%)]">
      <Planet />

      <div className="relative flex h-full flex-col px-5 pt-4 pb-5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-primary/20">
            <Sparkles className="size-3.5 text-[#a5b4fc]" />
          </span>
          <h3 className="text-[15px] font-semibold tracking-tight">Daily Brief</h3>
          {aiBrief && <Badge variant="default">AI</Badge>}
        </div>

        <p className="mt-3 max-w-[270px] text-[13.5px] leading-relaxed text-secondary-foreground">
          {aiBrief?.summary ?? brief.summary}
        </p>

        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.045] py-1.5 pr-2.5 pl-1.5 backdrop-blur-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-primary/20">
                <stat.icon className="size-3.5 text-[#a5b4fc]" />
              </span>
              <span className="text-sm font-semibold tabular-nums">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.04] p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#c4b5fd]">
            <Lightbulb className="size-3.5" />
            Top Recommendation
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-secondary-foreground">
            {aiBrief?.recommendation ??
              brief.recommendation ??
              "You're all clear. Plan tomorrow, or capture what's on your mind."}
          </p>
          {aiBrief && aiBrief.focus_points.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {aiBrief.focus_points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-[#a5b4fc]" />
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {aiEnabled && <GenerateBriefButton hasBrief={Boolean(aiBrief)} />}
          <Button
            asChild
            size="sm"
            variant={aiEnabled ? "ghost" : "secondary"}
            className={
              aiEnabled
                ? "text-muted-foreground hover:text-foreground"
                : "border-white/10 bg-white/[0.06] hover:bg-white/[0.12]"
            }
          >
            <Link href="/ai">
              Open AI Assistant
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
