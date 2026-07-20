import { NextResponse } from "next/server";

import { verifyGitHubToken } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback — exchanges the provider code for a Supabase session.
 * When the completed flow is GitHub (sign-in or identity linking), the
 * short-lived provider token is captured into the integrations table so the
 * GitHub module can read repos and activity.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const providerToken = data.session?.provider_token;
      if (providerToken) {
        // Identify the token by probing; only GitHub tokens pass this check.
        const ghProfile = await verifyGitHubToken(providerToken);
        if (ghProfile && data.session?.user) {
          await supabase.from("integrations").upsert(
            {
              user_id: data.session.user.id,
              provider: "github",
              status: "connected",
              account_label: ghProfile.login,
              credentials: { access_token: providerToken },
            },
            { onConflict: "user_id,provider" },
          );
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not sign you in. Please try again.`,
  );
}
