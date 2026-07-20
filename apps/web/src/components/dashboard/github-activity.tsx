import { GitCommitHorizontal, GitMerge, GitPullRequestArrow } from "lucide-react";

import { cn } from "@/lib/utils";
import { githubEvents } from "@/lib/mock-data";
import type { GitHubEvent } from "@/lib/types";
import { WidgetCard } from "./widget-card";

const eventIcon: Record<
  GitHubEvent["type"],
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  push: { icon: GitCommitHorizontal, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  "pr-open": { icon: GitPullRequestArrow, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
  "pr-merge": { icon: GitMerge, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
};

export function GitHubActivity() {
  return (
    <WidgetCard title="GitHub Activity" action="View all" actionHref="/github">
      <div className="flex flex-col gap-1">
        {githubEvents.map((event) => {
          const { icon: Icon, className } = eventIcon[event.type];
          return (
            <div
              key={event.id}
              className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full",
                  className,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{event.action}</p>
                <p className="truncate text-[11.5px] text-subtle-foreground">
                  {event.repo}
                </p>
              </div>
              <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                {event.when}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
