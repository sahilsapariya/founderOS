import {
  Activity,
  BookOpen,
  Briefcase,
  PiggyBank,
  User,
  type LucideIcon,
} from "lucide-react";

export const goalCategoryMeta: Record<string, { label: string; icon: LucideIcon }> = {
  personal: { label: "Personal", icon: User },
  business: { label: "Business", icon: Briefcase },
  health: { label: "Health", icon: Activity },
  financial: { label: "Financial", icon: PiggyBank },
  learning: { label: "Learning", icon: BookOpen },
};

export function goalProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}
