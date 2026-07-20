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

/**
 * CSS-driven staggered entrance (animation-delay per cell) — SSR-safe and
 * renders without JavaScript, unlike a JS-orchestrated stagger.
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

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-6 xl:grid-cols-12">
      {/* Row 1 */}
      <Cell index={0} className="md:col-span-6 xl:col-span-4">
        <AIDailyBrief />
      </Cell>
      <Cell index={1} className="md:col-span-3 xl:col-span-4">
        <TodaysFocus />
      </Cell>
      <Cell index={2} className="md:col-span-3 xl:col-span-4">
        <CalendarWidget />
      </Cell>

      {/* Row 2 */}
      <Cell index={3} className="md:col-span-3 xl:col-span-3">
        <ProjectsOverview />
      </Cell>
      <Cell index={4} className="md:col-span-3 xl:col-span-5">
        <FinanceSummary />
      </Cell>
      <Cell index={5} className="flex flex-col gap-5 md:col-span-6 xl:col-span-4">
        <GoalsWidget />
        <HabitsWidget />
      </Cell>

      {/* Row 3 */}
      <Cell index={6} className="md:col-span-3 xl:col-span-3">
        <GitHubActivity />
      </Cell>
      <Cell index={7} className="md:col-span-3 xl:col-span-3">
        <RecentNotes />
      </Cell>
      <Cell index={8} className="md:col-span-3 xl:col-span-3">
        <AISuggestions />
      </Cell>
      <Cell index={9} className="md:col-span-3 xl:col-span-3">
        <ActivityFeed />
      </Cell>
    </div>
  );
}
