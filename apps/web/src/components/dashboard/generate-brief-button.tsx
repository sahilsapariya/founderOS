"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";

import { generateDailyBrief } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";

export function GenerateBriefButton({ hasBrief }: { hasBrief: boolean }) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const generate = () =>
    startTransition(async () => {
      setError(null);
      const result = await generateDailyBrief();
      if (!result.ok) setError(result.error);
    });

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        size="sm"
        variant="secondary"
        className="w-fit border-white/10 bg-white/[0.06] hover:bg-white/[0.12]"
        onClick={generate}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {pending
          ? "Thinking…"
          : hasBrief
            ? "Regenerate brief"
            : "Generate with AI"}
      </Button>
      {error && (
        <p className="max-w-[280px] text-[11px] leading-relaxed text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
