"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function disconnectGitHub(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("provider", "github");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/github");
  revalidatePath("/dashboard");
  return { ok: true };
}
