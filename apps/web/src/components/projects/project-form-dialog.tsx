"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { ProjectRow } from "@/lib/db-types";
import { createProject, updateProject } from "@/lib/actions/projects";
import {
  accentColors,
  projectInputSchema,
  projectStatuses,
  type ProjectInput,
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

const statusLabels: Record<(typeof projectStatuses)[number], string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectRow | null;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const isEdit = Boolean(project);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "indigo",
      status: "planning",
      progress: 0,
      target_date: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        name: project?.name ?? "",
        description: project?.description ?? "",
        color: (project?.color as ProjectInput["color"]) ?? "indigo",
        status: (project?.status as ProjectInput["status"]) ?? "planning",
        progress: project?.progress ?? 0,
        target_date: project?.target_date ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project]);

  const color = form.watch("color");
  const progress = form.watch("progress");

  const onSubmit = async (values: ProjectInput) => {
    setServerError(null);
    const result = project
      ? await updateProject(project.id, values)
      : await createProject(values);

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
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this project."
              : "Projects group your tasks, milestones, and progress."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. FounderOS"
              autoFocus
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              rows={2}
              {...form.register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {accentColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() =>
                    form.setValue("color", c, { shouldDirty: true })
                  }
                  className={cn(
                    "size-7 rounded-full transition-all",
                    accentStyles[c].solid,
                    color === c
                      ? "ring-2 ring-white/70 ring-offset-2 ring-offset-popover"
                      : "opacity-60 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-status">Status</Label>
              <Select id="project-status" {...form.register("status")}>
                {projectStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-target">Target date</Label>
              <Input
                id="project-target"
                type="date"
                {...form.register("target_date")}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="project-progress">Progress</Label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>
            <input
              id="project-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              className="accent-[var(--primary)]"
              {...form.register("progress")}
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
              {isEdit ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
