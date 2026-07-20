"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import {
  financeSettingsInputSchema,
  incomeEntryInputSchema,
  incomeSourceInputSchema,
} from "@/lib/validators";

type ActionResult = { ok: true } | { ok: false; error: string };

const fail = (error: string): ActionResult => ({ ok: false, error });

function revalidate() {
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

export async function createIncomeSource(input: unknown): Promise<ActionResult> {
  const parsed = incomeSourceInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid source");

  const supabase = await createClient();
  const { error } = await supabase.from("income_sources").insert(parsed.data);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function logIncome(input: unknown): Promise<ActionResult> {
  const parsed = incomeEntryInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid entry");

  const supabase = await createClient();
  const { source_id, amount, received_on, note } = parsed.data;

  const { error } = await supabase.from("income_entries").insert({
    source_id,
    amount,
    received_on,
    note: note || null,
  });
  if (error) return fail(error.message);

  await supabase.from("activity_log").insert({
    kind: "income_logged",
    title: "Income logged",
    meta: { detail: formatINR(amount) },
  });

  revalidate();
  return { ok: true };
}

export async function deleteIncomeEntry(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("income_entries").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}

export async function updateFinanceSettings(input: unknown): Promise<ActionResult> {
  const parsed = financeSettingsInputSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid settings");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not signed in");

  const { current_balance, monthly_income_goal, savings_goal } = parsed.data;

  const { error } = await supabase.from("finance_settings").upsert({
    user_id: user.id,
    current_balance: current_balance === "" ? null : current_balance,
    monthly_income_goal: monthly_income_goal === "" ? null : monthly_income_goal,
    savings_goal: savings_goal === "" ? null : savings_goal,
  });
  if (error) return fail(error.message);

  revalidate();
  return { ok: true };
}
