import type {
  ActivityItem,
  AISuggestion,
  CalendarEvent,
  FocusTask,
  GitHubEvent,
  Goal,
  Habit,
  IncomeSource,
  MonthlyIncomePoint,
  Project,
} from "./types";

/**
 * Mock data powering the dashboard until Supabase + integrations land
 * (see docs/09-roadmap.md). Keep shapes aligned with src/lib/types.ts.
 */

export const currentUser = {
  name: "Sahil",
  fullName: "Sahil Sapariya",
  email: "sahil@example.com",
  plan: "Pro",
  planRenews: "Aug 16, 2026",
  initials: "SS",
};

export const briefStats = {
  priorities: 3,
  meetings: 2,
  deadlines: 1,
  recommendation:
    "Focus on completing the API integration for the Elite Mode project.",
  summary:
    "You have 3 high priority tasks, 2 meetings, and 1 deadline approaching today.",
};

export const focusTasks: FocusTask[] = [
  {
    id: "t1",
    title: "Finish Stripe integration",
    project: "Elite Mode",
    priority: "high",
    time: "10:00 AM",
    bucket: "high-priority",
  },
  {
    id: "t2",
    title: "Design database schema",
    project: "FounderOS",
    priority: "medium",
    time: "12:30 PM",
    bucket: "high-priority",
  },
  {
    id: "t3",
    title: "Review PR #42",
    project: "Account-Verse",
    priority: "high",
    time: "2:00 PM",
    bucket: "high-priority",
  },
  {
    id: "t4",
    title: "Update landing page copy",
    project: "Elite Mode",
    priority: "low",
    time: "4:30 PM",
    bucket: "high-priority",
  },
  {
    id: "t5",
    title: "Weekly planning",
    project: "Personal",
    priority: "low",
    time: "6:00 PM",
    bucket: "high-priority",
  },
  {
    id: "t6",
    title: "Send invoice to Client A",
    project: "Freelance",
    priority: "high",
    time: "5:00 PM",
    bucket: "due-today",
  },
  {
    id: "t7",
    title: "Prepare sprint demo",
    project: "FounderOS",
    priority: "medium",
    time: "6:30 PM",
    bucket: "due-today",
  },
  {
    id: "t8",
    title: "Fix onboarding bug",
    project: "Eventix",
    priority: "critical",
    time: "2 days late",
    bucket: "overdue",
  },
  {
    id: "t9",
    title: "Reply to investor email",
    project: "FounderOS",
    priority: "high",
    time: "1 day late",
    bucket: "overdue",
  },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "e1", title: "Team Standup", start: "10:00 AM", durationLabel: "30m", color: "indigo" },
  { id: "e2", title: "Client Call — Elite Mode", start: "11:30 AM", durationLabel: "1h", color: "sky" },
  { id: "e3", title: "Focus Time", start: "1:00 PM", durationLabel: "2h", color: "violet" },
  { id: "e4", title: "Review Sprint Progress", start: "3:30 PM", durationLabel: "45m", color: "emerald" },
  { id: "e5", title: "Gym", start: "5:00 PM", durationLabel: "1h", color: "amber" },
];

export const projects: Project[] = [
  { id: "p1", name: "FounderOS", status: "active", progress: 65, color: "indigo", initial: "F" },
  { id: "p2", name: "Elite Mode", status: "active", progress: 80, color: "amber", initial: "E", glyph: "crown" },
  { id: "p3", name: "Account-Verse", status: "active", progress: 45, color: "violet", initial: "A" },
  { id: "p4", name: "Eventix", status: "planning", progress: 20, color: "emerald", initial: "E" },
  { id: "p5", name: "Email Service", status: "planning", progress: 10, color: "slate", initial: "M", glyph: "mail" },
];

export const finance = {
  monthlyIncome: 125000,
  monthlyIncomeDelta: 12.5,
  currentBalance: 280000,
  currentBalanceDelta: 8.3,
  incomeGoal: 200000,
  incomeGoalProgress: 62,
};

export const monthlyIncomeSeries: MonthlyIncomePoint[] = [
  { month: "Jan", income: 98000 },
  { month: "Feb", income: 86000 },
  { month: "Mar", income: 104000 },
  { month: "Apr", income: 92000 },
  { month: "May", income: 112000 },
  { month: "Jun", income: 132000 },
  { month: "Jul", income: 125000 },
];

export const incomeSources: IncomeSource[] = [
  { name: "Salary", amount: 80000, share: 64, color: "var(--chart-1)" },
  { name: "Freelancing", amount: 30000, share: 24, color: "var(--chart-5)" },
  { name: "SaaS Revenue", amount: 10000, share: 8, color: "var(--chart-3)" },
  { name: "Investments", amount: 5000, share: 4, color: "var(--chart-4)" },
];

export const goals: Goal[] = [
  {
    id: "g1",
    title: "Build FounderOS MVP",
    progress: 65,
    due: "Aug 31, 2026",
    icon: "trophy",
    color: "indigo",
  },
  {
    id: "g2",
    title: "Run Half Marathon",
    progress: 40,
    due: "Feb 1, 2027",
    icon: "activity",
    color: "emerald",
  },
  {
    id: "g3",
    title: "Save ₹10,00,000",
    progress: 28,
    due: "Dec 31, 2026",
    icon: "piggy-bank",
    color: "amber",
  },
];

export const habits: Habit[] = [
  { id: "h1", name: "Run", streak: 7, completion: 70, color: "#fb923c", icon: "flame" },
  { id: "h2", name: "Workout", streak: 5, completion: 62, color: "#34d399", icon: "dumbbell" },
  { id: "h3", name: "Read", streak: 6, completion: 84, color: "#38bdf8", icon: "book-open" },
  { id: "h4", name: "Meditate", streak: 4, completion: 55, color: "#a78bfa", icon: "brain" },
  { id: "h5", name: "No Smoke", streak: 3, completion: 42, color: "#4ade80", icon: "shield-check" },
];

export const githubEvents: GitHubEvent[] = [
  { id: "gh1", action: "Pushed to main", repo: "FounderOS", when: "2h ago", type: "push" },
  { id: "gh2", action: "Opened PR #42", repo: "Account-Verse", when: "5h ago", type: "pr-open" },
  { id: "gh3", action: "Merged PR #41", repo: "Elite Mode", when: "1d ago", type: "pr-merge" },
  { id: "gh4", action: "Pushed to develop", repo: "Eventix", when: "1d ago", type: "push" },
];

export const recentNotes = [
  { id: "n1", title: "Project Ideas", when: "Today", kind: "idea" },
  { id: "n2", title: "Meeting with Client — Elite Mode", when: "Yesterday", kind: "meeting" },
  { id: "n3", title: "Database Schema Thoughts", when: "Jul 18", kind: "technical" },
  { id: "n4", title: "FounderOS Feature List", when: "Jul 17", kind: "list" },
] satisfies import("./types").Note[];

export const aiSuggestions: AISuggestion[] = [
  {
    id: "s1",
    text: "You usually do deep work between 10 AM – 1 PM. Block this time for important tasks.",
    icon: "clock",
  },
  {
    id: "s2",
    text: "Elite Mode project is 15% behind schedule. Consider reprioritizing tasks.",
    icon: "trending-up",
  },
  {
    id: "s3",
    text: "You have 2 tasks that are blocked. Would you like help unblocking them?",
    icon: "lock",
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "a1",
    title: "Payment received from Client A",
    meta: "₹25,000",
    when: "2h ago",
    icon: "banknote",
    color: "emerald",
  },
  {
    id: "a2",
    title: "Task completed: Fix login bug",
    meta: "Elite Mode",
    when: "4h ago",
    icon: "check-circle",
    color: "violet",
  },
  {
    id: "a3",
    title: "New commit to FounderOS",
    meta: "",
    when: "8h ago",
    icon: "git-commit",
    color: "sky",
  },
  {
    id: "a4",
    title: "Goal progress updated",
    meta: "Save ₹10,00,000",
    when: "1d ago",
    icon: "target",
    color: "amber",
  },
];

export const notificationCount = 3;
