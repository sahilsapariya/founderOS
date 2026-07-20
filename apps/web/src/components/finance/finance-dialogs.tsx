"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { FinanceSettingsRow, IncomeSourceRow } from "@/lib/finance-utils";
import {
  createIncomeSource,
  logIncome,
  updateFinanceSettings,
} from "@/lib/actions/finance";
import {
  accentColors,
  financeSettingsInputSchema,
  incomeEntryInputSchema,
  incomeSourceInputSchema,
  sourceKinds,
  type FinanceSettingsInput,
  type IncomeEntryInput,
  type IncomeSourceInput,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const kindLabels: Record<(typeof sourceKinds)[number], string> = {
  salary: "Salary",
  freelance: "Freelancing",
  saas: "SaaS Revenue",
  investment: "Investments",
  other: "Other",
};

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {message}
    </p>
  );
}

export function LogIncomeDialog({
  open,
  onOpenChange,
  sources,
  onNeedSource,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: IncomeSourceRow[];
  onNeedSource: () => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<IncomeEntryInput>({
    resolver: zodResolver(incomeEntryInputSchema),
    defaultValues: {
      source_id: "",
      amount: 0,
      received_on: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        source_id: sources[0]?.id ?? "",
        amount: 0,
        received_on: new Date().toISOString().slice(0, 10),
        note: "",
      });
      if (sources.length === 0) {
        onOpenChange(false);
        onNeedSource();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sources.length]);

  const onSubmit = async (values: IncomeEntryInput) => {
    setServerError(null);
    const result = await logIncome(values);
    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log income</DialogTitle>
          <DialogDescription>
            Record money received — it feeds the monthly chart and goal ring.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="income-amount">Amount (₹)</Label>
            <Input
              id="income-amount"
              type="number"
              step="any"
              min={0}
              autoFocus
              placeholder="25000"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="income-source">Source</Label>
            <Select id="income-source" {...form.register("source_id")}>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onNeedSource();
              }}
              className="self-start text-xs text-[#a5b4fc] hover:underline"
            >
              + New source
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="income-date">Received on</Label>
            <Input id="income-date" type="date" {...form.register("received_on")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="income-note">Note</Label>
            <Input
              id="income-note"
              placeholder="e.g. Client A milestone 2"
              {...form.register("note")}
            />
          </div>
          <ErrorLine message={serverError} />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Log income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SourceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<IncomeSourceInput>({
    resolver: zodResolver(incomeSourceInputSchema),
    defaultValues: { name: "", kind: "other", color: "indigo" },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({ name: "", kind: "other", color: "indigo" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const color = form.watch("color");

  const onSubmit = async (values: IncomeSourceInput) => {
    setServerError(null);
    const result = await createIncomeSource(values);
    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New income source</DialogTitle>
          <DialogDescription>
            Salary, freelancing, SaaS — wherever money comes from.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-name">Name</Label>
            <Input
              id="source-name"
              placeholder="e.g. Salary"
              autoFocus
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="source-kind">Type</Label>
            <Select id="source-kind" {...form.register("kind")}>
              {sourceKinds.map((k) => (
                <option key={k} value={k}>
                  {kindLabels[k]}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {accentColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => form.setValue("color", c, { shouldDirty: true })}
                  className={cn(
                    "size-7 rounded-full transition-all",
                    accentStyles[c].solid,
                    color === c
                      ? "ring-2 ring-white/70 ring-offset-2 ring-offset-popover"
                      : "opacity-60 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </div>
          <ErrorLine message={serverError} />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Create source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: FinanceSettingsRow | null;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const form = useForm<FinanceSettingsInput>({
    resolver: zodResolver(financeSettingsInputSchema),
    defaultValues: { current_balance: "", monthly_income_goal: "", savings_goal: "" },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        current_balance: settings?.current_balance ?? "",
        monthly_income_goal: settings?.monthly_income_goal ?? "",
        savings_goal: settings?.savings_goal ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, settings]);

  const onSubmit = async (values: FinanceSettingsInput) => {
    setServerError(null);
    const result = await updateFinanceSettings(values);
    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Finance settings</DialogTitle>
          <DialogDescription>
            High-level numbers for the dashboard — this is visibility, not
            accounting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fin-balance">Current balance (₹)</Label>
            <Input
              id="fin-balance"
              type="number"
              step="any"
              min={0}
              placeholder="280000"
              {...form.register("current_balance")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fin-goal">Monthly income goal (₹)</Label>
            <Input
              id="fin-goal"
              type="number"
              step="any"
              min={0}
              placeholder="200000"
              {...form.register("monthly_income_goal")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fin-savings">Savings goal (₹)</Label>
            <Input
              id="fin-savings"
              type="number"
              step="any"
              min={0}
              placeholder="1000000"
              {...form.register("savings_goal")}
            />
          </div>
          <ErrorLine message={serverError} />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Save settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
