import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Styled native select — reliable keyboard/a11y behavior with zero deps. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className={cn("relative inline-flex w-full", className)}>
      <select
        data-slot="select"
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-border bg-input pr-8 pl-3 text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>option]:bg-popover [&>option]:text-foreground",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-subtle-foreground" />
    </span>
  );
}

export { Select };
