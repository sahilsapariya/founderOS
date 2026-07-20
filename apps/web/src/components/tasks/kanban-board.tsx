"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isPast, isToday } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  GripVertical,
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

const DRAG_MIME = "application/x-founderos-task";

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
  status,
  project,
  isDragging,
  onDragStart,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
}: {
  task: TaskRow;
  status: TaskStatusDb;
  project: ProjectRef | undefined;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (status: TaskStatusDb) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = status === "done";
  const accent =
    project && (project.color as AccentColor) in accentStyles
      ? (project.color as AccentColor)
      : "slate";

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group/task flex cursor-grab flex-col gap-2.5 p-3.5 transition-all select-none",
        "hover:border-border-strong hover:bg-card-elevated active:cursor-grabbing",
        isDragging && "rotate-1 opacity-40 ring-1 ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1.5">
          <GripVertical className="mt-0.5 size-3.5 shrink-0 text-subtle-foreground/60 opacity-0 transition-opacity group-hover/task:opacity-100" />
          <p
            className={cn(
              "text-[13px] leading-snug font-medium",
              done && "text-subtle-foreground line-through",
            )}
          >
            {task.title}
          </p>
        </div>
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
                  .filter((s) => s !== status)
                  .map((s) => (
                    <DropdownMenuItem key={s} onSelect={() => onMove(s)}>
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

      <div className="flex flex-wrap items-center gap-2 pl-5">
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

  // Drag & drop state — optimistic column overrides so drops feel instant.
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<TaskStatusDb | null>(null);
  const [overrides, setOverrides] = React.useState<Record<string, TaskStatusDb>>({});
  const [, startTransition] = React.useTransition();

  // Drop overrides once the server state has caught up.
  React.useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const task of tasks) {
        if (next[task.id] && next[task.id] === task.status) {
          delete next[task.id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [tasks]);

  const effectiveStatus = React.useCallback(
    (task: TaskRow): TaskStatusDb => overrides[task.id] ?? (task.status as TaskStatusDb),
    [overrides],
  );

  const moveTask = React.useCallback(
    (taskId: string, status: TaskStatusDb) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || effectiveStatus(task) === status) return;

      setOverrides((prev) => ({ ...prev, [taskId]: status }));
      startTransition(async () => {
        const result = await setTaskStatus(taskId, status);
        if (!result.ok) {
          setOverrides((prev) => {
            const next = { ...prev };
            delete next[taskId];
            return next;
          });
        }
      });
    },
    [tasks, effectiveStatus],
  );

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
            const columnTasks = tasks.filter((t) => effectiveStatus(t) === status);
            const isDropTarget = dropTarget === status && draggingId !== null;

            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dropTarget !== status) setDropTarget(status);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropTarget((cur) => (cur === status ? null : cur));
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData(DRAG_MIME);
                  setDropTarget(null);
                  setDraggingId(null);
                  if (id) moveTask(id, status);
                }}
                className={cn(
                  "-m-1.5 flex min-w-0 flex-col gap-2.5 rounded-xl p-1.5 transition-colors duration-150",
                  isDropTarget && "bg-primary/[0.07] ring-1 ring-primary/30",
                )}
              >
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

                <div className="flex min-h-24 flex-col gap-2">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      status={effectiveStatus(task)}
                      project={
                        task.project_id ? projectById.get(task.project_id) : undefined
                      }
                      isDragging={draggingId === task.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_MIME, task.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDropTarget(null);
                      }}
                      onMove={(s) => moveTask(task.id, s)}
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
                      className={cn(
                        "rounded-xl border border-dashed border-border px-3 py-6 text-center text-[11.5px] text-subtle-foreground transition-colors hover:border-border-strong hover:text-muted-foreground",
                        isDropTarget && "border-primary/40 text-[#a5b4fc]",
                      )}
                    >
                      {isDropTarget ? "Drop here" : "+ Add a task"}
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
