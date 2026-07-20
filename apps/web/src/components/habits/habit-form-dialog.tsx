"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { accentStyles } from "@/lib/colors";
import type { Database } from "@/lib/database.types";
import { createHabit, updateHabit } from "@/lib/actions/habits";
import {
  accentColors,
  habitIcons,
  habitInputSchema,
  type HabitInput,
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
import { habitIconMap } from "./habit-icons";

type HabitRow = Database["public"]["Tables"]["habits"]["Row"];

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: HabitRow | null;
}

export function HabitFormDialog({ open, onOpenChange, habit }: HabitFormDialogProps) {
  const isEdit = Boolean(habit);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<HabitInput>({
    resolver: zodResolver(habitInputSchema),
    defaultValues: { name: "", icon: "flame", color: "indigo", target_per_week: 7 },
  });

  React.useEffect(() => {
    if (open) {
      setServerError(null);
      form.reset({
        name: habit?.name ?? "",
        icon: (habit?.icon as HabitInput["icon"]) ?? "flame",
        color: (habit?.color as HabitInput["color"]) ?? "indigo",
        target_per_week: habit?.target_per_week ?? 7,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, habit]);

  const icon = form.watch("icon");
  const color = form.watch("color");

  const onSubmit = async (values: HabitInput) => {
    setServerError(null);
    const result = habit
      ? await updateHabit(habit.id, values)
      : await createHabit(values);

    if (result.ok) onOpenChange(false);
    else setServerError(result.error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            Small daily actions compound. Tap a habit each day you complete it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Morning run"
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
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {habitIcons.map((name) => {
                const Icon = habitIconMap[name];
                return (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    onClick={() => form.setValue("icon", name, { shouldDirty: true })}
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border transition-all",
                      icon === name
                        ? "border-primary/60 bg-primary/15 text-[#a5b4fc]"
                        : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {accentColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => form.setValue("color", c, { shouldDirty: true })}
                    className={cn(
                      "size-6 rounded-full transition-all",
                      accentStyles[c].solid,
                      color === c
                        ? "ring-2 ring-white/70 ring-offset-2 ring-offset-popover"
                        : "opacity-60 hover:opacity-100",
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-target">Days per week</Label>
              <Select id="habit-target" {...form.register("target_per_week")}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "day" : "days"}
                  </option>
                ))}
              </Select>
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
              {isEdit ? "Save changes" : "Create habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
