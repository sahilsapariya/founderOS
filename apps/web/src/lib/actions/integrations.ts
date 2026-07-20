"use server";

import { revalidatePath } from "next/cache";

import { verifyGitHubToken } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

/** Guaranteed connect path: validate and store a personal access token. */
export async function connectGitHubWithToken(token: string): Promise<ActionResult> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Paste a token first." };
  if (trimmed.length > 400) return { ok: false, error: "That doesn't look like a token." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const profile = await verifyGitHubToken(trimmed);
  if (!profile) {
    return {
      ok: false,
      error:
        "GitHub rejected that token. Make sure it has read access to your repositories and profile.",
    };
  }

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      provider: "github",
      status: "connected",
      account_label: profile.login,
      credentials: { access_token: trimmed },
    },
    { onConflict: "user_id,provider" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/github");
  revalidatePath("/dashboard");
  return { ok: true };
}

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
