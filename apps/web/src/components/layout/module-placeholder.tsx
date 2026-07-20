import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ModulePlaceholderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel: string;
  phase?: string;
}

/**
 * Polished empty state for modules that ship in later roadmap phases.
 * Per docs/03-design-system.md §20: illustration, short explanation, action.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  actionLabel,
  phase = "Phase 2",
}: ModulePlaceholderProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Ambient accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[480px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col items-center px-6 py-20 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/25 blur-xl" />
          <div className="relative grid size-16 place-items-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/25 to-[#8b5cf6]/15">
            <Icon className="size-7 text-[#a5b4fc]" />
          </div>
        </div>

        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-[#a5b4fc]">
          <Sparkles className="size-3" />
          Coming in {phase}
        </span>

        <h2 className="mt-3 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <Button className="mt-6" size="sm">
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
