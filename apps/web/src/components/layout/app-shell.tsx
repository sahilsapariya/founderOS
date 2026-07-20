"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { ProjectRef, SessionUser } from "@/lib/db-types";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPalette } from "./command-palette";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({
  user,
  projects,
  children,
}: {
  user: SessionUser;
  projects: ProjectRef[];
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/ai");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <TopBar user={user} onOpenPalette={() => setPaletteOpen(true)} />
            <div className="mx-auto w-full max-w-[1560px] px-7 pb-10">
              {children}
            </div>
          </main>
        </div>
        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          projects={projects}
        />
      </div>
    </TooltipProvider>
  );
}
