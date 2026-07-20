"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarDays,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { ProjectRow } from "@/lib/db-types";
import { deleteProject } from "@/lib/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ProjectFormDialog } from "./project-form-dialog";

const statusMeta: Record<
  string,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  planning: { label: "Planning", variant: "muted" },
  active: { label: "Active", variant: "success" },
  on_hold: { label: "On Hold", variant: "warning" },
  completed: { label: "Completed", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

function accentOf(project: ProjectRow): AccentColor {
  return (project.color as AccentColor) in accentStyles
    ? (project.color as AccentColor)
    : "indigo";
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = accentOf(project);
  const status = statusMeta[project.status] ?? statusMeta.planning;

  return (
    <Card className="group flex flex-col gap-4 p-5 transition-all hover:border-border-strong hover:bg-card-elevated">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white",
            accentStyles[accent].solid,
          )}
        >
          {project.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold tracking-tight">
            {project.name}
          </p>
          <Badge variant={status.variant} className="mt-1">
            {status.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Project actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {project.description && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium tabular-nums">{project.progress}%</span>
        </div>
        <Progress
          value={project.progress}
          className="h-1.5"
          indicatorClassName={accentStyles[accent].bar}
        />
        {project.target_date && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-subtle-foreground">
            <CalendarDays className="size-3" />
            Target: {format(new Date(project.target_date), "MMM d, yyyy")}
          </p>
        )}
      </div>
    </Card>
  );
}

export function ProjectsView({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = React.useState<ProjectRow | null>(null);

  React.useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      router.replace("/projects");
    }
  }, [searchParams, router]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length === 0
            ? "No projects yet"
            : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl border border-primary/25 bg-primary/10">
            <FolderKanban className="size-6 text-[#a5b4fc]" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Create your first project
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Projects group your tasks and milestones, and power the dashboard's
            progress view.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            New Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setEditing(project);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="This permanently removes the project. Its tasks are kept and become personal tasks."
        onConfirm={async () => {
          if (deleting) await deleteProject(deleting.id);
        }}
      />
    </div>
  );
}
