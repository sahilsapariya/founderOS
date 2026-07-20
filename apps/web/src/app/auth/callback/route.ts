import { NextResponse } from "next/server";

import { verifyGitHubToken } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback — exchanges the provider code for a Supabase session.
 * When the completed flow carries a GitHub provider token (sign-in or
 * identity linking), it is captured into the integrations table. Every
 * branch is logged and surfaced via a `connect` query param so failures
 * are visible instead of silent.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectWith = (connect: string) => {
    const url = new URL(next, origin);
    url.searchParams.set("connect", connect);
    return NextResponse.redirect(url.toString());
  };

  if (!code) {
    console.log("[auth/callback] no code in URL");
    return NextResponse.redirect(
      `${origin}/login?error=Could not sign you in. Please try again.`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.log("[auth/callback] exchange failed:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  const providerToken = data.session?.provider_token;
  console.log(
    "[auth/callback] exchange ok. provider_token present:",
    Boolean(providerToken),
  );

  if (!providerToken) {
    // Normal for Google sign-ins; a failure signal only for GitHub connects.
    return next.startsWith("/github")
      ? redirectWith("missing_token")
      : NextResponse.redirect(`${origin}${next}`);
  }

  const ghProfile = await verifyGitHubToken(providerToken);
  if (!ghProfile) {
    console.log("[auth/callback] token probe failed (not a GitHub token or API unreachable)");
    return next.startsWith("/github")
      ? redirectWith("probe_failed")
      : NextResponse.redirect(`${origin}${next}`);
  }

  const { error: upsertError } = await supabase.from("integrations").upsert(
    {
      user_id: data.session.user.id,
      provider: "github",
      status: "connected",
      account_label: ghProfile.login,
      credentials: { access_token: providerToken },
    },
    { onConflict: "user_id,provider" },
  );

  if (upsertError) {
    console.log("[auth/callback] integration upsert failed:", upsertError.message);
    return redirectWith(`store_failed:${upsertError.message.slice(0, 80)}`);
  }

  console.log("[auth/callback] github integration stored for", ghProfile.login);
  return next.startsWith("/github")
    ? redirectWith("ok")
    : NextResponse.redirect(`${origin}${next}`);
}
