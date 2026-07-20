"use client";

import * as React from "react";
import { Github, Loader2, Unplug } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { disconnectGitHub } from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

async function startGitHubOAuth(): Promise<string | null> {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=/github`;

  // Link GitHub to the current account; if the identity is already linked
  // (e.g. the user signed in with GitHub), re-auth to refresh the token.
  const { error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: { redirectTo },
  });
  if (!error) return null;

  const { error: signInError } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });
  return signInError ? signInError.message : null;
}

export function ConnectGitHubCard({ reconnect = false }: { reconnect?: boolean }) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const connect = async () => {
    setPending(true);
    setError(null);
    const message = await startGitHubOAuth();
    if (message) {
      setError(message);
      setPending(false);
    }
  };

  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-border bg-secondary/60">
        <Github className="size-6 text-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        {reconnect ? "Reconnect GitHub" : "Connect GitHub"}
      </h2>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {reconnect
          ? "Your GitHub token expired or was revoked. Reconnect to keep repos and activity flowing."
          : "See your repositories, commits, and pull requests inside FounderOS. You'll approve access on GitHub — one click."}
      </p>
      {error && (
        <p className="mt-3 max-w-sm rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <Button className="mt-5" size="sm" onClick={connect} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
        {reconnect ? "Reconnect" : "Connect GitHub"}
      </Button>
    </Card>
  );
}

export function DisconnectGitHubButton() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
        <Unplug className="size-3.5" />
        Disconnect
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Disconnect GitHub?"
        description="FounderOS forgets the stored access token. You can reconnect anytime."
        confirmLabel="Disconnect"
        onConfirm={async () => {
          await disconnectGitHub();
        }}
      />
    </>
  );
}
