"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUp,
  Bot,
  CalendarRange,
  KeyRound,
  ListOrdered,
  Loader2,
  ShieldAlert,
  Sparkles,
  Sun,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { askAssistant } from "@/lib/actions/ai";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const quickActions = [
  { kind: "prepare-day", label: "Prepare my day", icon: Sun },
  { kind: "weekly-review", label: "Weekly review", icon: CalendarRange },
  { kind: "priorities", label: "Suggest priorities", icon: ListOrdered },
  { kind: "blockers", label: "Identify blockers", icon: ShieldAlert },
] as const;

interface Exchange {
  prompt: string;
  answer: string;
}

export function AssistantView({ aiEnabled }: { aiEnabled: boolean }) {
  const [question, setQuestion] = React.useState("");
  const [pendingLabel, setPendingLabel] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [exchanges, setExchanges] = React.useState<Exchange[]>([]);
  const [, startTransition] = React.useTransition();

  const run = (input: { kind?: string; question?: string }, label: string) => {
    setPendingLabel(label);
    setError(null);
    startTransition(async () => {
      const result = await askAssistant(input);
      setPendingLabel(null);
      if (result.ok) {
        setExchanges((prev) => [{ prompt: label, answer: result.answer }, ...prev]);
        setQuestion("");
      } else {
        setError(result.error);
      }
    });
  };

  const ask = () => {
    const q = question.trim();
    if (q) run({ question: q }, q);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {!aiEnabled && (
        <Card className="flex items-start gap-3 border-warning/25 bg-warning/8 p-4">
          <KeyRound className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="text-[13.5px] font-medium">AI key not configured</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
              Get a <span className="font-medium text-foreground">free Gemini key</span> at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[#a5b4fc] hover:underline"
              >
                aistudio.google.com/apikey
              </a>{" "}
              (or use OpenAI/Groq) and fill the{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">AI_API_KEY</code>{" "}
              slot in <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">apps/web/.env</code>{" "}
              — presets are in the file. The assistant and Daily Brief switch on
              automatically.
            </p>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {quickActions.map((action) => (
          <button
            key={action.kind}
            disabled={!aiEnabled || pendingLabel !== null}
            onClick={() => run({ kind: action.kind }, action.label)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3.5 text-left transition-all",
              "hover:border-primary/30 hover:bg-card-elevated",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <span className="grid size-7 place-items-center rounded-lg bg-primary/15">
              {pendingLabel === action.label ? (
                <Loader2 className="size-3.5 animate-spin text-[#a5b4fc]" />
              ) : (
                <action.icon className="size-3.5 text-[#a5b4fc]" />
              )}
            </span>
            <span className="text-[12.5px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Ask box */}
      <Card className="p-3">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              ask();
            }
          }}
          rows={2}
          disabled={!aiEnabled}
          placeholder="Ask your chief of staff anything about your workspace…  (⌘↵ to send)"
          className="resize-none border-0 bg-transparent px-2 focus-visible:ring-0"
        />
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] text-subtle-foreground">
            Context: your projects, tasks, calendar, goals, and habits
          </span>
          <Button
            size="icon-sm"
            onClick={ask}
            disabled={!aiEnabled || !question.trim() || pendingLabel !== null}
          >
            {pendingLabel !== null && pendingLabel === question.trim() ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
            <span className="sr-only">Ask</span>
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="flex items-start gap-2.5 border-destructive/25 bg-destructive/8 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-[12.5px] leading-relaxed text-destructive">{error}</p>
        </Card>
      )}

      {/* Results */}
      {exchanges.length === 0 && !error ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/25 blur-xl" />
            <div className="relative grid size-14 place-items-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/25 to-[#8b5cf6]/15">
              <Bot className="size-6 text-[#a5b4fc]" />
            </div>
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Your chief of staff
          </h2>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
            It reads your workspace — plans your day, reviews your week, ranks
            priorities, and spots blockers. Conversations are not stored.
          </p>
        </Card>
      ) : (
        exchanges.map((exchange, i) => (
          <Card key={`${exchange.prompt}-${i}`} className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[#a5b4fc]" />
              <p className="text-[12.5px] font-medium text-muted-foreground">
                {exchange.prompt}
              </p>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed whitespace-pre-wrap">
              {exchange.answer}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
