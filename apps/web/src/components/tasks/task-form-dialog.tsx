"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import type { ProjectRef, TaskRow } from "@/lib/db-types";
import { createTask, updateTask } from "@/lib/actions/tasks";
import {
  taskInputSchema,
  taskPriorities,
  taskStatuses,
  type TaskInput,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

export const taskStatusLabels: Record<(typeof taskStatuses)[number], string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const priorityLabels: Record<(typeof taskPriorities)[number], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskRow | null;
  projects: ProjectRef[];
  defaultStatus?: (typeof taskStatuses)[number];
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  projects,
  defaultStatus = "todo",
}: TaskFormDialogProps) {
  const isEdit = Boolean(task);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      title: "",
      description: "",
      project_id: "",
      status: defaultStatus,
      priority: "medium",
      due_at: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        title: task?.title ?? "",
        description: task?.description ?? "",
        project_id: task?.project_id ?? "",
        status: (task?.status as TaskInput["status"]) ?? defaultStatus,
        priority: (task?.priority as TaskInput["priority"]) ?? "medium",
        due_at: toDatetimeLocal(task?.due_at ?? null),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task, defaultStatus]);

  const onSubmit = async (values: TaskInput) => {
    setServerError(null);
    const result = task
      ? await updateTask(task.id, values)
      : await createTask(values);

    if (result.ok) {
      onOpenChange(false);
    } else {
      setServerError(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this task."
              : "Tasks show up on the board and in Today's Focus."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="e.g. Finish Stripe integration"
              autoFocus
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Optional details…"
              rows={2}
              {...form.register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-project">Project</Label>
            <Select id="task-project" {...form.register("project_id")}>
              <option value="">Personal (no project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select id="task-status" {...form.register("status")}>
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {taskStatusLabels[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select id="task-priority" {...form.register("priority")}>
                {taskPriorities.map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due">Due</Label>
            <Input id="task-due" type="datetime-local" {...form.register("due_at")} />
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
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
