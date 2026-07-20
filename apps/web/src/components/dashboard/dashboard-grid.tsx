import type { Database } from "@/lib/database.types";
import type { ProjectRef, ProjectRow, TaskRow } from "@/lib/db-types";
import type { BriefStats, Suggestion } from "@/lib/insights";
import type {
  FinanceSettingsRow,
  IncomeEntryRow,
  IncomeSourceRow,
} from "@/lib/finance-utils";

import { ActivityFeed } from "./activity-feed";
import { AIDailyBrief } from "./ai-daily-brief";
import { AISuggestions } from "./ai-suggestions";
import { CalendarWidget } from "./calendar-widget";
import { FinanceSummary } from "./finance-summary";
import { GitHubActivity } from "./github-activity";
import { GoalsWidget } from "./goals-widget";
import { HabitsWidget } from "./habits-widget";
import { ProjectsOverview } from "./projects-overview";
import { RecentNotes } from "./recent-notes";
import { TodaysFocus } from "./todays-focus";

type Tables = Database["public"]["Tables"];

export interface DashboardData {
  projects: ProjectRow[];
  projectRefs: ProjectRef[];
  tasks: TaskRow[];
  goals: Tables["goals"]["Row"][];
  habits: Tables["habits"]["Row"][];
  habitLogs: Tables["habit_logs"]["Row"][];
  notes: Tables["notes"]["Row"][];
  events: Tables["calendar_events"]["Row"][];
  activity: Tables["activity_log"]["Row"][];
  financeSettings: FinanceSettingsRow | null;
  incomeSources: IncomeSourceRow[];
  incomeEntries: IncomeEntryRow[];
  brief: BriefStats;
  suggestions: Suggestion[];
}

/**
 * CSS-driven staggered entrance (animation-delay per cell) — SSR-safe and
 * renders without JavaScript.
 */
function Cell({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-fade-up ${className ?? ""}`}
      style={{ animationDelay: `${60 + index * 55}ms` }}
    >
      {children}
    </div>
  );
}

export function DashboardGrid({ data }: { data: DashboardData }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
      {/* Row 1 */}
      <Cell index={0} className="md:col-span-6 xl:col-span-4">
        <AIDailyBrief brief={data.brief} />
      </Cell>
      <Cell index={1} className="md:col-span-3 xl:col-span-4">
        <TodaysFocus tasks={data.tasks} projects={data.projectRefs} />
      </Cell>
      <Cell index={2} className="md:col-span-3 xl:col-span-4">
        <CalendarWidget events={data.events} />
      </Cell>

      {/* Row 2 */}
      <Cell index={3} className="md:col-span-3 xl:col-span-3">
        <ProjectsOverview projects={data.projects} />
      </Cell>
      <Cell index={4} className="md:col-span-3 xl:col-span-5">
        <FinanceSummary
          settings={data.financeSettings}
          sources={data.incomeSources}
          entries={data.incomeEntries}
        />
      </Cell>
      <Cell index={5} className="flex flex-col gap-5 md:col-span-6 xl:col-span-4">
        <GoalsWidget goals={data.goals} />
        <HabitsWidget habits={data.habits} logs={data.habitLogs} />
      </Cell>

      {/* Row 3 */}
      <Cell index={6} className="md:col-span-3 xl:col-span-3">
        <GitHubActivity />
      </Cell>
      <Cell index={7} className="md:col-span-3 xl:col-span-3">
        <RecentNotes notes={data.notes} />
      </Cell>
      <Cell index={8} className="md:col-span-3 xl:col-span-3">
        <AISuggestions suggestions={data.suggestions} />
      </Cell>
      <Cell index={9} className="md:col-span-3 xl:col-span-3">
        <ActivityFeed items={data.activity} />
      </Cell>
    </div>
  );
}
