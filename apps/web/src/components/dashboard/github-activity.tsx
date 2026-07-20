import { Github } from "lucide-react";

import { WidgetCard } from "./widget-card";

export function GitHubActivity() {
  return (
    <WidgetCard title="GitHub Activity" action="Learn more" actionHref="/github">
      <div className="flex flex-col items-center py-8 text-center">
        <div className="grid size-11 place-items-center rounded-xl border border-border bg-secondary/60">
          <Github className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-3 max-w-[210px] text-[13px] leading-relaxed text-muted-foreground">
          Commits and pull requests land here once the GitHub integration
          connects.
        </p>
        <span className="mt-3 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-[#a5b4fc]">
          Integrations phase
        </span>
      </div>
    </WidgetCard>
  );
}
