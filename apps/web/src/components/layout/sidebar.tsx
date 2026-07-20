"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings, Sparkles, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/db-types";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";
import { mainNav, quickActions } from "./nav-config";

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <Link href="/dashboard" className="block w-fit rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <Logo />
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2 scrollbar-none">
        {mainNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium transition-all duration-150",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.14)_inset,0_6px_20px_-6px_var(--primary-glow)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "size-[17px] transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-subtle-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}

        {/* Quick actions */}
        <div className="mt-5 mb-1.5 flex items-center gap-2 px-3">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] text-subtle-foreground">
            QUICK ACTIONS
          </span>
          <div className="h-px flex-1 bg-sidebar-border" />
        </div>
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex h-8.5 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <action.icon className="size-4 text-subtle-foreground transition-colors group-hover:text-foreground" />
            {action.label}
            <kbd className="ml-auto rounded border border-border bg-secondary px-1.5 py-px font-sans text-[10px] font-medium text-subtle-foreground">
              {action.shortcut}
            </kbd>
          </Link>
        ))}
      </nav>

      {/* Profile */}
      <div className="border-t border-sidebar-border px-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <Avatar className="size-8">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                )}
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-[11.5px] text-subtle-foreground">
                  {user.email}
                </span>
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-subtle-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={signOut}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Plan card */}
        <div className="mt-2 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/12 to-[#8b5cf6]/8 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#a5b4fc]" />
            <span className="text-[13px] font-semibold text-gradient-primary capitalize">
              {user.plan} Plan
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-subtle-foreground">
            FounderOS early access
          </p>
        </div>
      </div>
    </aside>
  );
}
