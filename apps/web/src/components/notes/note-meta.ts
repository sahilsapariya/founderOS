import {
  FileCode2,
  Lightbulb,
  Scale,
  StickyNote,
  Users,
  type LucideIcon,
} from "lucide-react";

export const noteKindMeta: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  quick: { label: "Quick Note", icon: StickyNote, className: "bg-[#94a3b8]/12 text-[#cbd5e1]" },
  meeting: { label: "Meeting", icon: Users, className: "bg-[#38bdf8]/12 text-[#7dd3fc]" },
  technical: { label: "Technical", icon: FileCode2, className: "bg-[#a78bfa]/12 text-[#c4b5fd]" },
  idea: { label: "Idea", icon: Lightbulb, className: "bg-[#fbbf24]/12 text-[#fcd34d]" },
  decision: { label: "Decision", icon: Scale, className: "bg-[#34d399]/12 text-[#6ee7b7]" },
};
