import { cn } from "@/lib/utils";

/** FounderOS brand mark — an orbiting planet, nodding to the cosmic AI brief. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[10px]",
        "bg-gradient-to-br from-[#7c6af8] via-[#6e62f5] to-[#8b5cf6]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_6px_18px_-6px_rgba(124,106,248,0.7)]",
        className,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="5.2" fill="white" />
        <ellipse
          cx="12"
          cy="12"
          rx="9.4"
          ry="3.4"
          transform="rotate(-24 12 12)"
          stroke="white"
          strokeWidth="1.6"
          opacity="0.85"
        />
        <circle cx="19.6" cy="8.4" r="1.3" fill="white" />
      </svg>
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        FounderOS
      </span>
    </div>
  );
}
