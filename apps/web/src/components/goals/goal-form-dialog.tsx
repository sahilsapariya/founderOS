"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { Database } from "@/lib/database.types";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import {
  accentColors,
  goalCategories,
  goalInputSchema,
  type GoalInput,
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
import { goalCategoryMeta } from "./goal-meta";

type GoalRow = Database["public"]["Tables"]["goals"]["Row"];

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: GoalRow | null;
}

export function GoalFormDialog({ open, onOpenChange, goal }: GoalFormDialogProps) {
  const isEdit = Boolean(goal);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalInputSchema),
    defaultValues: {
      title: "",
      category: "personal",
      color: "indigo",
      target_value: 100,
      current_value: 0,
      unit: "%",
      due_date: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        title: goal?.title ?? "",
        category: (goal?.category as GoalInput["category"]) ?? "personal",
        color: (goal?.color as GoalInput["color"]) ?? "indigo",
        target_value: Number(goal?.target_value ?? 100),
        current_value: Number(goal?.current_value ?? 0),
        unit: goal?.unit ?? "%",
        due_date: goal?.due_date ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, goal]);

  const color = form.watch("color");

  const onSubmit = async (values: GoalInput) => {
    setServerError(null);
    const result = goal
      ? await updateGoal(goal.id, values)
      : await createGoal(values);

    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
          <DialogDescription>
            Set a target and update progress as you go. Use % for milestone-style
            goals, or a number with a unit (₹, km, books…).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              placeholder="e.g. Build FounderOS MVP"
              autoFocus
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-category">Category</Label>
              <Select id="goal-category" {...form.register("category")}>
                {goalCategories.map((c) => (
                  <option key={c} value={c}>
                    {goalCategoryMeta[c].label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-due">Due date</Label>
              <Input id="goal-due" type="date" {...form.register("due_date")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-current">Current</Label>
              <Input
                id="goal-current"
                type="number"
                step="any"
                min={0}
                {...form.register("current_value")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-target">Target</Label>
              <Input
                id="goal-target"
                type="number"
                step="any"
                min={0}
                {...form.register("target_value")}
              />
              {form.formState.errors.target_value && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.target_value.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-unit">Unit</Label>
              <Input id="goal-unit" placeholder="%, ₹, km…" {...form.register("unit")} />
            </div>
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

          {serverError && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {serverError}
            </p>
          )}

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
              {isEdit ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
