"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import { calendarEvents } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { WidgetCard } from "./widget-card";

export function CalendarWidget() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <WidgetCard title="Calendar" action="View full calendar" actionHref="/calendar">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-secondary-foreground" suppressHydrationWarning>
          {dateLabel}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="size-6 rounded-md">
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-6 rounded-md">
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {calendarEvents.map((event) => (
          <div
            key={event.id}
            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-[7px] transition-colors hover:bg-accent/60"
          >
            <span
              className={cn("h-8 w-[3px] shrink-0 rounded-full", accentStyles[event.color].bar)}
            />
            <span className="w-[60px] shrink-0 text-xs tabular-nums text-muted-foreground">
              {event.start}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
              {event.title}
            </span>
            <span className="shrink-0 text-xs text-subtle-foreground">
              {event.durationLabel}
            </span>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-3 w-full border-dashed">
        <Plus className="size-3.5" />
        Add Event
      </Button>
    </WidgetCard>
  );
}
