import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Github,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequestArrow,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { GitHubEventItem } from "@/lib/github";
import { WidgetCard } from "./widget-card";

const eventIcon: Record<
  GitHubEventItem["type"],
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  push: { icon: GitCommitHorizontal, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  "pr-open": { icon: GitPullRequestArrow, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
  "pr-merge": { icon: GitMerge, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
  create: { icon: Sparkles, className: "bg-[#fbbf24]/12 text-[#fcd34d]" },
};

export function GitHubActivity({
  connected,
  events,
}: {
  connected: boolean;
  events: GitHubEventItem[] | null;
}) {
  return (
    <WidgetCard title="GitHub Activity" action="Open GitHub" actionHref="/github">
      {!connected ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="grid size-11 place-items-center rounded-xl border border-border bg-secondary/60">
            <Github className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 max-w-[210px] text-[13px] leading-relaxed text-muted-foreground">
            Connect GitHub to see commits and pull requests here.
          </p>
          <Link
            href="/github"
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-medium text-[#a5b4fc] transition-colors hover:bg-primary/25"
          >
            <Github className="size-3.5" />
            Connect
          </Link>
        </div>
      ) : events === null ? (
        <p className="py-8 text-center text-[13px] text-subtle-foreground">
          Couldn't reach GitHub — open the module to reconnect.
        </p>
      ) : events.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-subtle-foreground">
          No recent activity.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {events.map((event) => {
            const meta = eventIcon[event.type];
            return (
              <a
                key={event.id}
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full",
                    meta.className,
                  )}
                >
                  <meta.icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{event.action}</p>
                  <p className="truncate text-[11.5px] text-subtle-foreground">
                    {event.repo}
                  </p>
                </div>
                <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                  {formatDistanceToNowStrict(new Date(event.when))}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}
