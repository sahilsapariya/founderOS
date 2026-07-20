import { AppShell } from "@/components/layout/app-shell";
import { getInitials } from "@/lib/format";
import type { ProjectRef, SessionUser } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessionUser: SessionUser = {
    name: "Founder",
    firstName: "Founder",
    email: "",
    avatarUrl: null,
    initials: "F",
    plan: "free",
  };
  let projectRefs: ProjectRef[] = [];

  if (user) {
    const [{ data: profile }, { data: projects }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, email, avatar_url, plan")
        .eq("id", user.id)
        .single(),
      supabase
        .from("projects")
        .select("id, name, color")
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const name =
      profile?.full_name || user.email?.split("@")[0] || "Founder";

    sessionUser = {
      name,
      firstName: name.split(/\s+/)[0] ?? name,
      email: profile?.email ?? user.email ?? "",
      avatarUrl: profile?.avatar_url ?? null,
      initials: getInitials(name),
      plan: profile?.plan ?? "free",
    };
    projectRefs = projects ?? [];
  }

  return (
    <AppShell user={sessionUser} projects={projectRefs}>
      {children}
    </AppShell>
  );
}
