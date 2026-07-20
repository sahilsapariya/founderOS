import {
  Bot,
  Calendar,
  CircleCheckBig,
  FileText,
  FolderKanban,
  Github,
  IndianRupee,
  LayoutDashboard,
  Repeat2,
  Settings,
  Sparkles,
  Target,
  Wallet,
  FilePlus2,
  FolderPlus,
  SquarePen,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CircleCheckBig },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "GitHub", href: "/github", icon: Github },
  { label: "Habits", href: "/habits", icon: Repeat2 },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "AI", href: "/ai", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

export interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

export const quickActions: QuickAction[] = [
  { label: "New Task", href: "/tasks", icon: SquarePen, shortcut: "⌘T" },
  { label: "New Project", href: "/projects", icon: FolderPlus, shortcut: "⌘P" },
  { label: "New Note", href: "/notes", icon: FilePlus2, shortcut: "⌘N" },
  { label: "Log Income", href: "/finance", icon: IndianRupee, shortcut: "⌘I" },
  { label: "AI Assistant", href: "/ai", icon: Sparkles, shortcut: "⌘J" },
];

export const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/projects": { title: "Projects", subtitle: "Plan, track, and ship every project." },
  "/tasks": { title: "Tasks", subtitle: "Everything on your plate, organized." },
  "/calendar": { title: "Calendar", subtitle: "Meetings, deadlines, and focus time." },
  "/finance": { title: "Finance", subtitle: "Income, balance, and goals at a glance." },
  "/goals": { title: "Goals", subtitle: "Track progress toward what matters." },
  "/github": { title: "GitHub", subtitle: "Commits, pull requests, and repo activity." },
  "/habits": { title: "Habits", subtitle: "Build streaks that compound." },
  "/notes": { title: "Notes", subtitle: "Capture ideas, meetings, and decisions." },
  "/ai": { title: "AI Assistant", subtitle: "Your chief of staff, always on." },
  "/settings": { title: "Settings", subtitle: "Profile, appearance, and integrations." },
};
