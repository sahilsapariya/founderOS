"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { ProjectRef, TaskRow, TaskStatusDb } from "@/lib/db-types";
import { deleteTask, setTaskStatus } from "@/lib/actions/tasks";
import { taskStatuses } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskFormDialog, taskStatusLabels } from "./task-form-dialog";

const columnDot: Record<TaskStatusDb, string> = {
  backlog: "bg-[#5d6474]",
  todo: "bg-[#38bdf8]",
  in_progress: "bg-[#7c6af8]",
  review: "bg-[#fbbf24]",
  done: "bg-[#34d399]",
};

const priorityVariant: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  critical: "destructive",
  high: "destructive",
  medium: "warning",
  low: "muted",
};

function DueChip({ dueAt, done }: { dueAt: string | null; done: boolean }) {
  if (!dueAt) return null;
  const d = new Date(dueAt);
  const overdue = !done && isPast(d) && !isToday(d);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px]",
        overdue ? "font-medium text-destructive" : "text-subtle-foreground",
      )}
    >
      <CalendarClock className="size-3" />
      {isToday(d) ? format(d, "h:mm a") : format(d, "MMM d")}
    </span>
  );
}

function TaskCard({
  task,
  project,
  onEdit,
  onDelete,
}: {
  task: TaskRow;
  project: ProjectRef | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pending, startTransition] = React.useTransition();
  const done = task.status === "done";
  const accent =
    project && (project.color as AccentColor) in accentStyles
      ? (project.color as AccentColor)
      : "slate";

  const move = (status: TaskStatusDb) =>
    startTransition(async () => {
      await setTaskStatus(task.id, status);
    });

  return (
    <Card
      className={cn(
        "group/task flex flex-col gap-2.5 p-3.5 transition-all hover:border-border-strong hover:bg-card-elevated",
        pending && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-[13px] leading-snug font-medium",
            done && "text-subtle-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="-mt-1 -mr-1 size-6 shrink-0 opacity-0 transition-opacity group-hover/task:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-3.5" />
              <span className="sr-only">Task actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="mr-2 size-4 text-muted-foreground" />
                Move to
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {taskStatuses
                  .filter((s) => s !== task.status)
                  .map((s) => (
                    <DropdownMenuItem key={s} onSelect={() => move(s)}>
                      <span className={cn("size-2 rounded-full", columnDot[s])} />
                      {taskStatusLabels[s]}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {project && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("size-2 rounded-full", accentStyles[accent].bar)} />
            {project.name}
          </span>
        )}
        <Badge variant={priorityVariant[task.priority] ?? "muted"}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
        <DueChip dueAt={task.due_at} done={done} />
      </div>
    </Card>
  );
}

export function KanbanBoard({
  tasks,
  projects,
}: {
  tasks: TaskRow[];
  projects: ProjectRef[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectById = React.useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskRow | null>(null);
  const [createStatus, setCreateStatus] = React.useState<TaskStatusDb>("todo");
  const [deleting, setDeleting] = React.useState<TaskRow | null>(null);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setCreateStatus("todo");
      setFormOpen(true);
      router.replace("/tasks");
    }
  }, [searchParams, router]);

  const openCreate = (status: TaskStatusDb = "todo") => {
    setEditing(null);
    setCreateStatus(status);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tasks.length === 0
            ? "No tasks yet"
            : `${tasks.length} task${tasks.length === 1 ? "" : "s"} across ${taskStatuses.length} stages`}
        </p>
        <Button size="sm" onClick={() => openCreate()}>
          <Plus className="size-4" />
          New Task
        </Button>
      </div>

      <div className="-mx-7 overflow-x-auto px-7 pb-2">
        <div className="grid min-w-[900px] grid-cols-5 gap-3">
          {taskStatuses.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status);
            return (
              <div key={status} className="flex min-w-0 flex-col gap-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn("size-2 rounded-full", columnDot[status])} />
                  <span className="text-[12.5px] font-semibold">
                    {taskStatusLabels[status]}
                  </span>
                  <span className="text-[11.5px] tabular-nums text-subtle-foreground">
                    {columnTasks.length}
                  </span>
                  <button
                    onClick={() => openCreate(status)}
                    className="ml-auto grid size-5 place-items-center rounded text-subtle-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={`Add task to ${taskStatusLabels[status]}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={
                        task.project_id
                          ? projectById.get(task.project_id)
                          : undefined
                      }
                      onEdit={() => {
                        setEditing(task);
                        setFormOpen(true);
                      }}
                      onDelete={() => setDeleting(task)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <button
                      onClick={() => openCreate(status)}
                      className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-subtle-foreground transition-colors hover:border-border-strong hover:text-muted-foreground"
                    >
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        projects={projects}
        defaultStatus={createStatus}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.title}”?`}
        description="This permanently removes the task."
        onConfirm={async () => {
          if (deleting) await deleteTask(deleting.id);
        }}
      />
    </div>
  );
}
