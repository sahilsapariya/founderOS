import type { Metadata } from "next";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ExternalLink,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequestArrow,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getGitHubOverview, type GitHubEventItem } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ConnectGitHubCard,
  DisconnectGitHubButton,
} from "@/components/github/github-connect";

export const metadata: Metadata = { title: "GitHub" };

const eventIcon: Record<
  GitHubEventItem["type"],
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  push: { icon: GitCommitHorizontal, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  "pr-open": { icon: GitPullRequestArrow, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
  "pr-merge": { icon: GitMerge, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
  create: { icon: Sparkles, className: "bg-[#fbbf24]/12 text-[#fcd34d]" },
};

export default async function GitHubPage() {
  const supabase = await createClient();
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("provider", "github")
    .maybeSingle();

  const token = (integration?.credentials as { access_token?: string } | null)
    ?.access_token;

  if (!integration || !token) {
    return <ConnectGitHubCard />;
  }

  let overview: Awaited<ReturnType<typeof getGitHubOverview>>;
  try {
    overview = await getGitHubOverview(token);
  } catch {
    return <ConnectGitHubCard reconnect />;
  }

  const { profile, repos, events } = overview;

  return (
    <div className="flex flex-col gap-5">
      {/* Account header */}
      <Card className="flex flex-wrap items-center gap-4 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar_url}
          alt={profile.login}
          className="size-11 rounded-full border border-border"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold tracking-tight">
            {profile.name ?? profile.login}
          </p>
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-primary"
          >
            @{profile.login}
            <ExternalLink className="size-3" />
          </a>
        </div>
        <Badge variant="success">Connected</Badge>
        <DisconnectGitHubButton />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Repositories */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Recently Pushed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[13.5px] font-medium">
                      {repo.name}
                      {repo.private && (
                        <Lock className="size-3 shrink-0 text-subtle-foreground" />
                      )}
                    </p>
                    {repo.description && (
                      <p className="truncate text-[11.5px] text-subtle-foreground">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.language && (
                    <span className="shrink-0 text-[11.5px] text-muted-foreground">
                      {repo.language}
                    </span>
                  )}
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[11.5px] text-subtle-foreground">
                    <Star className="size-3" />
                    {repo.stargazers_count}
                  </span>
                  <span className="w-14 shrink-0 text-right text-[11.5px] text-subtle-foreground">
                    {formatDistanceToNowStrict(new Date(repo.pushed_at))}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtle-foreground">
                No recent activity found.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {events.map((event) => {
                  const meta = eventIcon[event.type];
                  return (
                    <a
                      key={event.id}
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full",
                          meta.className,
                        )}
                      >
                        <meta.icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{event.action}</p>
                        <p className="truncate text-[11.5px] text-subtle-foreground">
                          {event.repo}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11.5px] text-subtle-foreground">
                        {formatDistanceToNowStrict(new Date(event.when))} ago
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
