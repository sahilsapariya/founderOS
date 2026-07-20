"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  FilePlus2,
  FolderPlus,
  IndianRupee,
  Moon,
  Plus,
  RefreshCw,
  Search,
  SquarePen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser, notificationCount } from "@/lib/mock-data";
import { timeBasedGreeting } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { pageMeta } from "./nav-config";

const notifications = [
  { id: 1, text: "Payment of ₹25,000 received from Client A", when: "2h ago" },
  { id: 2, text: "PR #42 is ready for your review", when: "5h ago" },
  { id: 3, text: "“Finish Stripe integration” is due at 10:00 AM", when: "6h ago" },
];

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [spinning, setSpinning] = React.useState(false);

  const isDashboard = pathname.startsWith("/dashboard");
  const meta = pageMeta[Object.keys(pageMeta).find((p) => pathname.startsWith(p)) ?? ""];

  const refresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 700);
  };

  return (
    <header className="flex flex-wrap items-center gap-4 px-7 pt-6 pb-5">
      {/* Page title / greeting */}
      <div className="min-w-0 flex-1">
        {isDashboard ? (
          <>
            <h1
              className="truncate text-[25px] font-semibold tracking-tight"
              suppressHydrationWarning
            >
              {timeBasedGreeting()}, {currentUser.name}{" "}
              <span className="inline-block origin-[70%_70%] hover:animate-[wave_0.6s_ease]">
                👋
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Focus on what matters. Ship amazing things today.
            </p>
          </>
        ) : (
          <>
            <h1 className="truncate text-[25px] font-semibold tracking-tight">
              {meta?.title ?? "FounderOS"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta?.subtitle}</p>
          </>
        )}
      </div>

      {/* Search */}
      <button
        onClick={onOpenPalette}
        className={cn(
          "hidden h-9 w-72 items-center gap-2.5 rounded-full border border-border bg-secondary/60 px-4 text-[13px] text-subtle-foreground transition-colors lg:flex",
          "hover:border-border-strong hover:bg-secondary hover:text-muted-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search anything...</span>
        <kbd className="rounded border border-border bg-card px-1.5 py-px text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="rounded-lg">
              <Plus className="size-4.5" />
              <span className="sr-only">Create new</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => router.push("/tasks")}>
              <SquarePen /> New Task
              <DropdownMenuShortcut>⌘T</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/projects")}>
              <FolderPlus /> New Project
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/notes")}>
              <FilePlus2 /> New Note
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/finance")}>
              <IndianRupee /> Log Income
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-lg">
              <Bell className="size-4.5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[9.5px] font-semibold text-white ring-2 ring-background">
                  {notificationCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="items-start py-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="flex-1 text-[13px] leading-snug">{n.text}</span>
                <span className="shrink-0 text-[11px] text-subtle-foreground">{n.when}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <Moon className="size-4.5" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Light theme — coming soon</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={refresh}>
              <RefreshCw className={cn("size-4.5", spinning && "animate-spin")} />
              <span className="sr-only">Refresh</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh data</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
