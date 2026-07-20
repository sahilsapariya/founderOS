import { Crown, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import { projects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { WidgetCard } from "./widget-card";

function ProjectGlyph({ project }: { project: Project }) {
  const style = accentStyles[project.color];

  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg text-[13px] font-semibold text-white",
        style.solid,
      )}
    >
      {project.glyph === "crown" ? (
        <Crown className="size-4" />
      ) : project.glyph === "mail" ? (
        <Mail className="size-4" />
      ) : (
        project.initial
      )}
    </span>
  );
}

const statusLabel: Record<Project["status"], string> = {
  planning: "Planning",
  active: "Active",
  "on-hold": "On Hold",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectsOverview() {
  return (
    <WidgetCard title="Projects Overview" action="View all projects" actionHref="/projects">
      <div className="flex flex-col gap-1">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
          >
            <ProjectGlyph project={project} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-medium">{project.name}</p>
              <p className="mt-px text-[11px] text-subtle-foreground">
                {statusLabel[project.status]}
              </p>
            </div>
            <Progress
              value={project.progress}
              className="h-1 w-14 shrink-0"
              indicatorClassName={accentStyles[project.color].bar}
            />
            <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
              {project.progress}%
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
