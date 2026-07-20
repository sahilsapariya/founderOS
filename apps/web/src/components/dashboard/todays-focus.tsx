"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusTasks } from "@/lib/mock-data";
import type { FocusTask, TaskPriority } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetCard } from "./widget-card";

const priorityVariant: Record<TaskPriority, React.ComponentProps<typeof Badge>["variant"]> = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "muted",
};

const priorityLabel: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function TaskRow({ task }: { task: FocusTask }) {
  const [done, setDone] = React.useState(Boolean(task.done));

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60">
      <button
        onClick={() => setDone((d) => !d)}
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
        <p className="truncate text-xs text-subtle-foreground">{task.project}</p>
      </div>

      <Badge variant={priorityVariant[task.priority]}>
        {priorityLabel[task.priority]}
      </Badge>
      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {task.time}
      </span>
    </div>
  );
}

function TaskList({ bucket }: { bucket: FocusTask["bucket"] }) {
  const tasks = focusTasks.filter((t) => t.bucket === bucket);

  if (tasks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-subtle-foreground">
        Nothing here. Enjoy the calm. ✨
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

export function TodaysFocus() {
  return (
    <WidgetCard title="Today's Focus" action="View all" actionHref="/tasks">
      <Tabs defaultValue="high-priority">
        <TabsList className="w-full border-b border-border pb-0">
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
          <TabsTrigger value="due-today">Due Today</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value="high-priority" className="pt-1.5">
          <TaskList bucket="high-priority" />
        </TabsContent>
        <TabsContent value="due-today" className="pt-1.5">
          <TaskList bucket="due-today" />
        </TabsContent>
        <TabsContent value="overdue" className="pt-1.5">
          <TaskList bucket="overdue" />
        </TabsContent>
      </Tabs>
    </WidgetCard>
  );
}
