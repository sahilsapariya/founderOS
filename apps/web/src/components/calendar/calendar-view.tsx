"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addDays, format, isSameDay, isToday } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { Database } from "@/lib/database.types";
import { createEvent, deleteEvent } from "@/lib/actions/calendar";
import {
  accentColors,
  eventDurations,
  eventInputSchema,
  eventKinds,
  type EventInput,
} from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type EventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

const kindLabels: Record<string, string> = {
  meeting: "Meeting",
  focus: "Focus",
  deadline: "Deadline",
  personal: "Personal",
};

export function durationLabel(startsAt: string, endsAt: string): string {
  const minutes = Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000,
  );
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function accentOf(event: EventRow): AccentColor {
  return (event.color as AccentColor) in accentStyles
    ? (event.color as AccentColor)
    : "indigo";
}

function EventFormDialog({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: Date;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<EventInput>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: {
      title: "",
      kind: "meeting",
      color: "indigo",
      starts_at: "",
      duration_minutes: 60,
      location: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      const base = new Date(defaultDate);
      base.setHours(new Date().getHours() + 1, 0, 0, 0);
      form.reset({
        title: "",
        kind: "meeting",
        color: "indigo",
        starts_at: format(base, "yyyy-MM-dd'T'HH:mm"),
        duration_minutes: 60,
        location: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate]);

  const color = form.watch("color");

  const onSubmit = async (values: EventInput) => {
    setServerError(null);
    const result = await createEvent(values);
    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Meetings, focus blocks, deadlines. Google Calendar sync lands in the
            integrations phase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="e.g. Client call"
              autoFocus
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-start">Starts</Label>
              <Input
                id="event-start"
                type="datetime-local"
                {...form.register("starts_at")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-duration">Duration</Label>
              <Select id="event-duration" {...form.register("duration_minutes")}>
                {eventDurations.map((d) => (
                  <option key={d} value={d}>
                    {d < 60 ? `${d}m` : `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}`}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-kind">Type</Label>
              <Select id="event-kind" {...form.register("kind")}>
                {eventKinds.map((k) => (
                  <option key={k} value={k}>
                    {kindLabels[k]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {accentColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => form.setValue("color", c, { shouldDirty: true })}
                    className={cn(
                      "size-6 rounded-full transition-all",
                      accentStyles[c].solid,
                      color === c
                        ? "ring-2 ring-white/70 ring-offset-2 ring-offset-popover"
                        : "opacity-60 hover:opacity-100",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              placeholder="e.g. Google Meet"
              {...form.register("location")}
            />
          </div>
          {serverError && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Create event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EventRowItem({ event }: { event: EventRow }) {
  const accent = accentOf(event);
  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60">
      <span className={cn("h-9 w-[3px] shrink-0 rounded-full", accentStyles[accent].bar)} />
      <span className="w-[72px] shrink-0 text-xs tabular-nums text-muted-foreground">
        {format(new Date(event.starts_at), "h:mm a")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium">{event.title}</p>
        <p className="flex items-center gap-1.5 text-[11px] text-subtle-foreground">
          <Badge variant="muted" className="px-1.5 py-0 text-[10px]">
            {kindLabels[event.kind] ?? event.kind}
          </Badge>
          {event.location && (
            <span className="inline-flex min-w-0 items-center gap-0.5 truncate">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </p>
      </div>
      <span className="shrink-0 text-xs text-subtle-foreground">
        {durationLabel(event.starts_at, event.ends_at)}
      </span>
      <button
        onClick={() => deleteEvent(event.id)}
        aria-label="Delete event"
        className="grid size-6 shrink-0 place-items-center rounded text-subtle-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function CalendarView({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = React.useState(() => new Date());
  const [formOpen, setFormOpen] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setFormOpen(true);
      router.replace("/calendar");
    }
  }, [searchParams, router]);

  const dayEvents = events
    .filter((e) => isSameDay(new Date(e.starts_at), selected))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const upcoming = events
    .filter((e) => new Date(e.starts_at) > new Date())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelected((d) => addDays(d, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <button
            onClick={() => setSelected(new Date())}
            className="rounded-md px-2 py-1 text-[15px] font-semibold tracking-tight transition-colors hover:bg-accent"
          >
            {isToday(selected) ? "Today" : format(selected, "EEE, MMM d")}
            <span className="ml-2 text-[12.5px] font-normal text-subtle-foreground">
              {format(selected, "MMMM d, yyyy")}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelected((d) => addDays(d, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>
              {isToday(selected) ? "Today's Schedule" : format(selected, "EEEE")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CalendarDays className="size-6 text-subtle-foreground" />
                <p className="mt-2.5 text-[13px] text-muted-foreground">
                  Nothing scheduled
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-dashed"
                  onClick={() => setFormOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {dayEvents.map((event) => (
                  <EventRowItem key={event.id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtle-foreground">
                No upcoming events.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {upcoming.map((event) => {
                  const accent = accentOf(event);
                  return (
                    <div
                      key={event.id}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
                    >
                      <span
                        className={cn(
                          "h-8 w-[3px] shrink-0 rounded-full",
                          accentStyles[accent].bar,
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{event.title}</p>
                        <p className="text-[11px] text-subtle-foreground">
                          {format(new Date(event.starts_at), "EEE, MMM d · h:mm a")}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-subtle-foreground">
                        {durationLabel(event.starts_at, event.ends_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={selected}
      />
    </div>
  );
}
