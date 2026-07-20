import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WidgetCardProps {
  title: string;
  icon?: React.ReactNode;
  action?: string;
  actionHref?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Shared dashboard widget chrome — title row, optional "View all" action,
 * and the subtle hover elevation called for in docs/04-ui-layout-specification.md.
 */
export function WidgetCard({
  title,
  icon,
  action,
  actionHref = "#",
  className,
  contentClassName,
  children,
}: WidgetCardProps) {
  return (
    <Card
      className={cn(
        "group/widget relative h-full overflow-hidden",
        "hover:border-border-strong hover:bg-card-elevated",
        "transition-all duration-200",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {action && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-0.5 rounded text-xs font-medium text-subtle-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {action}
            <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover/widget:opacity-100" />
          </Link>
        )}
      </CardHeader>
      <CardContent className={cn("flex flex-col", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
