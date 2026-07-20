/** Server-only GitHub REST helpers — never import from client components. */

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  private: boolean;
}

export interface GitHubEventItem {
  id: string;
  type: "push" | "pr-open" | "pr-merge" | "create";
  action: string;
  repo: string;
  url: string;
  when: string;
}

async function ghFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(5000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function verifyGitHubToken(token: string): Promise<GitHubProfile | null> {
  try {
    return await ghFetch<GitHubProfile>("/user", token);
  } catch {
    return null;
  }
}

interface RawEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    number?: number;
    commits?: unknown[];
    ref?: string;
    ref_type?: string;
    pull_request?: { merged?: boolean; html_url?: string };
  };
}

function mapEvents(rawEvents: RawEvent[], limit = 8): GitHubEventItem[] {
  const events: GitHubEventItem[] = [];
  for (const event of rawEvents) {
    if (events.length >= limit) break;
    const repo = event.repo.name.split("/").pop() ?? event.repo.name;
    const when = event.created_at;

    if (event.type === "PushEvent") {
      const n = event.payload.commits?.length ?? 0;
      const branch = event.payload.ref?.replace("refs/heads/", "") ?? "";
      events.push({
        id: event.id,
        type: "push",
        action: `Pushed ${n} commit${n === 1 ? "" : "s"} to ${branch}`,
        repo,
        url: `https://github.com/${event.repo.name}`,
        when,
      });
    } else if (event.type === "PullRequestEvent") {
      const merged = event.payload.pull_request?.merged;
      const action =
        event.payload.action === "closed"
          ? merged
            ? `Merged PR #${event.payload.number}`
            : `Closed PR #${event.payload.number}`
          : `Opened PR #${event.payload.number}`;
      events.push({
        id: event.id,
        type: merged ? "pr-merge" : "pr-open",
        action,
        repo,
        url: event.payload.pull_request?.html_url ?? `https://github.com/${event.repo.name}`,
        when,
      });
    } else if (event.type === "CreateEvent" && event.payload.ref_type === "repository") {
      events.push({
        id: event.id,
        type: "create",
        action: "Created repository",
        repo,
        url: `https://github.com/${event.repo.name}`,
        when,
      });
    }
  }

  return events;
}

export async function getGitHubOverview(token: string): Promise<{
  profile: GitHubProfile;
  repos: GitHubRepo[];
  events: GitHubEventItem[];
}> {
  const profile = await ghFetch<GitHubProfile>("/user", token);
  const [repos, rawEvents] = await Promise.all([
    ghFetch<GitHubRepo[]>("/user/repos?sort=pushed&per_page=6", token),
    ghFetch<RawEvent[]>(`/users/${profile.login}/events?per_page=30`, token),
  ]);

  return { profile, repos, events: mapEvents(rawEvents) };
}

/** Lightweight events-only fetch for the dashboard widget (single API call). */
export async function getGitHubEvents(
  token: string,
  login: string,
  limit = 4,
): Promise<GitHubEventItem[]> {
  const rawEvents = await ghFetch<RawEvent[]>(
    `/users/${login}/events?per_page=30`,
    token,
  );
  return mapEvents(rawEvents, limit);
}
