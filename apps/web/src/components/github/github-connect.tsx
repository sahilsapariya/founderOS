"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Github, KeyRound, Loader2, Unplug } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { connectGitHubWithToken, disconnectGitHub } from "@/lib/actions/integrations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

const connectMessages: Record<string, string> = {
  missing_token:
    "The sign-in completed, but GitHub's access token wasn't returned by the auth provider. Use a personal access token below — it connects instantly.",
  probe_failed:
    "A token came back but GitHub rejected it. Try again, or use a personal access token below.",
};

async function startGitHubOAuth(): Promise<string | null> {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback?next=/github`;

  // Link GitHub to the current account; if the identity is already linked
  // (e.g. the user signed in with GitHub before), re-auth to get a fresh token.
  const { error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: { redirectTo },
  });
  if (!error) return null;
  console.log("[github-connect] linkIdentity:", error.message);

  const { error: signInError } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo },
  });
  return signInError ? signInError.message : null;
}

export function ConnectGitHubCard({ reconnect = false }: { reconnect?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const connectParam = searchParams.get("connect");

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pat, setPat] = React.useState("");
  const [patPending, setPatPending] = React.useState(false);
  const [patError, setPatError] = React.useState<string | null>(null);

  const callbackMessage = connectParam
    ? (connectMessages[connectParam] ??
      (connectParam.startsWith("store_failed")
        ? `Storing the connection failed: ${connectParam.split(":")[1] ?? "unknown error"}`
        : null))
    : null;

  const connect = async () => {
    setPending(true);
    setError(null);
    const message = await startGitHubOAuth();
    if (message) {
      setError(message);
      setPending(false);
    }
  };

  const connectWithPat = async () => {
    setPatPending(true);
    setPatError(null);
    const result = await connectGitHubWithToken(pat);
    setPatPending(false);
    if (result.ok) {
      router.replace("/github");
      router.refresh();
    } else {
      setPatError(result.error);
    }
  };

  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl border border-border bg-secondary/60">
        <Github className="size-6 text-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        {reconnect ? "Reconnect GitHub" : "Connect GitHub"}
      </h2>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {reconnect
          ? "Your stored GitHub token stopped working. Reconnect to keep repos and activity flowing."
          : "See your repositories, commits, and pull requests inside FounderOS."}
      </p>

      {callbackMessage && (
        <div className="mt-4 flex max-w-md items-start gap-2.5 rounded-lg border border-warning/25 bg-warning/8 px-3.5 py-2.5 text-left">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-[12.5px] leading-relaxed text-secondary-foreground">
            {callbackMessage}
          </p>
        </div>
      )}
      {error && (
        <p className="mt-3 max-w-sm rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <Button className="mt-5" size="sm" onClick={connect} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
        {reconnect ? "Reconnect with OAuth" : "Connect with GitHub"}
      </Button>

      {/* Guaranteed path: personal access token */}
      <div className="mt-8 w-full max-w-md border-t border-border pt-6">
        <div className="flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-secondary-foreground">
          <KeyRound className="size-3.5 text-[#a5b4fc]" />
          Or connect with a personal access token
        </div>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-subtle-foreground">
          Create one at{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=FounderOS"
            target="_blank"
            rel="noreferrer"
            className="text-[#a5b4fc] hover:underline"
          >
            github.com/settings/tokens
          </a>{" "}
          with <code className="rounded bg-secondary px-1 text-[10.5px]">repo</code> and{" "}
          <code className="rounded bg-secondary px-1 text-[10.5px]">read:user</code>{" "}
          scopes, then paste it here. It is stored privately for your account only.
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            value={pat}
            onChange={(e) => setPat(e.target.value)}
            type="password"
            placeholder="ghp_… or github_pat_…"
            className="font-mono text-[12.5px]"
          />
          <Button
            size="sm"
            variant="secondary"
            className="h-9 shrink-0"
            onClick={connectWithPat}
            disabled={patPending || !pat.trim()}
          >
            {patPending ? <Loader2 className="size-3.5 animate-spin" /> : "Connect"}
          </Button>
        </div>
        {patError && (
          <p className="mt-2 text-left text-xs text-destructive">{patError}</p>
        )}
      </div>
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
