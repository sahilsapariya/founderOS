"use client";

import * as React from "react";
import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { Check, ListTodo, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProjectRef, TaskRow } from "@/lib/db-types";
import { setTaskStatus } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetCard } from "./widget-card";

const priorityVariant: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "muted",
};

function timeLabel(task: TaskRow): string {
  if (!task.due_at) return "—";
  const d = new Date(task.due_at);
  if (isToday(d)) return format(d, "h:mm a");
  if (isPast(d)) return format(d, "MMM d");
  return format(d, "MMM d");
}

function TaskRowItem({
  task,
  projectName,
}: {
  task: TaskRow;
  projectName: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [done, setDone] = React.useState(false);

  const toggle = () => {
    setDone((d) => !d);
    startTransition(async () => {
      const result = await setTaskStatus(task.id, done ? "todo" : "done");
      if (!result.ok) setDone(done);
    });
  };

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60">
      <button
        onClick={toggle}
        disabled={pending}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition-all duration-200",
          done
            ? "border-primary bg-primary text-white"
            : "border-border-strong hover:border-primary",
        )}
      >
        <Check
          className={cn(
            "size-3 transition-all duration-200",
            done ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13.5px] font-medium transition-colors",
            done && "text-subtle-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <p className="truncate text-xs text-subtle-foreground">{projectName}</p>
      </div>

      <Badge variant={priorityVariant[task.priority] ?? "muted"}>
        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </Badge>
      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {timeLabel(task)}
      </span>
    </div>
  );
}

function EmptyBucket({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <ListTodo className="size-5 text-subtle-foreground" />
      <p className="mt-2 text-[13px] text-muted-foreground">{label}</p>
      <Link
        href="/tasks?new=1"
        className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
      >
        <Plus className="size-3.5" />
        New task
      </Link>
    </div>
  );
}

export function TodaysFocus({
  tasks,
  projects,
}: {
  tasks: TaskRow[];
  projects: ProjectRef[];
}) {
  const projectName = React.useCallback(
    (task: TaskRow) =>
      (task.project_id && projects.find((p) => p.id === task.project_id)?.name) ||
      "Personal",
    [projects],
  );

  const now = new Date();
  const highPriority = tasks.filter(
    (t) => t.priority === "critical" || t.priority === "high",
  );
  const dueToday = tasks.filter((t) => t.due_at && isToday(new Date(t.due_at)));
  const overdue = tasks.filter(
    (t) =>
      t.due_at && new Date(t.due_at) < now && !isToday(new Date(t.due_at)),
  );

  const renderList = (list: TaskRow[], emptyLabel: string) =>
    list.length === 0 ? (
      <EmptyBucket label={emptyLabel} />
    ) : (
      <div className="flex flex-col">
        {list.slice(0, 5).map((task) => (
          <TaskRowItem key={task.id} task={task} projectName={projectName(task)} />
        ))}
      </div>
    );

  return (
    <WidgetCard title="Today's Focus" action="View all" actionHref="/tasks">
      <Tabs defaultValue="high-priority">
        <TabsList className="w-full border-b border-border pb-0">
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
          <TabsTrigger value="due-today">Due Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value="high-priority" className="pt-1.5">
          {renderList(highPriority, "No high-priority tasks. Nice.")}
        </TabsContent>
        <TabsContent value="due-today" className="pt-1.5">
          {renderList(dueToday, "Nothing due today.")}
        </TabsContent>
        <TabsContent value="overdue" className="pt-1.5">
          {renderList(overdue, "Nothing overdue. Clean slate. ✨")}
        </TabsContent>
      </Tabs>
    </WidgetCard>
  );
}
