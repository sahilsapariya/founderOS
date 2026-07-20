"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isToday } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { Database } from "@/lib/database.types";
import { durationLabel } from "@/components/calendar/calendar-view";
import { Button } from "@/components/ui/button";
import { WidgetCard } from "./widget-card";

type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

export function CalendarWidget({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const todaysEvents = events
    .filter((e) => isToday(new Date(e.starts_at)))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <WidgetCard title="Calendar" action="View full calendar" actionHref="/calendar">
      <div className="flex items-center justify-between">
        <p
          className="text-[13px] font-medium text-secondary-foreground"
          suppressHydrationWarning
        >
          {dateLabel}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 rounded-md"
            onClick={() => router.push("/calendar")}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6 rounded-md"
            onClick={() => router.push("/calendar")}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {todaysEvents.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CalendarDays className="size-5 text-subtle-foreground" />
          <p className="mt-2 text-[13px] text-muted-foreground">
            Nothing scheduled today
          </p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1">
          {todaysEvents.map((event) => {
            const accent =
              (event.color as AccentColor) in accentStyles
                ? (event.color as AccentColor)
                : "indigo";
            return (
              <Link
                key={event.id}
                href="/calendar"
                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-[7px] transition-colors hover:bg-accent/60"
              >
                <span
                  className={cn(
                    "h-8 w-[3px] shrink-0 rounded-full",
                    accentStyles[accent].bar,
                  )}
                />
                <span className="w-[60px] shrink-0 text-xs tabular-nums text-muted-foreground">
                  {format(new Date(event.starts_at), "h:mm a")}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                  {event.title}
                </span>
                <span className="shrink-0 text-xs text-subtle-foreground">
                  {durationLabel(event.starts_at, event.ends_at)}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full border-dashed"
        onClick={() => router.push("/calendar?new=1")}
      >
        <Plus className="size-3.5" />
        Add Event
      </Button>
    </WidgetCard>
  );
}
