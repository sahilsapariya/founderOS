import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { AccentColor } from "@/lib/types";
import type { ProjectRow } from "@/lib/db-types";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "./widget-card";

const statusLabel: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
};

function accentOf(project: ProjectRow): AccentColor {
  return (project.color as AccentColor) in accentStyles
    ? (project.color as AccentColor)
    : "indigo";
}

export function ProjectsOverview({ projects }: { projects: ProjectRow[] }) {
  return (
    <WidgetCard title="Projects Overview" action="View all projects" actionHref="/projects">
      {projects.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <FolderKanban className="size-6 text-subtle-foreground" />
          <p className="mt-2.5 text-[13px] text-muted-foreground">No projects yet</p>
          <Link
            href="/projects?new=1"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            <Plus className="size-3.5" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {projects.map((project) => {
            const accent = accentOf(project);
            return (
              <Link
                key={project.id}
                href="/projects"
                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-semibold text-white",
                    accentStyles[accent].solid,
                  )}
                >
                  {project.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium">{project.name}</p>
                  <p className="mt-px text-[11px] text-subtle-foreground">
                    {statusLabel[project.status] ?? project.status}
                  </p>
                </div>
                <Progress
                  value={project.progress}
                  className="h-1 w-14 shrink-0"
                  indicatorClassName={accentStyles[accent].bar}
                />
                <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {project.progress}%
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
