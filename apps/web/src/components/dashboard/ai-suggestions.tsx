import { Clock, Lock, Sparkles, TrendingUp } from "lucide-react";

import { aiSuggestions } from "@/lib/mock-data";
import type { AISuggestion } from "@/lib/types";
import { WidgetCard } from "./widget-card";

const suggestionIcon: Record<AISuggestion["icon"], React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  "trending-up": TrendingUp,
  lock: Lock,
};

export function AISuggestions() {
  return (
    <WidgetCard
      title="AI Suggestions"
      icon={<Sparkles className="size-4 text-[#a5b4fc]" />}
      className="border-primary/15"
    >
      <div className="flex flex-col gap-2">
        {aiSuggestions.map((suggestion) => {
          const Icon = suggestionIcon[suggestion.icon];
          return (
            <div
              key={suggestion.id}
              className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-2.5 transition-colors hover:border-primary/25 hover:bg-secondary/70"
            >
              <span className="mt-px grid size-6 shrink-0 place-items-center rounded-md bg-primary/15">
                <Icon className="size-3.5 text-[#a5b4fc]" />
              </span>
              <p className="text-[12.5px] leading-relaxed text-secondary-foreground">
                {suggestion.text}
              </p>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
