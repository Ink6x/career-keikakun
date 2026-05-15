import type {
  CoverageStatus,
  EvidenceMaterialStatus,
  PlanWeekStatus,
  ProviderMode,
  SkillRelationship
} from "@/lib/keikakun/types";

type BadgeKind =
  | CoverageStatus
  | SkillRelationship
  | EvidenceMaterialStatus
  | PlanWeekStatus
  | ProviderMode
  | "process"
  | "required"
  | "preferred";

interface StatusBadgeProps {
  kind: BadgeKind;
  children: React.ReactNode;
}

const styles: Record<BadgeKind, string> = {
  matched: "bg-[#e7f6ec] text-brand-success",
  partial: "bg-[#fff4dc] text-brand-warning",
  missing: "bg-[#fde8e5] text-brand-danger",
  adjacent: "bg-[#fff4dc] text-brand-warning",
  pending: "bg-brand-surface text-brand-muted",
  not_started: "bg-brand-surface text-brand-muted",
  in_progress: "bg-[#fff4dc] text-brand-warning",
  ready: "bg-[#e7f6ec] text-brand-success",
  archived: "bg-brand-surfaceMid text-brand-muted",
  completed: "bg-[#e7f6ec] text-brand-success",
  skipped: "bg-brand-surfaceMid text-brand-muted",
  real: "bg-[#e7f6ec] text-brand-success",
  fallback: "bg-[#fff4dc] text-brand-warning",
  mock: "bg-[#efedff] text-brand-process",
  process: "bg-[#efedff] text-brand-process",
  required: "bg-[#fde8e5] text-brand-danger",
  preferred: "bg-brand-surface text-brand-muted"
};

export function StatusBadge({ kind, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-semibold ${styles[kind]}`}
    >
      {children}
    </span>
  );
}
